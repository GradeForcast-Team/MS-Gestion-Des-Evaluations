import { Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '@exceptions/HttpException';
import { CreateQuizDto } from '@dtos/quizz.dto';
import { Quiz } from '@interfaces/quizz.interface';

@Service()
export class QuizzService {
  private prisma = new PrismaClient();
  private quizz = this.prisma.quiz;
  private learnerAnswer = this.prisma.learnerAnswer;
  private answer = this.prisma.answer;
  private question = this.prisma.question;
  private concept = this.prisma.concept;

  public async createQuiz(conceptId: number, quizData: CreateQuizDto): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const createQuizz = await this.quizz.create({
      data: {
        ...quizData,
        concept: { connect: { id: conceptId } },
        questions: {
          create: quizData.questions.map(question => {
            let count = 1;
            return {
              ...question,
              propositions: {
                create: question.propositions.map(proposition => ({
                  numbQuestion: count++,
                  ...proposition,
                })),
              },
              answer: {
                create: question.answer.map(answer => ({ ...answer })),
              },
            };
          }),
        },
      },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    return createQuizz;
  }

  public async getAllQuizzForConcept(conceptId: number): Promise<Quiz[]> {
    const quizzes = await this.quizz.findMany({
      where: { conceptId },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    if (!quizzes) {
      throw new HttpException(404, 'quizzes not found');
    }
    return quizzes;
  }

  public async getQuizzById(conceptId: number, id: number): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const quizz = await this.quizz.findFirst({
      where: { id, conceptId },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    if (!quizz) {
      throw new HttpException(404, 'Quizz not found');
    }
    return quizz;
  }

  public async updateQuizzForConcept(conceptId: number, id: number, quizz: any): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const updatedQuizz = await this.quizz.update({
      where: { id },
      data: { ...quizz },
    });

    return updatedQuizz;
  }

  public async updateQuiz(conceptId: number, quizId: number, quizData: CreateQuizDto): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const existingQuiz = await this.quizz.findFirst({ where: { id: quizId, conceptId } });

    if (!existingQuiz) {
      throw new HttpException(409, 'Quiz not exists');
    }

    const updatedQuiz = await this.quizz.update({
      where: { id: quizId },
      data: {
        ...quizData,
        questions: {
          deleteMany: {}, 
          create: quizData.questions.map(question => {
            let count = 1;
            return {
              ...question,
              propositions: {
                create: question.propositions.map(proposition => ({
                  numbQuestion: count++,
                  ...proposition,
                })),
              },
              answer: {
                create: question.answer.map(answer => ({ ...answer })),
              },
            };
          }),
        },
      },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    return updatedQuiz;
  }

  public async deleteQuizz(id: number): Promise<Quiz | null> {
    const existingQuizz = await this.quizz.findFirst({ where: { id } });

    if (!existingQuizz) {
      throw new HttpException(409, 'Quizz not exists');
    }

    return this.quizz.delete({ where: { id } });
  }

  // Evaluation d'un quizz
  public async calculateLearnerScore(learnerId: number, quizId: number) {
    const learnerAnswers = await this.learnerAnswer.findMany({
      where: { learnerId, quizId },
      include: {
        proposition: { include: { question: true } },
      },
    });

    let score = 0;

    for (const answer of learnerAnswers) {
      const correctAnswer = await this.answer.findFirst({ where: { questionId: answer.questionId } });

      if (answer.proposition.numbQuestion === correctAnswer.valeur) {
        score++;
      }
    }

    const totalQuestions = await this.question.count({ where: { quizId } });
    const scorePercentage = (score / totalQuestions) * 100;

    return scorePercentage;
  }

  
}
