import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {SessionautoAssessmentController} from "@controllers/sessionautoAssessment.controller";

export class AutoAssessmentRoute implements Routes {
  public path = '/autoAssessment';
  public router = Router();
  public autoAssessment = new SessionautoAssessmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, this.autoAssessment.createAutoAssessment);
    this.router.get(`${this.path}/getAutoEvaluationScoresClasseForTeacher/:id(\\d+)`, this.autoAssessment.getAutoEvaluationScoresClasseForTeacher);
    this.router.get(`${this.path}/getAutoEvaluationScoresForLearnersInClass/:id(\\d+)`, this.autoAssessment.getAutoEvaluationScoresForLearnersInClass);
  }
}
