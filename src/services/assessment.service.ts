import { PrismaClient } from '@prisma/client';
import {Session} from "@interfaces/session.interface";
import {Container, Service} from "typedi";
import {QuizzService} from "@services/quizz.service";
import {ConceptAutoAssessmentService} from "@services/conceptAutoAssessment.service";
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




  // Function pour calculer l'ecart entre la note de l'auto evaluation et la note d'evaluation
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
