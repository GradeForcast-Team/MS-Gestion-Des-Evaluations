import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {SessionAutoAssessmentService} from "@services/sessionAutoAssessment.service";
import {AutoAssessmentInterface} from "@interfaces/autoAssessment.interface";
import {ConceptAutoAssessmentService} from "@services/conceptAutoAssessment.service";

export class ConceptAutoAssessmentController {

  public conceptAutoAssessmentService = Container.get(ConceptAutoAssessmentService);
  // Auto evaluation d'un Concept
  public createConceptAutoAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conceptId, learnerId } = req.params;
      const { criteriaId } = req.body;
      const createAutoAssessmentData = await this.conceptAutoAssessmentService.saveConceptAutoAssessment(parseInt(conceptId), parseInt(learnerId), criteriaId);
      res.status(201).json({data: createAutoAssessmentData, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  // Auto Evaluation d'une session
  public saveSessionAutoAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assessments } = req.body;
      const { sessionId, learnerId } = req.params;
      const assessmentResults = await this.conceptAutoAssessmentService.saveSessionAutoAssessment(parseInt(sessionId), parseInt(learnerId), assessments);
  
      res.status(201).json({ data: assessmentResults, message: 'Session auto-assessment saved' });
    } catch (error) {
      next(error);
    }
  };

  // Controller pour obtenir les informations d'une auto-évaluation pour un concept
  public getConceptAutoAssessmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { learnerId, conceptId } = req.params;
      const autoAssessmentDetails = await this.conceptAutoAssessmentService.getConceptAutoAssessmentDetails(parseInt(learnerId), parseInt(conceptId));
      res.status(200).json({ data: autoAssessmentDetails });
    } catch (error) {
      next(error);
    }
  };

  // Controller pour obtenir les informations d'une auto-évaluation pour une session
  public getSessionAutoAssessmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { learnerId, sessionId } = req.params;
      const autoAssessmentDetails = await this.conceptAutoAssessmentService.getSessionAutoAssessmentDetails(parseInt(learnerId), parseInt(sessionId));
      res.status(200).json({ data: autoAssessmentDetails });
    } catch (error) {
      next(error);
    }
  };
}
