import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {ConceptAutoAssessmentController} from "@controllers/conceptAutoAssessment.controller";

export class ConceptAutoAssessmentRoute implements Routes {
  public path = '/conceptAutoAssessment';
  public router = Router();
  public conceptAutoAssessment = new ConceptAutoAssessmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/autoAssessmentForOneConcept/:conceptId(\\d+)/learner/:learnerId(\\d+)`, this.conceptAutoAssessment.createConceptAutoAssessment);
  }
}
