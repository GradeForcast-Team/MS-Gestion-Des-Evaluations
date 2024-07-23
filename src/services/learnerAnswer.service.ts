import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {LearnerAnswer} from "@interfaces/learnerAnswer.interface";

@Service()
export class LearnerAnswerService {
  public prisma = new PrismaClient();


  async createLearnerResponse(quizzId: number, learnerId: number, learnerAnswers: LearnerAnswer[]): Promise<LearnerAnswer[]> {
    // Vérifiez si le quiz existe
    const existingQuizz = await this.prisma.quiz.findFirst({
      where: {
        id: quizzId,
      },
    });
  
    if (!existingQuizz) {
      throw new HttpException(409, 'Quiz does not exist');
    }
  
    // Vérifiez l'existence de chaque question et assurez-vous que chaque question appartient bien au quiz
    await Promise.all(learnerAnswers.map(async (learnerAnswer) => {
      const existingQuestion = await this.prisma.question.findFirst({
        where: {
          id: learnerAnswer.questionId,
          quizId: quizzId,  // Assurez-vous que la question appartient bien au quiz
        },
      });
  
      if (!existingQuestion) {
        throw new HttpException(409, `Question with id ${learnerAnswer.questionId} does not exist or does not belong to the specified quiz`);
      }
    }));
  
    // Créez ou mettez à jour les réponses de l'apprenant
    const reponsesCrees: LearnerAnswer[] = [];
    
    for (const answer of learnerAnswers) {
      const existingAnswer = await this.prisma.learnerAnswer.findFirst({
        where: {
          learnerId: learnerId,
          quizId: quizzId,
          questionId: answer.questionId,
        },
      });
  
      if (existingAnswer) {
        // Mettre à jour l'ancienne réponse avec la nouvelle valeur
        const updatedAnswer = await this.prisma.learnerAnswer.update({
          where: {
            id: existingAnswer.id,
          },
          data: {
            propositionId: answer.propositionId,
          },
        });
        reponsesCrees.push(updatedAnswer);
      } else {
        // Créer une nouvelle réponse
        const newAnswer = await this.prisma.learnerAnswer.create({
          data: {
            learnerId: learnerId,
            quizId: quizzId,
            questionId: answer.questionId,
            propositionId: answer.propositionId,
          },
        });
        reponsesCrees.push(newAnswer);
      }
    }
  
    return reponsesCrees;
  }
  
  



  async  getLearnerResponseById(learnerResponseId) {
      const learnerAnswer = await this.prisma.learnerAnswer.findUnique({
        where: {
          id: learnerResponseId
        },
        include: {
          learner: true,
          quiz: true,
          question: true,
          proposition: true
        }
      });
      return learnerAnswer;

  }

}
