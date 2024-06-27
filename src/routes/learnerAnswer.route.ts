import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import {AuthController} from "@controllers/auth.controller";
import {LearnerAnswerController} from "@controllers/learnerAnswer.controller";

export class LearnerAnswerRoute implements Routes {
  public path = '/learnerAnswer';
  public router = Router();
  public learnerAnswer = new LearnerAnswerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create/:quizzId(\\d+)/learner/:learnerId(\\d+)`, this.learnerAnswer.createlearnerAnswer);
  }
}
