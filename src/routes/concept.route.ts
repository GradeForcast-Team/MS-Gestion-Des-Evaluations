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
    this.router.post(`${this.path}/create/:id(\\d+)`, this.conceptController.createConcept);
    this.router.get(`${this.path}/session/:sessionId(\\d+)`, this.conceptController.getAllConceptsForSession);
    this.router.get(`${this.path}/:id(\\d+)`, this.conceptController.getConceptById);
    this.router.put(`${this.path}/:id(\\d+)`, this.conceptController.updateConcept);
    this.router.delete(`${this.path}/:id(\\d+)`, this.conceptController.deleteConcept);
  }
}
