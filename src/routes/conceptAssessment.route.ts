import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {ConceptAutoAssessmentController} from "@controllers/conceptAutoAssessment.controller";

export class ConceptAssessmentRoute implements Routes {
  public path = '/conceptAutoAssessment';
  public router = Router();
  public conceptAutoAssessment = new ConceptAutoAssessmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, this.conceptAutoAssessment.createConceptAutoAssessment);
  }
}
