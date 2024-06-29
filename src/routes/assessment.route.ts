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
    this.router.get(`${this.path}/assessmentConceptLearner/concept/:conceptId(\\d+)/learner/:learnerId(\\d+)`, this.autoAssessment.AssessmentConceptLearner);
    this.router.get(`${this.path}/AssessmentConceptLearnerForSession/:sessionId(\\d+)/learner/:learnerId(\\d+)`, this.autoAssessment.AssessmentConceptLearnerForSession);
    this.router.get(`${this.path}/getEvaluationDetailForConcept/concept/:conceptId(\\d+)/learner/:learnerId(\\d+)`, this.autoAssessment.getAssessmentnDetails);
    this.router.get(`${this.path}/concept/:quizzId(\\d+)/learner/:learnerId(\\d+)`, this.autoAssessment.level0Assessment);

  }
}
