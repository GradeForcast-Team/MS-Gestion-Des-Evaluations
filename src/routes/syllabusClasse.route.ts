import { Router } from 'express';
import { SyllabusClasseController } from '../controllers/syllabusClasse.controller';
import { Routes } from '@interfaces/routes.interface';

export class SyllabusClasseRoute implements Routes {
  public path = '/syllabusclasse';
  public router = Router();
  public syllabusClasse = new SyllabusClasseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/syllabus/:syllabusId/classe`, this.syllabusClasse.getSyllabusClassesBySyllabusId);
    this.router.get(`${this.path}/delete/:id(\\d+)/classe/:classeId/syllabus`, this.syllabusClasse.getSyllabusClassesByClasseId);
    this.router.post(`${this.path}/create`, this.syllabusClasse.createSyllabusClasse);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.syllabusClasse.deleteSyllabusClasse);
  }
}
