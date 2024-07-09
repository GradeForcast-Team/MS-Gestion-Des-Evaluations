import { PrismaClient } from '@prisma/client';
import {Session} from "@interfaces/session.interface";
import {Container, Service} from "typedi";
import {QuizzService} from "@services/quizz.service";
import {ConceptAutoAssessmentService} from "@services/conceptAutoAssessment.service";
import { HttpException } from '@/exceptions/HttpException';
import NodeCache from 'node-cache';
@Service()
export class AssessmentService {
  public quizzService = Container.get(QuizzService);
  public conceptAutoAssessment = Container.get(ConceptAutoAssessmentService);
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

  public async getLink(learnerId: number, conceptId: number) {
    try {
      const quizzes = await this.prisma.quiz.findMany({
        where: { conceptId },
        include: {
          questions: {
            include: {
              propositions: true,
              answer: true,
              learnerAnswer: {
                where: { learnerId },
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

      const detailedQuizzes = quizzes.map(quiz => {
        return {
          ...quiz,
          questions: quiz.questions.map(question => {
            return {
              ...question,
              learnerAnswer: question.learnerAnswer.map(answer => {
                return {
                  ...answer,
                  class: answer.learner.classe,
                  ecole: answer.learner.classe?.ecole,
                  syllabus: quiz.concept.session.syllabus,
                  teacher: {
                    id: quiz.concept.session.syllabus.teacher.id,
                    name: quiz.concept.session.syllabus.teacher.user.name,
                    surname: quiz.concept.session.syllabus.teacher.user.surname,
                    email: quiz.concept.session.syllabus.teacher.user.email,
                  }
                };
              })
            };
          })
        };
      });

      return detailedQuizzes;
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
        include: { classe: true }
      });

      if (!learner) {
        throw new HttpException(404, 'Learner not found');
      }

      const classId = learner.classeId;

      // Get all learners in the same class
      const learnersInClass = await this.prisma.learner.findMany({
        where: { classeId: classId },
        select: { id: true }
      });

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
            class: learnerAnswer?.learner.classe,
            ecole: learnerAnswer?.learner.classe?.ecole,
            syllabus: quiz.concept.session.syllabus,
            teacher: {
              id: quiz.concept.session.syllabus.teacher.id,
              name: quiz.concept.session.syllabus.teacher.user.name,
              surname: quiz.concept.session.syllabus.teacher.user.surname,
              email: quiz.concept.session.syllabus.teacher.user.email,
            }
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

}
