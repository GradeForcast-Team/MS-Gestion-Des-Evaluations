import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { SyllabusClasseService } from '../services/syllabusClasse.service';

export class SyllabusClasseController {
  public syllabusClasseService = Container.get(SyllabusClasseService);

  public getSyllabusClassesBySyllabusId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { syllabusId } = req.params;

    try {
      const syllabusClasses = await this.syllabusClasseService.getSyllabusClassesBySyllabusId(Number(syllabusId));
      res.status(200).json({ data: syllabusClasses });
    } catch (error) {
      next(error);
    }
  };

  public getSyllabusClassesByClasseId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { classeId } = req.params;

    try {
      const syllabusClasses = await this.syllabusClasseService.getSyllabusClassesByClasseId(Number(classeId));
      res.status(200).json({ data: syllabusClasses });
    } catch (error) {
      next(error);
    }
  };

  public createSyllabusClasse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { syllabusId, classeId } = req.body;

    try {
      const syllabusClasse = await this.syllabusClasseService.createSyllabusClasse(syllabusId, classeId);
      res.status(201).json({ data: syllabusClasse, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteSyllabusClasse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { syllabusId, classeId } = req.body;

    try {
      const deletedSyllabusClasse = await this.syllabusClasseService.deleteSyllabusClasse(syllabusId, classeId);
      res.status(200).json({ data: deletedSyllabusClasse, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
