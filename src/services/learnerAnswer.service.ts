import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {CreateLearnerAnswerDto} from "@dtos/learnerAnswer.dto";
import {LearnerAnswer} from "@interfaces/learnerAnswer.interface";

@Service()
export class LearnerAnswerService {
  public prisma = new PrismaClient();

  async createLearnerResponse(learnerAnswer: any): Promise <LearnerAnswer[]> {
      // const learnerResponse = await this.prisma.learnerAnswer.create({
      //   data: {
      //     learnerId : learnerAnswer.learnerId,
      //     questionId : learnerAnswer.questionId,
      //     propositionId : learnerAnswer.propositionId,
      //     quizId : learnerAnswer.quizId
      //   }
      // });
    const reponsesCrees = [];
    for (const answer of learnerAnswer) {
      const learnerAnswer= await this.prisma.learnerAnswer.create({
        data: answer,
      });
      reponsesCrees.push(learnerAnswer);
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
