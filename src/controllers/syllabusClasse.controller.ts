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

  // Fonction pour obtenir tous les syllabus d'un apprenant
  public getAllSyllabusByLearnerId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { learnerId } = req.query;

    try {
      const syllabi = await this.syllabusClasseService.getAllSyllabusByLearnerId(Number(learnerId));
      res.status(200).json({ data: syllabi });
    } catch (error) {
      next(error);
    }
  };

  //Info Learner
  public getLearnerInfoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const learnerId  = req.params.learnerId;

    try {
      const getLearnerInfoById = await this.syllabusClasseService.getLearnerInfoById(Number(learnerId));
      res.status(200).json({ data: getLearnerInfoById });
    } catch (error) {
      next(error);
    }
  };

  // Fonction pour obtenir un syllabus par ID
  public getSyllabusClasseLearnerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    
    const { syllabusId, classeId } = req.query;

    try {
      const syllabus = await this.syllabusClasseService.getSyllabusClasseLearnerById(
        parseInt(syllabusId as string), 
        parseInt(classeId as string), 
      );
      res.status(200).json({ data: syllabus });
    } catch (error) {
      next(error);
    }
  };
}
