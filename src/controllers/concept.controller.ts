import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import console from 'console';
import { ConceptService } from '@/services/concept.service';

export class Conceptcontroller {
  public conceptService = Container.get(ConceptService);

  public createConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
    try {
      const sessionId = Number(req.query.sessionId);
      const concept = req.body;
      const createdConcept = await this.conceptService.createConcept(sessionId, concept);

      res.status(201).json({ data: createdConcept, message: 'Concept created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllConceptsForSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = Number(req.query.sessionId);
      const concepts = await this.conceptService.getAllConceptsForSession(sessionId);
      res.status(200).json({ data: concepts });
    } catch (error) {
      next(error);
    }
  };

  public getTeacherData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.params.teacherId);
      const concepts = await this.conceptService.getTeacherData(teacherId);
      res.status(200).json({ data: concepts });
    } catch (error) {
      next(error);
    }
  };

  public getConceptById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.query.id);
      const concept = await this.conceptService.getConceptById(conceptId);
      res.status(200).json({ data: concept });
    } catch (error) {
      next(error);
    }
  };

  public updateConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.query.id);
      const conceptData = req.body;
      const updatedConcept = await this.conceptService.updateConcept(conceptId, conceptData);
      res.status(201).json({ data: updatedConcept, message: 'Concept updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.query.id);
      const deletedConcept = await this.conceptService.deleteConcept(conceptId);
      res.status(200).json({ data: deletedConcept, message: 'Concept deleted' });
    } catch (error) {
      next(error);
    }
  };
}
