import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { QuestionController } from '@/controllers/question.controller';

export class QuestionRoute implements Routes {
  public path = '/question';
  public router = Router();
  public questionController = new QuestionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, this.questionController.createQuestion);
    this.router.get(`${this.path}/all`, this.questionController.getAllQuestionForQuizz);
    this.router.get(`${this.path}`, this.questionController.getQuestionById);
    this.router.put(`${this.path}/update`, this.questionController.updateQuestionForQuizz);
    this.router.delete(`${this.path}/delete`, this.questionController.deleteQuestion);
    this.router.get(`${this.path}/random`, this.questionController.getRandomQuizz);
  }
}
