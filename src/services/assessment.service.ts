import { PrismaClient } from '@prisma/client';
import {Session} from "@interfaces/session.interface";
import {Container, Service} from "typedi";
import {QuizzService} from "@services/quizz.service";
import {ConceptAutoAssessmentService} from "@services/conceptAutoAssessment.service";
import { HttpException } from '@/exceptions/HttpException';
const prisma = new PrismaClient();

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

  public async getEvaluationDetails(learnerId: number, conceptId: number) {
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
                      teacher: true
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
                  teacher: quiz.concept.session.syllabus.teacher
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
}
