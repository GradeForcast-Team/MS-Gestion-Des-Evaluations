import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {CreateLearnerAnswerDto} from "@dtos/learnerAnswer.dto";
import {LearnerAnswer} from "@interfaces/learnerAnswer.interface";

@Service()
export class LearnerAnswerService {
  public prisma = new PrismaClient();


async  createLearnerResponse(quizzId: number, learnerId: number, learnerAnswers: LearnerAnswer[]): Promise<LearnerAnswer[]> {
  // Vérifiez si le quiz existe
  const existingQuizz = await this.prisma.quiz.findFirst({
    where: {
      id: quizzId,
    },
  });

  if (!existingQuizz) {
    throw new HttpException(409, 'Quiz does not exist');
  }


  // Vérifiez l'existence de chaque question et proposition
  await Promise.all(learnerAnswers.map(async (learnerAnswer) => {
    const existingQuestion = await this.prisma.question.findFirst({
      where: {
        id: learnerAnswer.questionId,
      },
    });

    if (!existingQuestion) {
      throw new HttpException(409, `Question with id ${learnerAnswer.questionId} does not exist`);
    }

    const existingProposition = await this.prisma.proposition.findFirst({
      where: {
        id: learnerAnswer.propositionId,
      },
    });

    if (!existingProposition) {
      throw new HttpException(409, `Proposition with id ${learnerAnswer.propositionId} does not exist`);
    }
  }));

  // Créez les réponses de l'apprenant dans une transaction
  const reponsesCrees = await this.prisma.$transaction(
    learnerAnswers.map(answer => 
      this.prisma.learnerAnswer.create({
        data: {
          learnerId: learnerId,
          quizId: quizzId,
          questionId: answer.questionId,
          propositionId: answer.propositionId,
        },
      })
    )
  );

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
