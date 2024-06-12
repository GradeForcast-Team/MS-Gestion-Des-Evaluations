import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {validateSyllabusMiddleware} from "@middlewares/validateSyllabus.middleware";
import {SessionController} from "@controllers/session.controller";
import {CreateSessionDto} from "@dtos/session.dto";
import {SessionautoAssessmentController} from "@controllers/sessionautoAssessment.controller";
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
