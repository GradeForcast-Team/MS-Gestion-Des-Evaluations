import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import console from 'console';
import { QuizzService } from '@services/quizz.service';
import { Quiz } from '@interfaces/quizz.interface';
import { SessionService } from '@/services/session.service';
import { ConceptService } from '@/services/concept.service';

export class Conceptcontroller {
  public conceptService = Container.get(ConceptService);
  public createConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
    try {
      const sessionId = Number(req.params.id);
      const concept = req.body;
      const createdQuizz = await this.conceptService.createConcept(sessionId, concept);

      res.status(201).json({ data: createdQuizz, message: 'Concept created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllConceptsForSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = Number(req.params.sessionId);
      const concepts = await this.conceptService.getAllConceptsForSession(sessionId);
      res.status(200).json({ data: concepts });
    } catch (error) {
      next(error);
    }
  };

  public getConceptById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.params.id);
      const concept = await this.conceptService.getConceptById(conceptId);
      res.status(200).json({ data: concept });
    } catch (error) {
      next(error);
    }
  };

  public updateConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.params.id);
      const conceptData = req.body;
      const updatedConcept = await this.conceptService.updateConcept(conceptId, conceptData);
      res.status(201).json({ data: updatedConcept, message: 'Concept updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.params.id);
      const deletedConcept = await this.conceptService.deleteConcept(conceptId);
      res.status(200).json({ data: deletedConcept, message: 'Concept deleted' });
    } catch (error) {
      next(error);
    }
  };
}
