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
    this.router.post(`${this.path}/create`, this.quizz.createQuizz);
    this.router.get(`${this.path}/all`, this.quizz.getAllQuizzForConcept);
    this.router.put(`${this.path}/update`, this.quizz.updateQuizzForConcept);
    this.router.get(`${this.path}/calculate`, this.quizz.calculerNoteLearner);
    this.router.delete(`${this.path}/delete`, this.quizz.deleteQuizz);
   
  }
}
