import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import console from 'console';
import { QuestionService } from '@services/question.service';
import { Question } from '@interfaces/question.interface';

export class QuestionController {
  public questionService = Container.get(QuestionService);

  public createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
    try {
      const questionId = Number(req.query.id);
      const question = req.body;
      const createQuestion = await this.questionService.createOneQuestion(questionId, question);

      res.status(201).json({ data: createQuestion, message: 'Question created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllQuestionForQuizz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzId = Number(req.query.quizzId);
      const getAllQuestionForQuizz = await this.questionService.getAllQuestionForQuizz(quizzId);
      res.status(200).json({ data: getAllQuestionForQuizz });
    } catch (error) {
      next(error);
    }
  };

  public getQuestionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzId = Number(req.query.quizzId);
      const questionId = Number(req.query.questionId);
      const getQuestionById = await this.questionService.getQuestionById(quizzId, questionId);
      res.status(200).json({ data: getQuestionById });
    } catch (error) {
      next(error);
    }
  };

  public updateQuestionForQuizz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question: Question = req.body;
      const quizzId = Number(req.query.quizzId);
      const questionId = Number(req.query.questionId);

      const updateQuestionForQuizz: Question = await this.questionService.updateQuestionForQuizz(quizzId, questionId, question);

      res.status(201).json({ data: updateQuestionForQuizz, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionId = Number(req.query.id);
      const deleteQuestion: Question = await this.questionService.deleteQuestion(questionId);

      res.status(200).json({ data: deleteQuestion, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getRandomQuizz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzId = Number(req.query.quizzId);
      const getRandomQuizz = await this.questionService.getRandomQuestionsForQuiz(quizzId);
      res.status(200).json({ data: getRandomQuizz });
    } catch (error) {
      next(error);
    }
  };
}
