import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { Conceptcontroller } from '@/controllers/concept.controller';

export class ConceptRoute implements Routes {
  public path = '/concept';
  public router = Router();
  public conceptController = new Conceptcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, this.conceptController.createConcept);
    this.router.get(`${this.path}/all`, this.conceptController.getAllConceptsForSession);
    this.router.get(`${this.path}/:teacherId`, this.conceptController.getTeacherData);
    this.router.get(`${this.path}`, this.conceptController.getConceptById);
    this.router.put(`${this.path}/update`, this.conceptController.updateConcept);
    this.router.delete(`${this.path}/delete`, this.conceptController.deleteConcept);
  }
}
