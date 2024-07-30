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

    const conceptAutoAssessment = await this.prisma.conceptAutoAssessment.create({
      data: {
        mastered: mastered,
        learnerId: learnerId,
        conceptId: conceptId,
        optionId: critereId,
        noteCritere: note
      },
      include: {
        learner: {
          include: {
            classe: {
              include: {
                ecole: true
              }
            }
          }
        },
        concept: {
          include: {
            session: {
              include: {
                syllabus: true
              }
            }
          }
        }
      }
    });

    return {
      conceptAutoAssessment,
      class: conceptAutoAssessment.learner.classe,
      syllabus: conceptAutoAssessment.concept.session.syllabus
    };
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

  // Auto-évaluation pour la session
  public async saveSessionAutoAssessment(sessionId: number, learnerId: number, assessments: { conceptId: number; optionId: number; }[]): Promise<any> {
    const getNoteFromCriteria = (optionId: number) => {
      switch (optionId) {
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
      const { conceptId, optionId } = assessment;
      const note = getNoteFromCriteria(optionId);
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
            optionId: optionId,
            noteCritere: note,
          },
        });
      } else {
        conceptAutoAssessment = await this.prisma.conceptAutoAssessment.create({
          data: {
            mastered: mastered,
            learnerId: learnerId,
            conceptId: conceptId,
            optionId: optionId,
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
              session: {
                include: {
                  syllabus: true
                }
              }
            }
          },
          option: true
        }
      });

      if (!autoAssessment) {
        throw new HttpException(404, 'Concept auto-assessment not found');
      }

      return {
        autoassessment: {
          mastered: autoAssessment.mastered,
          learnerId: autoAssessment.learnerId,
          conceptId: autoAssessment.conceptId,
          optionId: autoAssessment.optionId,
          noteCritere: autoAssessment.noteCritere
        },
        learnerAnswerAutoEvaluation: {
          concept: autoAssessment.concept,
          criteria: autoAssessment.option
        },
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
        session: autoAssessment.concept.session,
        syllabus: autoAssessment.concept.session.syllabus
      };
    } catch (error) {
      console.error('Error getting concept auto-assessment details:', error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  // Fonction pour obtenir toutes les informations des auto-evalution pour un learner 

  // public async getAllAutoAssessmentsByLearner(learnerId: number) {
  //   console.log("learnerID",learnerId)
  //   try {
  //     const autoAssessments = await this.prisma.conceptAutoAssessment.findMany({
  //       where: {
  //         learnerId:learnerId
  //       },
  //       include: {
  //         learner: {
  //           include: {
  //             user: true,
  //             classe: {
  //               include: {
  //                 ecole: true
  //               }
  //             }
  //           }
  //         },
  //         concept: {
  //           include: {
  //             session: {
  //               include: {
  //                 syllabus: true
  //               }
  //             }
  //           }
  //         },
  //         option: true
  //       }
  //     });

  //     if (!autoAssessments || autoAssessments.length === 0) {
  //       throw new HttpException(404, 'No auto-assessments found for this learner');
  //     }

  //     return autoAssessments.map(autoAssessment => ({
  //       autoassessment: {
  //         mastered: autoAssessment.mastered,
  //         learnerId: autoAssessment.learnerId,
  //         conceptId: autoAssessment.conceptId,
  //         optionId: autoAssessment.optionId,
  //         noteCritere: autoAssessment.noteCritere
  //       },
  //       learnerAnswerAutoEvaluation: {
  //         concept: autoAssessment.concept,
  //         optionId: autoAssessment.option
  //       },
  //       student: {
  //         id: autoAssessment.learner.user.id,
  //         name: autoAssessment.learner.user.name,
  //         surname: autoAssessment.learner.user.surname,
  //         email: autoAssessment.learner.user.email
  //       },
  //       class: {
  //         id: autoAssessment.learner.classe?.id,
  //         name: autoAssessment.learner.classe?.name
  //       },
  //       ecole: autoAssessment.learner.classe?.ecole,
  //       session: autoAssessment.concept.session,
  //       syllabus: autoAssessment.concept.session.syllabus
  //     }));
  //   } catch (error) {
  //     console.error('Error getting all auto-assessments for learner:', error);
  //     throw new HttpException(404,' No auto-assessments found for this learner');
  //   }
  // }

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
          concept: {
            include: {
              session: {
                include: {
                  syllabus: true
                }
              }
            }
          },
          option: true
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
          optionId: assessment.optionId,
          noteCritere: assessment.noteCritere
        })),
        learnerAnswerAutoEvaluation: sessionAutoAssessments.map(assessment => ({
          concept: {
            id: assessment.concept.id,
            name: assessment.concept.name,
            sessionId: assessment.concept.sessionId
          },
          criteria: {
            id: assessment.option.id,
            name: assessment.option.name
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
        ecole: firstAssessment.learner.classe?.ecole,
        session: firstAssessment.concept.session,
        syllabus: firstAssessment.concept.session.syllabus
      };
    } catch (error) {
      console.error('Error getting session auto-assessment details:', error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }
  
  
  public async generateAutoAssessmentLink(sessionId: number, teacherId: number, schoolId: number): Promise<string> {
    const baseUrl = 'http://localhost:4200/assessment/self-assessment-form';
    const link = `${baseUrl}?sessionId=${sessionId}&teacherId=${teacherId}&schoolId=${schoolId}`;
  
    return link;
  }
  
  public async getAutoAssessmentLink(sessionId: number, teacherId: number, schoolId: number): Promise<any> {
    // const link = await this.generateAutoAssessmentLink(sessionId, teacherId, schoolId);
  
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
            syllabusClasse: {
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
        concept: true
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
  
    const syllabusClasse = session.syllabus.syllabusClasse.find(sc => sc.classe.ecole.id === schoolId);
  
    if (!syllabusClasse) {
      throw new HttpException(404, 'School not found for this session');
    }
  
    return {
      // link: link,
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
          id: syllabusClasse.classe.ecole.id,
          name: syllabusClasse.classe.ecole.name,
          telephone: syllabusClasse.classe.ecole.telephone,
        },
        classe: {
          id: syllabusClasse.classe.id,
          name: syllabusClasse.classe.name,
        }
      },
      teacher: {
        id: teacher.user.id,
        name: teacher.user.name,
        surname: teacher.user.surname,
        email: teacher.user.email,
      },
    };
  }
  
  private async validateLearner(learnerId: number) {
    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) throw new HttpException(404, 'Learner not found');
    return learner;
  }

  private async validateConcept(conceptId: number) {
    const concept = await this.prisma.concept.findUnique({ where: { id: conceptId } });
    if (!concept) throw new HttpException(404, 'Concept not found');
    return concept;
  }

  public async listAllAutoAssessments(learnerId: number) {
    await this.validateLearner(learnerId);
  
    const autoEvaluations = await this.prisma.conceptAutoAssessment.findMany({
      where: { learnerId },
      include: {
        learner: {
          include: {
            user: true,
            classe: {
              include: {
                ecole: true,
              },
            },
          },
        },
        concept: {
          include: {
            session: {
              include: {
                syllabus: {
                  include: {
                    teacher: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
                concept: true,
              },
            },
          },
        },
        option: true,
      },
    });
  
    if (autoEvaluations.length === 0) {
      throw new HttpException(404, 'No auto-assessments found for this learner');
    }
  
    const sessionScores = autoEvaluations.reduce((acc, assessment) => {
      const sessionId = assessment.concept.session.id;
      const note = assessment.noteCritere;
  
      if (!acc[sessionId]) {
        acc[sessionId] = {
          totalNote: 0,
          count: 0,
          totalConcepts: assessment.concept.session.concept.length,
        };
      }
  
      acc[sessionId].totalNote += note;
      acc[sessionId].count += 1;
  
      return acc;
    }, {});
  
    const sessionsWithScores = Object.keys(sessionScores).map(sessionId => {
      const { totalNote, count, totalConcepts } = sessionScores[sessionId];
      const sessionScore = (totalNote / totalConcepts) * 100;
      return {
        sessionId: Number(sessionId),
        totalNote,
        count,
        totalConcepts,
        sessionScore,
      };
    });
  
    const response = {
      data: {
        learner: {
          id: autoEvaluations[0].learner.id,
          user: {
            id: autoEvaluations[0].learner.user.id,
            name: autoEvaluations[0].learner.user.name,
            surname: autoEvaluations[0].learner.user.surname,
            email: autoEvaluations[0].learner.user.email,
          },
          est_membre: autoEvaluations[0].learner.est_membre,
          classe: autoEvaluations[0].learner.classe ? {
            id: autoEvaluations[0].learner.classe.id,
            name: autoEvaluations[0].learner.classe.name,
          } : null,
          school: autoEvaluations[0].learner.classe?.ecole ? {
            id: autoEvaluations[0].learner.classe.ecole.id,
            name: autoEvaluations[0].learner.classe.ecole.name,
            telephone: autoEvaluations[0].learner.classe.ecole.telephone,
          } : null,
        },
        listeAutoAssessments: autoEvaluations.map(autoAssessment => {
          const sessionScore = sessionsWithScores.find(score => score.sessionId === autoAssessment.concept.session.id)?.sessionScore;
  
          return {
            autoAssessment: {
              mastered: autoAssessment.mastered,
              noteCritere: autoAssessment.noteCritere,
              critereAttribue: autoAssessment.option.name,
            },
            concept: {
              id: autoAssessment.concept.id,
              name: autoAssessment.concept.name,
            },
            session: {
              id: autoAssessment.concept.session.id,
              name: autoAssessment.concept.session.name,
              sessionScore,
            },
            classe: {
              id: autoAssessment.learner.classe?.id,
              name: autoAssessment.learner.classe?.name,
            },
            syllabus: autoAssessment.concept.session.syllabus ? {
              id: autoAssessment.concept.session.syllabus.id,
              name: autoAssessment.concept.session.syllabus.name,
              teacher: {
                id: autoAssessment.concept.session.syllabus.teacher.id,
                name: autoAssessment.concept.session.syllabus.teacher.user.name,
                surname: autoAssessment.concept.session.syllabus.teacher.user.surname,
                email: autoAssessment.concept.session.syllabus.teacher.user.email,
              },
            } : null,
          };
        }),
        classe: {
          id: autoEvaluations[0].learner.classe?.id,
          name: autoEvaluations[0].learner.classe?.name,
        },
        school: autoEvaluations[0].learner.classe?.ecole ? {
          id: autoEvaluations[0].learner.classe.ecole.id,
          name: autoEvaluations[0].learner.classe.ecole.name,
          telephone: autoEvaluations[0].learner.classe.ecole.telephone,
        } : null,
        teacher: {
          id: autoEvaluations[0].concept.session.syllabus.teacher.id,
          name: autoEvaluations[0].concept.session.syllabus.teacher.user.name,
          surname: autoEvaluations[0].concept.session.syllabus.teacher.user.surname,
          email: autoEvaluations[0].concept.session.syllabus.teacher.user.email,
        },
      }
    };
  
    return response;
  }
  
  

  

  public async listAllAutoAssessmentsByLearnerForSession(learnerId: number, sessionId: number) {
    await this.validateLearner(learnerId);
  
    const autoAssessments = await this.prisma.conceptAutoAssessment.findMany({
      where: {
        learnerId,
        concept: {
          sessionId
        }
      },
      include: {
        learner: {
          include: {
            user: true,
            classe: {
              include: {
                ecole: true,
              },
            },
          },
        },
        concept: {
          include: {
            session: {
              include: {
                syllabus: {
                  include: {
                    teacher: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
                concept: true,
              },
            },
          },
        },
        option: true,
      },
    });
  
    if (autoAssessments.length === 0) {
      throw new HttpException(404, 'No auto-assessments found for this learner in the session');
    }
  
    const sessionTotalNote = autoAssessments.reduce((total, assessment) => total + assessment.noteCritere, 0);
    const sessionScore = (sessionTotalNote / autoAssessments.length) * 100;
  
    const firstAssessment = autoAssessments[0];
  
    return autoAssessments.map(autoAssessment => ({
      autoassessment: {
        mastered: autoAssessment.mastered,
        learnerId: autoAssessment.learnerId,
        conceptId: autoAssessment.conceptId,
        optionId: autoAssessment.optionId,
        noteCritere: autoAssessment.noteCritere,
      },
      learnerAnswerAutoEvaluation: {
        concept: autoAssessment.concept,
        option: autoAssessment.option,
      },
      student: {
        id: autoAssessment.learner.user.id,
        name: autoAssessment.learner.user.name,
        surname: autoAssessment.learner.user.surname,
        email: autoAssessment.learner.user.email,
      },
      class: {
        id: autoAssessment.learner.classe?.id,
        name: autoAssessment.learner.classe?.name,
      },
      ecole: autoAssessment.learner.classe?.ecole,
      session: {
        id: autoAssessment.concept.session.id,
        name: autoAssessment.concept.session.name,
        startDate: autoAssessment.concept.session.startDate,
        endDate: autoAssessment.concept.session.endDate,
        concepts: autoAssessment.concept.session.concept.map(concept => ({
          id: concept.id,
          name: concept.name,
        })),
        sessionScore,
      },
      syllabus: {
        id: autoAssessment.concept.session.syllabus.id,
        name: autoAssessment.concept.session.syllabus.name,
        teacher: {
          id: autoAssessment.concept.session.syllabus.teacher.id,
          name: autoAssessment.concept.session.syllabus.teacher.user.name,
          surname: autoAssessment.concept.session.syllabus.teacher.user.surname,
          email: autoAssessment.concept.session.syllabus.teacher.user.email,
        },
        school: {
          id: autoAssessment.learner.classe?.ecole.id,
          name: autoAssessment.learner.classe?.ecole.name,
          telephone: autoAssessment.learner.classe?.ecole.telephone,
        },
        classe: {
          id: autoAssessment.learner.classe?.id,
          name: autoAssessment.learner.classe?.name,
        }
      },
    }));
  }
  
  
  private getNoteFromCriteria(critereId: number): number {
    console.log(`Getting note for criteria ID: ${critereId}`);
    switch (critereId) {
      case 1: return 0;
      case 2: return 0.20;
      case 3: return 0.40;
      case 4: return 0.60;
      case 5: return 0.80;
      case 6: return 0.90;
      case 7: return 1;
      default: throw new Error('Critère invalide');
    }
  }

  public async getAllAutoAssessmentsByLe(learnerId: number) {
    console.log("learnerID", learnerId);
    await this.validateLearner(learnerId);
  
    const autoAssessments = await this.prisma.conceptAutoAssessment.findMany({
      where: {
        learnerId: learnerId
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
            session: {
              include: {
                syllabus: {
                  include: {
                    teacher: {
                      include: {
                        user: true
                      }
                    }
                  }
                },
                concept: true // Include concepts of the session
              }
            }
          }
        },
        option: true
      }
    });
  
    if (!autoAssessments || autoAssessments.length === 0) {
      throw new HttpException(404, 'No auto-assessments found for this learner');
    }
  
    const sessionScores = autoAssessments.reduce((acc, assessment) => {
      const sessionId = assessment.concept.session.id;
      const note = assessment.noteCritere;
  
      if (!acc[sessionId]) {
        acc[sessionId] = { totalNote: 0, count: 0, totalConcepts: assessment.concept.session.concept.length };
      }
  
      acc[sessionId].totalNote += note;
      acc[sessionId].count += 1;
  
      return acc;
    }, {});
  
    const sessionsWithScores = Object.keys(sessionScores).map(sessionId => {
      const { totalNote, count, totalConcepts } = sessionScores[sessionId];
      const sessionScore = count === totalConcepts ? (totalNote / totalConcepts) * 100 : null;
      return {
        sessionId: Number(sessionId),
        totalNote,
        count,
        totalConcepts,
        sessionScore
      };
    });
  
    return autoAssessments.map(autoAssessment => {
      const sessionScore = sessionsWithScores.find(score => score.sessionId === autoAssessment.concept.session.id)?.sessionScore;
  
      return {
        autoassessment: {
          mastered: autoAssessment.mastered,
          learnerId: autoAssessment.learnerId,
          conceptId: autoAssessment.conceptId,
          optionId: autoAssessment.optionId,
          noteCritere: autoAssessment.noteCritere,
        },
        learnerAnswerAutoEvaluation: {
          concept: autoAssessment.concept,
          option: autoAssessment.option,
        },
        student: {
          id: autoAssessment.learner.user.id,
          name: autoAssessment.learner.user.name,
          surname: autoAssessment.learner.user.surname,
          email: autoAssessment.learner.user.email,
        },
        class: {
          id: autoAssessment.learner.classe?.id,
          name: autoAssessment.learner.classe?.name,
        },
        ecole: autoAssessment.learner.classe?.ecole,
        session: {
          id: autoAssessment.concept.session.id,
          name: autoAssessment.concept.session.name,
          startDate: autoAssessment.concept.session.startDate,
          endDate: autoAssessment.concept.session.endDate,
          concepts: autoAssessment.concept.session.concept.map((concept) => ({
            id: concept.id,
            name: concept.name,
          })),
          sessionScore: sessionScore
        },
        syllabus: {
          id: autoAssessment.concept.session.syllabus.id,
          name: autoAssessment.concept.session.syllabus.name,
          teacher: {
            id: autoAssessment.concept.session.syllabus.teacher.id,
            name: autoAssessment.concept.session.syllabus.teacher.user.name,
            surname: autoAssessment.concept.session.syllabus.teacher.user.surname,
            email: autoAssessment.concept.session.syllabus.teacher.user.email,
          },
          school: {
            id: autoAssessment.learner.classe?.ecole.id,
            name: autoAssessment.learner.classe?.ecole.name,
            telephone: autoAssessment.learner.classe?.ecole.telephone,
          },
          classe: {
            id: autoAssessment.learner.classe?.id,
            name: autoAssessment.learner.classe?.name,
          }
        },
      };
    });
  }
  
  
}