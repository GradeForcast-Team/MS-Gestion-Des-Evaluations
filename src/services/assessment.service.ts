import { PrismaClient } from '@prisma/client';
import {Session} from "@interfaces/session.interface";
import {Container, Service} from "typedi";
import {QuizzService} from "@services/quizz.service";
import {ConceptAutoAssessmentService} from "@services/conceptAutoAssessment.service";
import { HttpException } from '@/exceptions/HttpException';
import NodeCache from 'node-cache';

// Déclarations des Types
type ConceptScore = {
  score: number;
  totalQuestions: number;
  sessionId: number;
  conceptName: string;
  sessionName: string;// Ajouter cette ligne pour inclure le nom de la session
};

type SessionScore = {
  score: number;
  totalConcepts: number;
  sessionName: string;
  scorePercentage?: number;
};

type QuizDetail = {
  quizId: number;
  questions: {
    question: string;
    propositions: { id: number; valeur: string }[];
    learnerAnswer: string | null;
    correctAnswer: string | null;
    isCorrect: boolean;
  }[];
};
@Service()
export class AssessmentService {
  public quizzService = Container.get(QuizzService);
  public conceptAutoAssessment = Container.get(ConceptAutoAssessmentService);
  // private prisma = new PrismaClient();
  // private prisma = new PrismaClient({
  //   log: ['query', 'info', 'warn', 'error']
  // });
  private prisma = new PrismaClient();
  private quizz = this.prisma.quiz;
  private learnerAnswer = this.prisma.learnerAnswer;
  private answer = this.prisma.answer;
  private question = this.prisma.question;
  private concept = this.prisma.concept;
  private cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // TTL of 10 minutes and check expired keys every 2 minutes

  //Fonction pour calculer l'evaluation d'un concept on prend tout les quizz et on fait une moyenne

  public async calculateConceptAssessment(learnerId: number, conceptId: number) {
    try {
      const quizzes = await this.quizz.findMany({ where: { conceptId } });

      if (quizzes.length === 0) {
        throw new Error('No quizzes found for this concept');
      }

      let totalScore = 0;
      let totalQuestions = 0;

      for (const quiz of quizzes) {
        const learnerAnswers = await this.learnerAnswer.findMany({
          where: { learnerId, quizId: quiz.id },
          include: {
            proposition: { include: { question: true } },
          },
        });

        if (learnerAnswers.length === 0) {
          throw new Error(`No answers found for learner ${learnerId} in quiz ${quiz.id}`);
        }

        const questionIds = learnerAnswers.map(answer => answer.questionId);
        const correctAnswers = await this.answer.findMany({ where: { questionId: { in: questionIds } } });

        const correctAnswerMap = correctAnswers.reduce((acc, answer) => {
          acc[answer.questionId] = answer.valeur;
          return acc;
        }, {});

        let quizScore = 0;
        for (const answer of learnerAnswers) {
          const correctValue = correctAnswerMap[answer.questionId];
          if (correctValue !== undefined && answer.proposition.numbQuestion === correctValue) {
            quizScore++;
          }
        }

        const quizTotalQuestions = await this.question.count({ where: { quizId: quiz.id } });

        totalScore += quizScore;
        totalQuestions += quizTotalQuestions;
        console.log(totalScore,totalQuestions)
      }

      if (totalQuestions === 0) {
        throw new Error('No questions found for the concept quizzes');
      }

      const overallScorePercentage = (totalScore / totalQuestions) * 100;
      return overallScorePercentage;
    } catch (error) {
      console.error('Error calculating concept evaluation score:', error);
      throw error;
    }
  }

 // Calculer la note d'evaluation d'une session 
  public async calculateSessionAssessment(learnerId: number, sessionId: number) {
    try {
      // Obtenez tous les concepts pour la session donnée
      const concepts = await this.concept.findMany({ where: { sessionId } });
  
      if (concepts.length === 0) {
        throw new Error('No concepts found for this session');
      }
  
      let totalConceptScore = 0;
      let totalConcepts = 0;
  
      // Parcourez chaque concept et calculez la note
      for (const concept of concepts) {
        const conceptScore = await this.calculateConceptAssessment(learnerId, concept.id);
  
        totalConceptScore += conceptScore;
        totalConcepts++;
      }
  
      if (totalConcepts === 0) {
        throw new Error('No concepts found for the session');
      }
  
      // Calculez la moyenne des scores des concepts
      const averageConceptScore = totalConceptScore / totalConcepts;
      return averageConceptScore;
    } catch (error) {
      console.error('Error calculating session evaluation score:', error);
      throw error;
    }
  }

  // Voir les informations d'une evaluation

  // public async getLink(learnerId: number, conceptId: number) {
  //   try {
  //     const quizzes = await this.prisma.quiz.findMany({
  //       where: { conceptId },
  //       include: {
  //         questions: {
  //           include: {
  //             propositions: true,
  //             answer: true,
  //             learnerAnswer: {
  //               where: { learnerId },
  //               include: {
  //                 proposition: true,
  //                 learner: {
  //                   include: {
  //                     classe: {
  //                       include: {
  //                         ecole: true
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         concept: {
  //           include: {
  //             session: {
  //               include: {
  //                 syllabus: {
  //                   include: {
  //                     teacher: {
  //                       include: {
  //                         user: true,
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     });

  //     if (quizzes.length === 0) {
  //       throw new HttpException(404, 'No quizzes found for this concept');
  //     }

  //     const detailedQuizzes = quizzes.map(quiz => {
  //       return {
  //         ...quiz,
  //         questions: quiz.questions.map(question => {
  //           return {
  //             ...question,
  //             learnerAnswer: question.learnerAnswer.map(answer => {
  //               return {
  //                 ...answer,
  //                 class: answer.learner.classe,
  //                 ecole: answer.learner.classe?.ecole,
  //                 syllabus: quiz.concept.session.syllabus,
  //                 teacher: {
  //                   id: quiz.concept.session.syllabus.teacher.id,
  //                   name: quiz.concept.session.syllabus.teacher.user.name,
  //                   surname: quiz.concept.session.syllabus.teacher.user.surname,
  //                   email: quiz.concept.session.syllabus.teacher.user.email,
  //                 }
  //               };
  //             })
  //           };
  //         })
  //       };
  //     });

  //     return detailedQuizzes;
  //   } catch (error) {
  //     console.error('Error getting evaluation details:', error);
  //     throw new HttpException(500, 'Internal Server Error');
  //   }
  // }
  
  public async getLink(learnerId: number, conceptId: number) {
    try {
      // Récupérer les quizzes associés au concept
      const quizzes = await this.prisma.quiz.findMany({
        where: { conceptId },
        include: {
          questions: {
            include: {
              propositions: true,
              answer: true,
            }
          },
          concept: {
            include: {
              session: {
                include: {
                  syllabus: {
                    include: {
                      teacher: {
                        include: { user: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
  
      if (quizzes.length === 0) throw new HttpException(404, 'No quizzes found for this concept');
  
      // Détails des quizzes
      const detailedQuizzes = quizzes.map(quiz => {
        return {
          ...quiz,
          questions: quiz.questions.map(question => {
            return {
              ...question,
              propositions: question.propositions,
              answer: question.answer
            };
          })
        };
      });
  
      // Récupérer les informations du concept, de la session, du syllabus et de l'enseignant
      const concept = quizzes[0].concept;
      const session = concept.session;
      const syllabus = session.syllabus;
      const teacher = syllabus.teacher;
  
      // Récupérer les informations de l'apprenant, de sa classe et de son école
      const learner = await this.prisma.learner.findUnique({
        where: { id: learnerId },
        include: {
          user: true,
          classe: {
            include: {
              ecole: true,
            },
          },
        },
      });
  
      if (!learner) throw new HttpException(404, 'Learner not found');
  
      // Préparer la réponse avec toutes les informations demandées
      const response = {
        learner: {
          id: learner.id,
          name: learner.user.name,
          surname: learner.user.surname,
          email: learner.user.email,
        },
        class: learner.classe,
        school: learner.classe?.ecole,
        detailedQuizzes,
        concept: {
          id: concept.id,
          name: concept.name,
        },
        session: {
          id: session.id,
          name: session.name,
        },
        syllabus: {
          id: syllabus.id,
          name: syllabus.name,
          teacher: {
            id: teacher.id,
            name: teacher.user.name,
            surname: teacher.user.surname,
            email: teacher.user.email,
          }
        }
      };
  
      return response;
    } catch (error) {
      console.error('Error getting evaluation details:', error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }
  
  

  // generer le lien de l'evaluation

  public async generateEvaluationLink(learnerId: number, conceptId: number): Promise<string> {
    const baseUrl = 'http://localhost:4200/evaluation';
    const link = `${baseUrl}?learnerId=${learnerId}&conceptId=${conceptId}`;

    return link;
  }

  

  // Function pour calculer l'ecart entre la note de l'auto evaluation et la note d'evaluation Donc Evaluation 0
   public async getConceptEvaluation(conceptId, learnerId) {
    const autoEvaluation =  await this.conceptAutoAssessment.getConceptAutoAssessment(conceptId,learnerId);
    // const evaluation = await this.quizzService.calculateLearnerScore(learnerId,conceptId);
    const evaluation = 50;
    const noteEcart = evaluation - autoEvaluation;

    return {
      autoEvaluation,
      evaluation,
      noteEcart
    };
  }

 // Helper function to get data from cache or database
 private async getOrSetCache(key: string, fetchFunction: () => Promise<any>): Promise<any> {
  const cachedData = this.cache.get(key);
  if (cachedData) {
    console.log(`Cache hit for key: ${key}`);
    return cachedData;
  }
  console.log(`Cache miss for key: ${key}`);
  const data = await fetchFunction();
  this.cache.set(key, data);
  return data;
}

// Function to clear specific cache key
public clearCache(key: string): void {
  this.cache.del(key);
}



// public async getQuizDetails(learnerId: number, conceptId: number) {
//   const cacheKey = `quizDetails-${learnerId}-${conceptId}`;
//   return this.getOrSetCache(cacheKey, async () => {
//     try {
//       const quizzes = await this.prisma.quiz.findMany({
//         where: { conceptId },
//         include: {
//           questions: {
//             include: {
//               propositions: true,
//               answer: true,
//               learnerAnswer: {
//                 include: {
//                   proposition: true,
//                   learner: {
//                     include: {
//                       classe: {
//                         include: {
//                           ecole: true
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           },
//           concept: {
//             include: {
//               session: {
//                 include: {
//                   syllabus: {
//                     include: {
//                       teacher: {
//                         include: {
//                           user: true,
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       });

//       if (quizzes.length === 0) {
//         throw new HttpException(404, 'No quizzes found for this concept');
//       }

//       // Get the class of the specified learner
//       const learner = await this.prisma.learner.findUnique({
//         where: { id: learnerId },
//         include: { classe: true }
//       });

//       if (!learner) {
//         throw new HttpException(404, 'Learner not found');
//       }

//       const classId = learner.classeId;

//       // Get all learners in the same class
//       const learnersInClass = await this.prisma.learner.findMany({
//         where: { classeId: classId },
//         select: { id: true }
//       });

//       let totalLearnerScore = 0;
//       let totalClassScore = 0;
//       let totalQuestions = 0;

//       const detailedQuizzes = quizzes.map(quiz => {
//         const questionsWithAnswers = quiz.questions.map(question => {
//           const correctAnswer = question.answer.find(ans => ans.questionId === question.id);
//           const learnerAnswer = question.learnerAnswer.find(ans => ans.learnerId === learnerId);
//           const learnerProposition = learnerAnswer?.proposition;

//           const isCorrect = learnerProposition && correctAnswer && learnerProposition.numbQuestion === correctAnswer.valeur;

//           if (isCorrect) {
//             totalLearnerScore++;
//           }

//           totalQuestions++;

//           return {
//             ...question,
//             learnerAnswer,
//             correctAnswer,
//             isCorrect,
//             class: learnerAnswer?.learner.classe,
//             ecole: learnerAnswer?.learner.classe?.ecole,
//             syllabus: quiz.concept.session.syllabus,
//             teacher: {
//               id: quiz.concept.session.syllabus.teacher.id,
//               name: quiz.concept.session.syllabus.teacher.user.name,
//               surname: quiz.concept.session.syllabus.teacher.user.surname,
//               email: quiz.concept.session.syllabus.teacher.user.email,
//             }
//           };
//         });

//         return {
//           ...quiz,
//           questions: questionsWithAnswers,
//         };
//       });

//       // Calculate the class score
//       let totalClassLearnerScores = 0;
//       for (const learner of learnersInClass) {
//         let learnerTotalScore = 0;
//         let learnerTotalQuestions = 0;

//         for (const quiz of quizzes) {
//           for (const question of quiz.questions) {
//             const correctAnswer = question.answer.find(ans => ans.questionId === question.id);
//             const learnerAnswer = question.learnerAnswer.find(ans => ans.learnerId === learner.id);
//             const learnerProposition = learnerAnswer?.proposition;

//             if (learnerProposition && correctAnswer && learnerProposition.numbQuestion === correctAnswer.valeur) {
//               learnerTotalScore++;
//             }

//             learnerTotalQuestions++;
//           }
//         }

//         if (learnerTotalQuestions > 0) {
//           totalClassLearnerScores += (learnerTotalScore / learnerTotalQuestions) * 100;
//         }
//       }

//       const classScorePercentage = learnersInClass.length > 0 ? totalClassLearnerScores / learnersInClass.length : 0;
//       const learnerScorePercentage = (totalLearnerScore / totalQuestions) * 100;
//       const scoreDifference = learnerScorePercentage - classScorePercentage;

//       return {
//         detailedQuizzes,
//         learnerScore: learnerScorePercentage,
//         classScore: classScorePercentage,
//         scoreDifference
//       };
//     } catch (error) {
//       console.error('Error getting quiz details:', error);
//       throw new HttpException(500, 'Internal Server Error');
//     }
//   });
// }

// liste des evaluations pour un concept
public async getQuizDetails(learnerId: number, conceptId: number) {
  const cacheKey = `quizDetails-${learnerId}-${conceptId}`;
  return this.getOrSetCache(cacheKey, async () => {
    try {
      // Fetch all relevant data in a single query
      const quizzes = await this.prisma.quiz.findMany({
        where: { conceptId },
        include: {
          questions: {
            include: {
              propositions: true,
              answer: true,
              learnerAnswer: {
                include: {
                  proposition: true,
                  learner: {
                    include: {
                      classe: {
                        include: {
                          ecole: true
                        }
                      }
                    }
                  }
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
                          user: true,
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (quizzes.length === 0) {
        throw new HttpException(404, 'No quizzes found for this concept');
      }

      // Get the class of the specified learner
      const learner = await this.prisma.learner.findUnique({
        where: { id: learnerId },
        include: { classe: { include: { ecole: true } } }
      });

      if (!learner) {
        throw new HttpException(404, 'Learner not found');
      }

      const classId = learner.classeId;
      const classInfo = learner.classe;
      const schoolInfo = learner.classe?.ecole;

      // Get all learners in the same class
      const learnersInClass = await this.prisma.learner.findMany({
        where: { classeId: classId },
        select: { id: true }
      });

      // Extract syllabus, teacher, and session info from the first quiz
      const firstQuiz = quizzes[0];
      const syllabus = firstQuiz.concept.session.syllabus;
      const teacher = syllabus.teacher.user;
      const session = firstQuiz.concept.session;

      // Calculate the learner's score and details
      let totalLearnerScore = 0;
      let totalQuestions = 0;

      const detailedQuizzes = quizzes.map(quiz => {
        const questionsWithAnswers = quiz.questions.map(question => {
          const correctAnswer = question.answer.find(ans => ans.questionId === question.id);
          const learnerAnswer = question.learnerAnswer.find(ans => ans.learnerId === learnerId);
          const learnerProposition = learnerAnswer?.proposition;

          const isCorrect = learnerProposition && correctAnswer && learnerProposition.numbQuestion === correctAnswer.valeur;

          if (isCorrect) {
            totalLearnerScore++;
          }

          totalQuestions++;

          return {
            ...question,
            learnerAnswer,
            correctAnswer,
            isCorrect,
          };
        });

        return {
          ...quiz,
          questions: questionsWithAnswers,
        };
      });

      // Calculate the class score
      const classScores = await Promise.all(
        learnersInClass.map(async learner => {
          let learnerTotalScore = 0;
          let learnerTotalQuestions = 0;

          quizzes.forEach(quiz => {
            quiz.questions.forEach(question => {
              const correctAnswer = question.answer.find(ans => ans.questionId === question.id);
              const learnerAnswer = question.learnerAnswer.find(ans => ans.learnerId === learner.id);
              const learnerProposition = learnerAnswer?.proposition;

              if (learnerProposition && correctAnswer && learnerProposition.numbQuestion === correctAnswer.valeur) {
                learnerTotalScore++;
              }

              learnerTotalQuestions++;
            });
          });

          if (learnerTotalQuestions > 0) {
            return (learnerTotalScore / learnerTotalQuestions) * 100;
          }
          return 0;
        })
      );

      const totalClassScore = classScores.reduce((acc, score) => acc + score, 0);
      const classScorePercentage = learnersInClass.length > 0 ? totalClassScore / learnersInClass.length : 0;
      const learnerScorePercentage = (totalLearnerScore / totalQuestions) * 100;
      const scoreDifference = learnerScorePercentage - classScorePercentage;

      return {
        detailedQuizzes,
        syllabus: {
          id: syllabus.id,
          name: syllabus.name,
        },
        teacher: {
          id: teacher.id,
          name: teacher.name,
          surname: teacher.surname,
          email: teacher.email,
        },
        class: classInfo,
        session: {
          id: session.id,
          name: session.name,
          startDate: session.startDate,
          endDate: session.endDate,
        },
        school: schoolInfo,
        learnerScore: learnerScorePercentage,
        classScore: classScorePercentage,
        scoreDifference
      };
    } catch (error) {
      console.error('Error getting quiz details:', error);
      throw new HttpException(500, 'Internal Server Error');
    }
  });
}




// public async getAllQuizDetails(learnerId: number) {
//    // Récupérer les informations de l'apprenant, de son école, de sa classe et de ses enseignants
//    const learner = await this.prisma.learner.findUnique({
//     where: { id: learnerId },
//     include: {
//       user: true,
//       classe: {
//         include: {
//           ecole: true,
//         },
//       },
//     },
//   });

//   if (!learner) {
//     throw new HttpException(404, 'Learner not found');
//   }

//   if (!learner) {
//     throw new HttpException(404, 'Learner not found');
//   }

//   // Récupérer tous les quiz auxquels l'apprenant a répondu
//   const learnerQuizzes = await this.prisma.learnerAnswer.findMany({
//     where: { learnerId },
//     select: { quizId: true },
//     distinct: ['quizId'],
//   });

//   // Calculer les scores pour chaque quiz
//   const quizScores = await Promise.all(
//     learnerQuizzes.map(async (quiz) => {
//       const scorePercentage = await this.calculateLearnerScore(learnerId, quiz.quizId);
//       return { quizId: quiz.quizId, scorePercentage };
//     })
//   );

//   // Récupérer les concepts et les sessions associés
//   const conceptScores = {};
//   const detailedConcepts = [];
//   for (const { quizId } of learnerQuizzes) {
//     const quiz = await this.prisma.quiz.findUnique({
//       where: { id: quizId },
//       include: {
//         concept: {
//           include: {
//             session: {
//               include: {
//                 syllabus: {
//                   include: {
//                     teacher: {
//                       include: { user: true },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     if (quiz && quiz.concept) {
//       const conceptId = quiz.concept.id;
//       const session = quiz.concept.session;
//       if (!conceptScores[conceptId]) {
//         conceptScores[conceptId] = { score: 0, totalQuestions: 0, sessionId: session.id };
//       }
//       conceptScores[conceptId].score += quizScores.find((qs) => qs.quizId === quizId)?.scorePercentage || 0;
//       conceptScores[conceptId].totalQuestions += 1;

//       detailedConcepts.push({
//         conceptId,
//         conceptName: quiz.concept.name,
//         session: {
//           sessionId: session.id,
//           sessionName: session.name,
//           syllabus: {
//             syllabusId: session.syllabus.id,
//             syllabusName: session.syllabus.name,
//             teacher: {
//               teacherId: session.syllabus.teacher.id,
//               teacherName: session.syllabus.teacher.user.name,
//             },
//           },
//         },
//       });
//     }
//   }

//   // Calculer les scores des sessions
//   const sessionScores = {};
//   for (const conceptId in conceptScores) {
//     const concept = conceptScores[conceptId];
//     if (!sessionScores[concept.sessionId]) {
//       sessionScores[concept.sessionId] = { score: 0, totalConcepts: 0 };
//     }
//     sessionScores[concept.sessionId].score += (concept.score / concept.totalQuestions);
//     sessionScores[concept.sessionId].totalConcepts += 1;
//   }

//   for (const sessionId in sessionScores) {
//     sessionScores[sessionId].scorePercentage = (sessionScores[sessionId].score / sessionScores[sessionId].totalConcepts);
//   }

//   // Récupérer toutes les réponses de l'apprenant
//   const learnerAnswers = await this.prisma.learnerAnswer.findMany({
//     where: { learnerId },
//     include: {
//       proposition: {
//         include: {
//           question: true,
//         },
//       },
//     },
//   });

//   // Préparer la réponse avec toutes les informations demandées
//   const response = {
//     learner,
//     school: learner.classe?.ecole,
//     quizScores,
//     concepts: Object.keys(conceptScores).map((conceptId) => ({
//       conceptId,
//       ...conceptScores[conceptId],
//       scorePercentage: (conceptScores[conceptId].score / conceptScores[conceptId].totalQuestions),
//     })),
//     sessions: Object.keys(sessionScores).map((sessionId) => ({
//       sessionId,
//       ...sessionScores[sessionId],
//     })),
//     learnerAnswers,
//     detailedConcepts,
//   };

//   return response;
// }

public async getAllQuizDetails(learnerId: number) {
  const learner = await this.prisma.learner.findUnique({
    where: { id: learnerId },
    include: {
      user: true,
      classe: {
        include: {
          ecole: true,
        },
      },
    },
  });

  if (!learner) {
    throw new HttpException(404, 'Learner not found');
  }

  const learnerQuizzes = await this.prisma.learnerAnswer.findMany({
    where: { learnerId },
    select: { quizId: true },
    distinct: ['quizId'],
  });

  const quizScores = await Promise.all(
    learnerQuizzes.map(async (quiz) => {
      const scorePercentage = await this.calculateLearnerScore(learnerId, quiz.quizId);
      return { quizId: quiz.quizId, scorePercentage };
    })
  );

  const evaluations: any[] = [];
  const conceptScores: Record<number, ConceptScore> = {};
  for (const { quizId } of learnerQuizzes) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        concept: {
          include: {
            session: {
              include: {
                syllabus: {
                  include: {
                    teacher: {
                      include: { user: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (quiz && quiz.concept) {
      const conceptId = quiz.concept.id;
      const session = quiz.concept.session;
      if (!conceptScores[conceptId]) {
        conceptScores[conceptId] = {
          score: 0,
          totalQuestions: 0,
          sessionId: session.id,
          conceptName: quiz.concept.name,
          sessionName: session.name,
        };
      }
      conceptScores[conceptId].score += quizScores.find((qs) => qs.quizId === quizId)?.scorePercentage || 0;
      conceptScores[conceptId].totalQuestions += 1;
    }
  }

  const sessionScores: Record<number, SessionScore> = {};
  for (const conceptId in conceptScores) {
    const concept = conceptScores[conceptId];
    if (!sessionScores[concept.sessionId]) {
      sessionScores[concept.sessionId] = {
        score: 0,
        totalConcepts: 0,
        sessionName: concept.sessionName,
      };
    }
    sessionScores[concept.sessionId].score += (concept.score / concept.totalQuestions);
    sessionScores[concept.sessionId].totalConcepts += 1;
  }

  for (const sessionId in sessionScores) {
    sessionScores[sessionId].scorePercentage = (sessionScores[sessionId].score / sessionScores[sessionId].totalConcepts);
  }

  for (const sessionId in sessionScores) {
    const sessionConcepts = Object.values(conceptScores).filter(concept => concept.sessionId === parseInt(sessionId));
    const detailleQuizz = await Promise.all(sessionConcepts.map(async (concept, index) => {
      const quizDetails = await this.getQuizDetailsByConcept(concept.conceptName, learnerId);
      return {
        concept: concept.conceptName,
        Questions: quizDetails,
      };
    }));

    const sessionName = sessionScores[sessionId].sessionName;
    const firstSessionConcept = sessionConcepts[0];
    const syllabus = await this.prisma.syllabus.findUnique({
      where: { id: firstSessionConcept.sessionId },
      include: {
        teacher: {
          include: { user: true },
        },
      },
    });

    evaluations.push({
      class: learner.classe,
      school: learner.classe?.ecole,
      detailleQuizz,
      session: { id: sessionId, name: sessionName },
      score: sessionScores[sessionId].scorePercentage,
      syllabus: syllabus,
      teacher: syllabus?.teacher?.user,
    });
  }

  const response = {
    learner,
    evaluations,
    quizScores,
    sessionScores,
    conceptScores,
  };

  return response;
}

public async getQuizDetailsByConcept(conceptName: string, learnerId: number) {
  const quizzes = await this.prisma.quiz.findMany({
    where: {
      concept: {
        name: conceptName,
      },
    },
    include: {
      questions: {
        include: {
          propositions: true,
        },
      },
    },
  });

  const quizDetails = await Promise.all(quizzes.map(async (quiz) => {
    const questions = await Promise.all(quiz.questions.map(async (question) => {
      const learnerAnswer = await this.prisma.learnerAnswer.findFirst({
        where: {
          questionId: question.id,
          learnerId: learnerId,
        },
        include: {
          proposition: true,
        },
      });

      const correctAnswer = await this.prisma.answer.findFirst({
        where: {
          questionId: question.id,
        },
      });

      return {
        question: question.libelle,
        propositions: question.propositions.map(p => ({
          id: p.id,
          valeur: p.valeur,
        })),
        learnerAnswer: learnerAnswer ? learnerAnswer.proposition.valeur : null,
        correctAnswer: correctAnswer ? correctAnswer.valeur : null,
        isCorrect: learnerAnswer ? learnerAnswer.proposition.numbQuestion === correctAnswer?.valeur : false,
      };
    }));

    return {
      quizId: quiz.id,
      questions,
    };
  }));

  return quizDetails;
}

public async calculateLearnerScore(learnerId: number, quizId: number): Promise<number> {
  const learnerAnswers = await this.prisma.learnerAnswer.findMany({
    where: { learnerId, quizId },
    include: {
      proposition: { include: { question: true } },
    },
  });

  let score = 0;

  for (const answer of learnerAnswers) {
    const correctAnswer = await this.prisma.answer.findFirst({ where: { questionId: answer.proposition.questionId } });

    if (correctAnswer && answer.proposition.numbQuestion === correctAnswer.valeur) {
      score++;
    }
  }

  const totalQuestions = await this.prisma.question.count({ where: { quizId } });
  const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  return scorePercentage;
}

public async calculateTotalLearnerScores(learnerId: number) {
  // Récupérer tous les quiz auxquels l'apprenant a répondu
  const learnerQuizzes = await this.prisma.learnerAnswer.findMany({
    where: { learnerId },
    select: { quizId: true },
    distinct: ['quizId']
  });

  const scores = await Promise.all(
    learnerQuizzes.map(async (quiz) => {
      const scorePercentage = await this.calculateLearnerScore(learnerId, quiz.quizId);
      return { quizId: quiz.quizId, scorePercentage };
    })
  );

  return scores;
}

// public async calculateLearnerScore(learnerId: number, quizId: number) {
//   const learnerAnswers = await this.prisma.learnerAnswer.findMany({
//     where: { learnerId, quizId },
//     include: {
//       proposition: { include: { question: true } },
//     },
//   });

//   let score = 0;

//   for (const answer of learnerAnswers) {
//     const correctAnswer = await this.prisma.answer.findFirst({ where: { questionId: answer.questionId } });

//     if (correctAnswer && answer.proposition.numbQuestion === correctAnswer.valeur) {
//       score++;
//     }
//   }

//   const totalQuestions = await this.prisma.question.count({ where: { quizId } });
//   const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

//   return scorePercentage;
// }








}
