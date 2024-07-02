import { PrismaClient } from '@prisma/client';
import {Container, Service} from 'typedi';
import {HttpException} from "@exceptions/HttpException";

@Service()
export class ConceptAutoAssessmentService {

  public prisma = new PrismaClient();
// Auto Evaluation d'un concept
  public async saveConceptAutoAssessment(conceptId, learnerId, critereId) {
    const getNoteFromCriteria = (critereId) => {
      switch (critereId) {
        case 1:
          return 0; // Pas du tout compris
        case 2:
          return 0.20; // Très peu compris
        case 3:
          return 0.40; // Peu compris
        case 4:
          return 0.60; // Moyennement compris
        case 5:
          return 0.80; // Bien compris
        case 6:
          return 0.90; // Très bien compris
        case 7:
          return 1; // Complètement compris
        default:
          throw new Error('Critère invalide');
      }
    };
    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      throw new HttpException(404, 'Learner not found');
    }

    const concept = await this.prisma.concept.findUnique({ where: { id: conceptId } });
    if (!concept) {
      throw new HttpException(404, 'Concept not found');
    }

    const note = getNoteFromCriteria(critereId);
    const mastered = note >= 6;
    const conceptAutoAssessment= await this.prisma.conceptAutoAssessment.create({
      data: {
        mastered: mastered,
        learnerId: learnerId,
        conceptId: conceptId,
        criteriaId: critereId,
        noteCritere: note
      }})
    return conceptAutoAssessment
  }
  // Get resultat de l'auto evaluation
  public async getConceptAutoAssessment(conceptId: number, learnerId: number) {
    const assessment = await this.prisma.conceptAutoAssessment.findFirst({
      where: {
          conceptId: conceptId,
          learnerId: learnerId,
      },
    });

    if (!assessment) {
      throw new HttpException(404, 'ConceptAutoAssessment not found');
    }

    return assessment.noteCritere;
  }

  // Autot-evaluation pour la session
 
  public async saveSessionAutoAssessment(sessionId: number, learnerId: number, assessments: { conceptId: number; criteriaId: number; }[]): Promise<any> {
    const getNoteFromCriteria = (criteriaId: number) => {
      switch (criteriaId) {
        case 1:
          return 0; // Pas du tout compris
        case 2:
          return 0.20; // Très peu compris
        case 3:
          return 0.40; // Peu compris
        case 4:
          return 0.60; // Moyennement compris
        case 5:
          return 0.80; // Bien compris
        case 6:
          return 0.90; // Très bien compris
        case 7:
          return 1; // Complètement compris
        default:
          throw new Error('Critère invalide');
      }
    };
  
    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      throw new HttpException(404, 'Learner not found');
    }
  
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new HttpException(404, 'Session not found');
    }
  
    const concepts = await this.prisma.concept.findMany({ where: { sessionId: sessionId } });
    if (!concepts || concepts.length === 0) {
      throw new HttpException(404, 'No concepts found for this session');
    }
  
    const assessmentsResults = [];
    let totalNote = 0;
  
    for (const assessment of assessments) {
      const { conceptId, criteriaId } = assessment;
      const note = getNoteFromCriteria(criteriaId);
      const mastered = note >= 0.6;
  
      const existingAssessment = await this.prisma.conceptAutoAssessment.findUnique({
        where: {
          unique_concept_assessment: {
            conceptId: conceptId,
            learnerId: learnerId,
          },
        },
      });
  
      let conceptAutoAssessment;
      if (existingAssessment) {
        conceptAutoAssessment = await this.prisma.conceptAutoAssessment.update({
          where: {
            unique_concept_assessment: {
              conceptId: conceptId,
              learnerId: learnerId,
            },
          },
          data: {
            mastered: mastered,
            criteriaId: criteriaId,
            noteCritere: note,
          },
        });
      } else {
        conceptAutoAssessment = await this.prisma.conceptAutoAssessment.create({
          data: {
            mastered: mastered,
            learnerId: learnerId,
            conceptId: conceptId,
            criteriaId: criteriaId,
            noteCritere: note,
          },
        });
      }
  
      assessmentsResults.push(conceptAutoAssessment);
      totalNote += note;
    }
  
    const sessionNote = (totalNote / assessments.length) * 100;
  
    return {
      assessments: assessmentsResults,
      sessionNote,
    };
  }
  
   // Fonction pour obtenir les informations d'une auto-évaluation pour un concept
   public async getConceptAutoAssessmentDetails(learnerId: number, conceptId: number) {
    try {
      const autoAssessment = await this.prisma.conceptAutoAssessment.findFirst({
        where: {
          learnerId,
          conceptId
        },
        include: {
          learner: {
            include: {
              user: true,
              classe: {
                include: {
                  ecole: true
                }
              }
            }
          },
          concept: {
            include: {
              session: true
            }
          },
          criteria: true
        }
      });

      if (!autoAssessment) {
        throw new HttpException(404, 'Concept auto-assessment not found');
      }

      return {
        autoassessment: [
          {
            mastered: autoAssessment.mastered,
            learnerId: autoAssessment.learnerId,
            conceptId: autoAssessment.conceptId,
            criteriaId: autoAssessment.criteriaId,
            noteCritere: autoAssessment.noteCritere
          }
        ],
        learnerAnswerAutoEvaluation: [{
          concept: autoAssessment.concept,
          criteria: autoAssessment.criteria
        }],
        student: {
          id: autoAssessment.learner.user.id,
          name: autoAssessment.learner.user.name,
          surname: autoAssessment.learner.user.surname,
          email: autoAssessment.learner.user.email
        },
        class: {
          id: autoAssessment.learner.classe?.id,
          name: autoAssessment.learner.classe?.name
        },
        ecole: autoAssessment.learner.classe?.ecole,
        session: autoAssessment.concept.session
      };
    } catch (error) {
      console.error('Error getting concept auto-assessment details:', error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  // Fonction pour obtenir les informations d'une auto-évaluation pour une session
  public async getSessionAutoAssessmentDetails(learnerId: number, sessionId: number) {
    try {
      const sessionAutoAssessments = await this.prisma.conceptAutoAssessment.findMany({
        where: {
          learnerId,
          concept: {
            sessionId: sessionId
          }
        },
        include: {
          learner: {
            include: {
              user: true,
              classe: {
                include: {
                  ecole: true
                }
              }
            }
          },
          concept: true,
          criteria: true
        }
      });

      if (sessionAutoAssessments.length === 0) {
        throw new HttpException(404, 'No concept auto-assessments found for this session');
      }

      const firstAssessment = sessionAutoAssessments[0];

      return {
        autoassessment: sessionAutoAssessments.map(assessment => ({
          mastered: assessment.mastered,
          learnerId: assessment.learnerId,
          conceptId: assessment.conceptId,
          criteriaId: assessment.criteriaId,
          noteCritere: assessment.noteCritere
        })),
        learnerAnswerAutoEvaluation: sessionAutoAssessments.map(assessment => ({
          concept: {
            id: assessment.concept.id,
            name: assessment.concept.name,
            sessionId: assessment.concept.sessionId
          },
          criteria: {
            id: assessment.criteria.id,
            name: assessment.criteria.name
          }
        })),
        student: {
          id: firstAssessment.learner.user.id,
          name: firstAssessment.learner.user.name,
          surname: firstAssessment.learner.user.surname,
          email: firstAssessment.learner.user.email
        },
        class: {
          id: firstAssessment.learner.classe?.id,
          name: firstAssessment.learner.classe?.name
        },
        ecole: firstAssessment.learner.classe?.ecole
      };
    } catch (error) {
      console.error('Error getting session auto-assessment details:', error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  // public async generateAutoAssessmentLink(sessionId: number, teacherId: number): Promise<string> {
  //   console.log("generation")
  //   const session = await this.prisma.session.findUnique({
  //     where: { id: sessionId },
  //     include: {
  //       syllabus: {
  //         include: {
  //           classe: {
  //             include: {
  //               classe: {
  //                 include: {
  //                   ecole: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  
  //   if (!session) {
  //     throw new HttpException(404, 'Session not found');
  //   }
  
  //   const schoolId = session.syllabus.classe[0].classe.ecole.id;
  //   const baseUrl = 'http://localhost:4200/assessment/self-assessment-form';
  //   const link = `${baseUrl}?sessionId=${sessionId}&teacherId=${teacherId}&schoolId=${schoolId}`;
  
  //   return link;
  // }
  
  public async generateAutoAssessmentLink(sessionId: number, teacherId: number, schoolId: number): Promise<string> {
    const baseUrl = 'http://localhost:4200/assessment/self-assessment-form';
    const link = `${baseUrl}?sessionId=${sessionId}&teacherId=${teacherId}&schoolId=${schoolId}`;
  
    return link;
  }
  
  // public async getAutoAssessmentLink(sessionId: number, teacherId: number): Promise<any> {
  //   const link = await this.generateAutoAssessmentLink(sessionId, teacherId);
  //   console.log("error")
  //   const session = await this.prisma.session.findUnique({
  //     where: { id: sessionId },
  //     include: {
  //       syllabus: {
  //         include: {
  //           teacher: {
  //             include: {
  //               user: true,
  //             },
  //           },
  //           classe: {
  //             include: {
  //               classe: {
  //                 include: {
  //                   ecole: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       concept: true
  //     },
  //   });
  
  //   if (!session) {
  //     throw new HttpException(404, 'Session not found');
  //   }
  
  //   const teacher = await this.prisma.teacher.findUnique({
  //     where: { id: teacherId },
  //     include: {
  //       user: true,
  //     },
  //   });
  
  //   if (!teacher) {
  //     throw new HttpException(404, 'Teacher not found');
  //   }
  
  //   const school = session.syllabus.classe[0].classe.ecole;
  
  //   return {
  //     link: link,
  //     session: {
  //       id: session.id,
  //       name: session.name,
  //       startDate: session.startDate,
  //       endDate: session.endDate,
  //       concepts: session.concept.map((concept) => ({
  //         id: concept.id,
  //         name: concept.name,
  //         })),
  //       },
  //     syllabus: {
  //       id: session.syllabus.id,
  //       name: session.syllabus.name,
  //       school: {
  //         id: school.id,
  //         name: school.name,
  //         telephone: school.telephone,
  //       },
  //     },
  //     teacher: {
  //       id: teacher.user.id,
  //       name: teacher.user.name,
  //       surname: teacher.user.surname,
  //       email: teacher.user.email,
  //     },
  //   };
  // }
  
  public async getAutoAssessmentLink(sessionId: number, teacherId: number, schoolId: number): Promise<any> {
    const link = await this.generateAutoAssessmentLink(sessionId, teacherId, schoolId);
  
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        syllabus: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
            classe: {
              include: {
                classe: {
                  include: {
                    ecole: true,
                  },
                },
              },
            },
          },
        },
        concept:true
      },
    });
  
    if (!session) {
      throw new HttpException(404, 'Session not found');
    }
  
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true,
      },
    });
  
    if (!teacher) {
      throw new HttpException(404, 'Teacher not found');
    }
  
    const school = session.syllabus.classe[0].classe.ecole;
  
    if (school.id !== schoolId) {
      throw new HttpException(404, 'School not found for this session');
    }
  
    return {
      link: link,
      session: {
        id: session.id,
        name: session.name,
        startDate: session.startDate,
        endDate: session.endDate,
        concepts: session.concept.map((concept) => ({
          id: concept.id,
          name: concept.name,
        })),
      },
      syllabus: {
        id: session.syllabus.id,
        name: session.syllabus.name,
        teacher: {
          id: session.syllabus.teacher.id,
          name: session.syllabus.teacher.user.name,
          surname: session.syllabus.teacher.user.surname,
          email: session.syllabus.teacher.user.email,
        },
        school: {
          id: school.id,
          name: school.name,
          telephone: school.telephone,
        },
      },
      teacher: {
        id: teacher.user.id,
        name: teacher.user.name,
        surname: teacher.user.surname,
        email: teacher.user.email,
      },
    };
  }
  
  
}