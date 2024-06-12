import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {validateSyllabusMiddleware} from "@middlewares/validateSyllabus.middleware";
import {QuestionController} from "@controllers/question.controller";
import {CreateQuestionDto} from "@dtos/question.dto";

export class QuestionRoute implements Routes {
  public path = '/question';
  public router = Router();
  public question = new QuestionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create/:id(\\d+)`, validateSyllabusMiddleware(CreateQuestionDto),this.question.createQuestion);
    this.router.get(`${this.path}/getAllQuestionForQuizz/:id(\\d+)`, this.question.getAllQuestionForQuizz);
    this.router.get(`${this.path}/getQuestionForQuizz/:QuestionId(\\d+)/quizz/:QuizzId(\\d+)`, this.question.getQuestionById);
    this.router.put(`${this.path}/updateQuestionForQuizz/:QuestionId(\\d+)/quizz/:QuizzId(\\d+)`, this.question.updateQuestionForQuizz);
    this.router.delete(`${this.path}/deleteQuestion/:id(\\d+)`, this.question.deleteQuestion);
    this.router.get(`${this.path}/getRandomQuestion/:id(\\d+)`, this.question.getRandomQuizz);
  }
}
