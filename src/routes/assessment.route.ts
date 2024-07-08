import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AssessmentController } from '@/controllers/assessment.controller';

export class AssessmentRoute implements Routes {
  public path = '/assessment';
  public router = Router();
  public assessmentController = new AssessmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/level0`, this.assessmentController.level0Assessment);
    this.router.get(`${this.path}/concept`, this.assessmentController.AssessmentConceptLearner);
    this.router.get(`${this.path}/session`, this.assessmentController.AssessmentConceptLearnerForSession);
    this.router.get(`${this.path}/details`, this.assessmentController.getAssessmentDetails);
  }
}
