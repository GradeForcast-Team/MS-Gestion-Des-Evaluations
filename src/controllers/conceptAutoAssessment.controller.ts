import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { ConceptAutoAssessmentService } from '@services/conceptAutoAssessment.service';

export class ConceptAutoAssessmentController {
  public conceptAutoAssessmentService = Container.get(ConceptAutoAssessmentService);

  // Auto-évaluation d'un Concept
  public createConceptAutoAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conceptId, learnerId, optionId } = req.query;
      const createAutoAssessmentData = await this.conceptAutoAssessmentService.saveConceptAutoAssessment(
        parseInt(conceptId as string), 
        parseInt(learnerId as string), 
        parseInt(optionId as string)
      );
      res.status(201).json({ data: createAutoAssessmentData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  // Auto-évaluation d'une session
  public saveSessionAutoAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, learnerId } = req.query;
      const { assessments } = req.body;
      const assessmentResults = await this.conceptAutoAssessmentService.saveSessionAutoAssessment(
        parseInt(sessionId as string), 
        parseInt(learnerId as string), 
        assessments
      );
      res.status(201).json({ data: assessmentResults, message: 'Session auto-assessment saved' });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les informations d'une auto-évaluation pour un concept
  public getConceptAutoAssessmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { learnerId, conceptId } = req.query;
      const autoAssessmentDetails = await this.conceptAutoAssessmentService.getConceptAutoAssessmentDetails(
        parseInt(learnerId as string), 
        parseInt(conceptId as string)
      );
      res.status(200).json({ data: autoAssessmentDetails });
    } catch (error) {
      next(error);
    }
  };

  // optenir toutes les auto-evalution du learner
  public getAllAutoAssessmentsByLearner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.query)
    try {
      const learnerId =Number(req.query.learnerId);
      const autoAssessments = await this.conceptAutoAssessmentService.getAllAutoAssessmentsByLearner(learnerId);
      res.status(200).json({ data: autoAssessments });
    } catch (error) {
      next(error);
    }
  };



  // Obtenir les informations d'une auto-évaluation pour une session
  public getSessionAutoAssessmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { learnerId, sessionId } = req.query;
      const autoAssessmentDetails = await this.conceptAutoAssessmentService.getSessionAutoAssessmentDetails(
        parseInt(learnerId as string), 
        parseInt(sessionId as string)
      );
      res.status(200).json({ data: autoAssessmentDetails });
    } catch (error) {
      next(error);
    }
  };

  //liste de tous les auto-evaluation du learner
  public getAllAutoAssessmentByLearnerId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { learnerId } = req.query;
      const getAllAutoAssessmentByLearnerId = await this.conceptAutoAssessmentService.getAllAutoAssessmentsByLe(
        parseInt(learnerId as string) 
      );
      res.status(200).json({ data: getAllAutoAssessmentByLearnerId });
    } catch (error) {
      next(error);
    }
  };

  // Générer un lien pour l'auto-évaluation d'une session
  public getAutoAssessmentLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, teacherId, schoolId } = req.query;
      const linkData = await this.conceptAutoAssessmentService.getAutoAssessmentLink(
        parseInt(sessionId as string),
        parseInt(teacherId as string),
        parseInt(schoolId as string)
      );
      res.status(200).json({ data: linkData });
    } catch (error) {
      next(error);
    }
  };

  public generateAutoAssessmentLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, teacherId, schoolId } = req.query;
      const linkData = await this.conceptAutoAssessmentService.generateAutoAssessmentLink(
        parseInt(sessionId as string),
        parseInt(teacherId as string),
        parseInt(schoolId as string)
      );
      res.status(200).json({ data: linkData, message: 'Link generated' });
    } catch (error) {
      next(error);
    }
  };
}
