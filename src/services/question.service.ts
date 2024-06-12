import {Service} from "typedi";
import {PrismaClient} from "@prisma/client";
import {Session} from "@interfaces/session.interface";
import {HttpException} from "@exceptions/HttpException";
import {Question} from "@interfaces/question.interface";
import {CreateQuestionDto} from "@dtos/question.dto";

@Service()
export class QuestionService {

  private quizz = new PrismaClient().quiz;
  private question = new PrismaClient().question;
  public async createOneQuestion(quizzId: number, question: Question) : Promise<Question> {

    const existingQuizz = await this.quizz.findFirst({
      where: {
        id: quizzId
      },
    });

    if (!existingQuizz) {
      throw new HttpException(409, 'Quizz not exists');
    }

    const existingQuestion = await this.question.findFirst({
      where : {
        id : question.id
      }
    })

    if (!existingQuestion) {
      throw new HttpException(409, 'Question already exist');
    }

    const createQuestion = await  this.question.create({
      data: {
        libelle : question.libelle,
        quiz: {
          connect: {
            id: quizzId ,
          },
        },
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
      },
      include : {
                propositions: true,
                answer: true,
      }

    })
    return  createQuestion;

  }

  public  async  getAllQuestionForQuizz(quizId: number): Promise <Question[]> {

    const questions = await this.question.findMany({
      where: {
        quizId,
      },
      include : {
        propositions: true,
        answer: true,
      }
    })
    if (!questions) {
      throw new HttpException(404, 'Question not found');
    }
    return  questions;
  }

  public async getQuestionById(quizId: number, id:number): Promise<Question>{

    const existingQuizz = await this.quizz.findFirst({
      where: {
        id: quizId
      },
    });

    if (!existingQuizz) {
      throw new HttpException(409, 'Quizz not exists');
    }


    const question = await this.question.findFirst({
      where: {
        quizId,
      },
      include : {
        propositions: true,
        answer: true,
      }
    })
    if (!question) {
      throw new HttpException(404, 'question not found');
    }
    return  question;
  }

  public async updateQuestionForQuizz( quizId: number, id:number, question: CreateQuestionDto): Promise<Question> {

    const existingQuizz = await this.quizz.findFirst({
      where: {
        id: quizId
      },
    });

    if (!existingQuizz) {
      throw new HttpException(409, 'Quizz not exists');
    }
    const existingQuestion = await this.question.findFirst({
      where : {
        libelle : question.libelle
      }
    })

    if (!existingQuestion) {
      throw new HttpException(409, 'Question not exist');
    }
    const updatedQuestion = await this.question.update({
      where: {
        id: quizId,
      },
      data: {
        libelle: question.libelle
      },
      include: {
        propositions: true,
        answer: true
      }
    });

    return updatedQuestion;

  }

  async deleteQuestion(id: number): Promise<Question | null> {
    // Recherche de la question existante
    const existingQuestion = await this.question.findFirst({
      where: {
        id
      },
      include: {
        propositions: true,
        answer: true
      }
    });

    if (!existingQuestion) {
      throw new HttpException(409, 'Question does not exist');
    }

    // Suppression de la question
    return this.question.delete({
      where: {
        id,
      },
      include: {
        propositions: true,
        answer: true
      }
    });
  }

  async  getRandomQuestionsForQuiz(quizId: number): Promise<any[]> {
    try {
      // Récupérer toutes les questions pour le quizz spécifié
      const allQuestions = await this.question.findMany({
        where: {
          quizId: quizId,
        },
      });

      // Mélanger les questions aléatoirement
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

      return shuffledQuestions;
    } catch (error) {
      // Gérer les erreurs ici
      console.error('Erreur lors de la récupération des questions:', error);
      throw error;
    }
  }


}
