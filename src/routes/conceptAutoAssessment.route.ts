import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ConceptAutoAssessmentController } from '@controllers/conceptAutoAssessment.controller';

export class ConceptAutoAssessmentRoute implements Routes {
  public path = '/conceptAutoAssessment';
  public router = Router();
  public conceptAutoAssessment = new ConceptAutoAssessmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/autoAssessmentForOneConcept`, 
      this.conceptAutoAssessment.createConceptAutoAssessment
    );
    this.router.post(
      `${this.path}/sessionAutoAssessment`, 
      this.conceptAutoAssessment.saveSessionAutoAssessment
    );
    this.router.get(
      `${this.path}/getAutoAssessmentForOneConcept`, 
      this.conceptAutoAssessment.getConceptAutoAssessmentDetails
    );
    this.router.get(
      `${this.path}/getAutoAssessmentForSession`, 
      this.conceptAutoAssessment.getSessionAutoAssessmentDetails
    );
    this.router.get(
      `${this.path}/getLink`, 
      this.conceptAutoAssessment.getAutoAssessmentLink
    );
    this.router.get(
      `${this.path}/generateLink`, 
      this.conceptAutoAssessment.generateAutoAssessmentLink
    );
  //  this.router.get(`${this.path}/getAllAutoAssessmentsByLearner`,
  //      this.conceptAutoAssessment.getAllAutoAssessmentsByLearner); 
       this.router.get(`${this.path}/getAllAutoAssessmentsByLearner`,
        this.conceptAutoAssessment.getAllAutoAssessmentByLearnerId); 

  }

}
