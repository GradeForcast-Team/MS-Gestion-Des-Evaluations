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
    this.router.post(`${this.path}/autoAssessmentForOneConcept/concept/:conceptId(\\d+)/learner/:learnerId(\\d+)`, this.conceptAutoAssessment.createConceptAutoAssessment);
    this.router.post(`${this.path}/session/:sessionId(\\d+)/learner/:learnerId(\\d+)`, this.conceptAutoAssessment.saveSessionAutoAssessment);
    this.router.get(`${this.path}/getautoAssessmentForOneConcept/concept/:conceptId(\\d+)/learner/:learnerId(\\d+)`, this.conceptAutoAssessment.getConceptAutoAssessmentDetails);
    this.router.get(`${this.path}/getautoAssessmentForSession/session/:sessionId(\\d+)/learner/:learnerId(\\d+)`, this.conceptAutoAssessment.getSessionAutoAssessmentDetails);
  }
}
