import { Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '@exceptions/HttpException';
import { CreateQuizDto } from '@dtos/quizz.dto';
import { Quiz } from '@interfaces/quizz.interface';

@Service()
export class QuizzService {
  private session = new PrismaClient().session;
  private quizz = new PrismaClient().quiz;
  private learnerAnswer = new PrismaClient().learnerAnswer;
  private answer = new PrismaClient().answer;
  private question = new PrismaClient().question;

  public async createQuiz(sessionId: number, quiz: CreateQuizDto): Promise<Quiz> {
    const existingSession = await this.session.findFirst({
      where: {
        id: sessionId,
      },
    });

    if (!existingSession) {
      throw new HttpException(409, 'Session not exists');
    }

    const createQuizz = await this.quizz.create({
      data: {
        ...quiz,
        session: {
          connect: {
            id: sessionId,
          },
        },
        questions: {
          create: quiz.questions.map(question => ({
            ...question,
            propositions: {
              create: question.propositions.map(proposition => ({
                ...proposition,
              })),
            },
            answer: {
              create: question.answer.map(answer => ({
                ...answer,
              })),
            },
          })),
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

  public async getAllQuizzForSession(sessionId: number): Promise<Quiz[]> {
    const quizzes = await this.quizz.findMany({
      where: {
        sessionId,
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
    if (!quizzes) {
      throw new HttpException(404, 'quizzes not found');
    }
    return quizzes;
  }

  public async getQuizzById(sessionId: number, id: number): Promise<Quiz> {
    const existingSession = await this.session.findFirst({
      where: {
        id: sessionId,
      },
    });

    if (!existingSession) {
      throw new HttpException(409, 'Session not exists');
    }

    const quizz = await this.quizz.findFirst({
      where: {
        id,
        sessionId,
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
    if (!quizz) {
      throw new HttpException(404, 'Quizz not found');
    }
    return quizz;
  }

  public async updateQuizzForSession(sessionId: number, id: number, quizz: any): Promise<Quiz> {

    const existingSession = await this.session.findFirst({
      where: {
        id: sessionId,
      },
    });

    if (!existingSession) {
      throw new HttpException(409, 'Session not exists');
    }

    const updatedQuizz = await this.quizz.update({
      where: {
        id,
      },
      data: {
        ...quizz,
      },
    });

    return updatedQuizz;

  }
  public async updateQuiz(sessionId: number, quizId: number, quizData: CreateQuizDto): Promise<Quiz> {
    const existingSession = await this.session.findFirst({
      where: {
        id: sessionId,
      },
    });

    if (!existingSession) {
      throw new HttpException(409, 'Session not exists');
    }

    const existingQuiz = await this.quizz.findFirst({
      where: {
        id: quizId,
        sessionId: sessionId,
      },
    });

    if (!existingQuiz) {
      throw new HttpException(409, 'Quiz not exists');
    }

    // Update the quiz and its nested relations
    const updatedQuiz = await this.quizz.update({
      where: {
        id: quizId,
      },
      data: {
        ...quizData,
        questions: {
          deleteMany: {}, // Delete existing questions to replace them
          create: quizData.questions.map(question => ({
            ...question,
            propositions: {
              create: question.propositions.map(proposition => ({
                ...proposition,
              })),
            },
            answer: {
              create: question.answer.map(answer => ({
                ...answer,
              })),
            },
          })),
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

  async deleteQuizz(id: number): Promise<Quiz | null> {
    const existingQuizz = await this.quizz.findFirst({
      where: {
        id,
      },
    });

    if (!existingQuizz) {
      throw new HttpException(409, 'Quizz not exists');
    }

    return this.quizz.delete({
      where: {
        id,
      },
    });
  }

   async  calculerNoteLearner(learnerId:number, quizId: number) {

    const learnerAnswers = await this.learnerAnswer.findMany({
      where: {
        learnerId: learnerId,
        quizId: quizId,
      },
      include: {
        proposition: {
          include: {
            question: true,
          },
        },
      },
    });

    let score = 0;

    // Parcourir chaque réponse de l'apprenant
    for (const answer of learnerAnswers) {
      // Récupérer la réponse attendue pour cette question
      const correctAnswer = await this.answer.findFirst({
        where: {
          questionId: answer.questionId,
        },
      });

      // Vérifier si la proposition choisie par l'apprenant correspond à la réponse attendue
      if (answer.proposition.numbQuestion === correctAnswer.valeur) {
        score++;
      }
    }

    const totalQuestions = await this.question.count({
      where: {
        quizId: quizId,
      },
    });

    // Calculer le score en pourcentage
    const scorePercentage = (score / totalQuestions) * 100;

    // Retourner le score de l'apprenant
    return `${score}/${totalQuestions} (${scorePercentage.toFixed(2)}%)`

  }

  async  NoteLearner(learnerId:number, quizId: number) {

    const learnerAnswers = await this.learnerAnswer.findMany({
      where: {
        learnerId: learnerId,
        quizId: quizId,
      },
      include: {
        proposition: {
          include: {
            question: true,
          },
        },
      },
    });
    console.log("learner", learnerAnswers)
    let score = 0;

    // Parcourir chaque réponse de l'apprenant
    for (const answer of learnerAnswers) {
      // Récupérer la réponse attendue pour cette question
      const correctAnswer = await this.answer.findFirst({
        where: {
          questionId: answer.questionId,
        },
      });

      // Vérifier si la proposition choisie par l'apprenant correspond à la réponse attendue
      if (answer.proposition.numbQuestion === correctAnswer.valeur) {
        score++;
      }
    }
    console.log('Score', score);
    const totalQuestions = await this.question.count({
      where: {
        quizId: quizId,
      },
    });

    // Calculer le score en pourcentage
    const scorePercentage = (score / totalQuestions);

    // Retourner le score de l'apprenant
    return scorePercentage

  }




}
