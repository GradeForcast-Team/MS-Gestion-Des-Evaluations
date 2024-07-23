import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { NiveauService } from '@/services/niveau.service';
import { CreateNiveauDto } from '@/dtos/niveau.dto';
import { Niveau } from '@/interfaces/niveau.interface';

export class NiveauController {
  public niveauService = Container.get(NiveauService);

  public getAllNiveaux = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllNiveaux: Niveau[] = await this.niveauService.getAllNiveaux();
      res.status(200).json({ data: findAllNiveaux });
    } catch (error) {
      next(error);
    }
  };

  public getNiveauById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findNiveau: Niveau = await this.niveauService.getNiveauById(id);
      res.status(200).json({ data: findNiveau });
    } catch (error) {
      next(error);
    }
  };

  public getNiveauxByTypeSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeSchoolId = Number(req.query.typeSchoolId);
      const findNiveaux = await this.niveauService.getNiveauxByTypeSchool(typeSchoolId);
      res.status(200).json({ data: findNiveaux });
    } catch (error) {
      next(error);
    }
  };

  public createNiveau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const niveauData: CreateNiveauDto = req.body;
      const createNiveauData: Niveau = await this.niveauService.createNiveau(niveauData);
      res.status(201).json({ data: createNiveauData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateNiveau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const niveauData: CreateNiveauDto = req.body;
      const updateNiveauData: Niveau = await this.niveauService.updateNiveau(id, niveauData);
      res.status(200).json({ data: updateNiveauData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteNiveau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const deleteNiveauData: Niveau = await this.niveauService.deleteNiveau(id);
      res.status(200).json({ data: deleteNiveauData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
