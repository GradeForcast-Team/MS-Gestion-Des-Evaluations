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
}
