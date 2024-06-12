import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {SessionautoAssessmentController} from "@controllers/sessionautoAssessment.controller";
import {AssessmentController} from "@controllers/assessment.controller";

export class AssessmentRoute implements Routes {
  public path = '/assessment';
  public router = Router();
  public autoAssessment = new AssessmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/concept/:quizzId(\\d+)/learner/:learnerId(\\d+)`, this.autoAssessment.level0Assessment);
  }
}
