import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {validateSyllabusMiddleware} from "@middlewares/validateSyllabus.middleware";
import {QuizzController} from "@controllers/quizz.controller";
import {CreateQuizDto} from "@dtos/quizz.dto";

export class QuizzRoute implements Routes {
  public path = '/quizz';
  public router = Router();
  public quizz = new QuizzController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create/:id(\\d+)`,this.quizz.createQuizz);
    this.router.get(`${this.path}/getAllQuizzForSession/:id(\\d+)`, this.quizz.getAllQuizzForSession);
    this.router.get(`${this.path}/calculatequizz/:quizzId(\\d+)/learner/:learnerId(\\d+)`, this.quizz.calculerNoteLearner);
    this.router.get(`${this.path}/getQuizzForSession/:quizzId(\\d+)/session/:sessionId(\\d+)`, this.quizz.getQuizzById);
    this.router.put(`${this.path}/updateQuizzForSession/:quizzId(\\d+)/session/:sessionId(\\d+)`, this.quizz.updateQuizzForSession);
    this.router.put(`${this.path}/updateQuizzSpecial/:quizzId(\\d+)/session/:sessionId(\\d+)`, this.quizz.updateQuizzSpecial);
    this.router.delete(`${this.path}/deleteQuizz/:id(\\d+)`, this.quizz.deleteQuizz);
  }
}
