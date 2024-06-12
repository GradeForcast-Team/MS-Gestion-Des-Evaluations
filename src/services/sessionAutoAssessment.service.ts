import { PrismaClient } from '@prisma/client';
import {Container, Service} from 'typedi';
import {CreateAutoAssessmentDTO} from "@dtos/autoAssessment.dto";
import {AutoAssessmentInterface} from "@interfaces/autoAssessment.interface";
import {QuizzService} from "@services/quizz.service";

@Service()
export class SessionAutoAssessmentService {

  public prisma = new PrismaClient();
  public quizzService = Container.get(QuizzService);
  public async saveSesssionAutoAssessmentAndGetScore(createAutoAssessment: CreateAutoAssessmentDTO[], sessionId: number, learnerId: number) {
    // Sauvegarde des auto-évaluations
    await this.prisma.sessionAutoAssessment.createMany({
      data: createAutoAssessment,
    });

    // Récupération des évaluations pour calculer le score et obtenir des informations supplémentaires
    const evaluations = await this.prisma.sessionAutoAssessment.findMany({
      where: { sessionId, learnerId },
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
            }
          }
        },
        quizz: true
      }
    });


    const total = evaluations.length;
    const masteredCount = evaluations.filter(evaluation => evaluation.mastered).length;
    const { learner, session, quizz } = evaluations[0];
    return {
      total,
      masteredCount,
      score: total ? (masteredCount / total) * 100 : 0,
      student: learner,
      syllabus: session.syllabus,
      teacher: session.syllabus.teacher,
      class: learner.classe,
      ecole: learner.classe.ecole,
      quiz: quizz
    };
  }

  public async getSessionAutoAssessment(sessionId: number, learnerId: number) {
    const evaluations = await this.prisma.sessionAutoAssessment.findMany({
      where: { sessionId, learnerId },
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
            }
          }
        },
        quizz: true
      }
    });


    const total = evaluations.length;
    const masteredCount = evaluations.filter(evaluation => evaluation.mastered).length;
    const { learner, session, quizz } = evaluations[0];
    return {
      total,
      masteredCount,
      score: total ? (masteredCount / total) * 100 : 0,
      student: learner,
      syllabus: session.syllabus,
      teacher: session.syllabus.teacher,
      class: learner.classe,
      ecole: learner.classe.ecole,
      quiz: quizz
    };
  }

  public async getSesssionAutoAssessmentScore(sessionId: number, learnerId: number) {
    const evaluations = await this.prisma.sessionAutoAssessment.findMany({
      where: {sessionId, learnerId},
    });

    const total = evaluations.length;
    const masteredCount = evaluations.filter(evaluation => evaluation.mastered).length;

    return {
      total,
      masteredCount,
      score: total ? (masteredCount / total) * 100 : 0,
    };
  }
  // async  getConceptScoresForLearner(conceptId: number, learnerId: number) {
  //   const concept = await this.prisma.quiz.findUnique({
  //     where: { id: conceptId },
  //     include: {
  //       autoAssessment: {
  //         where: { learnerId: learnerId },
  //       },
  //       learnerAnswer: {
  //         where: { learnerId: learnerId },
  //       },
  //     },
  //   });
  //
  //   if (!concept) {
  //     throw new Error(`Concept with ID ${conceptId} not found`);
  //   }
  //
  //   const autoEvalScore = concept.autoAssessment.length > 0 ? this.quizzService.calculerNoteLearner(conceptId, learnerId) : 0;
  //   const evalScore = concept.evaluations.length > 0 ? concept.evaluations[0].score : 0;
  //   const scoreGap = evalScore - autoEvalScore;
  //
  //   return {
  //     CA: autoEvalScore,
  //     CE: evalScore,
  //     CC: scoreGap,
  //   };
  // }


  async getSessionAutoAssessmentScoresClasseForTeacher(teacherId: number) {
    const classes = await this.prisma.teacherClasse.findMany({
      where: {
        teacherId: teacherId
      },
      include: {
        classe: {
          include: {
            learners: {
              include: {
                conceptAutoAssessment: true
              }
            }
          }
        }
      }
    });

    const scores = classes.map((teacherClasse) => {
      const totalScores = teacherClasse.classe.learners.reduce((acc, learner) => {
        const learnerScores = learner.conceptAutoAssessment.map(ae => ae.mastered ? 1 : 0);
        return acc.concat(learnerScores);
      }, [] as number[]);

      const averageScore = totalScores.length > 0
        ? totalScores.reduce((acc, score) => acc + score, 0) / totalScores.length
        : 0;

      return {
        className: teacherClasse.classe.name,
        averageScore: averageScore
      };
    });

    return scores;
  }

  async getSesssionAutoAssessmentScoresForLearnersInClass(teacherId: number) {
    const classes = await this.prisma.teacherClasse.findMany({
      where: {
        teacherId: teacherId
      },
      include: {
        classe: {
          include: {
            learners: {
              include: {
                user: {
                  select: {
                    name: true,
                    surname: true,
                  },
                },
                sessionAutoAssessment: true
              }
            }
          }
        }
      }
    });

    const scores = classes.map((teacherClasse) => {
      const learnersScores = teacherClasse.classe.learners.map((learner) => {
        const totalScores = learner.sessionAutoAssessment.map(ae => ae.mastered ? 1 : 0);
        const averageScore = totalScores.length > 0
          ? totalScores.reduce((acc, score) => acc + score, 0) / totalScores.length
          : 0;

        return {
          learnerName: `${learner.user.name} ${learner.user.surname}`,
          learnerId: learner.id,
          scores: totalScores,
          averageScore: averageScore
        };
      });

      return {
        className: teacherClasse.classe.name,
        learnersScores: learnersScores
      };
    });

    return scores;
  }

}

