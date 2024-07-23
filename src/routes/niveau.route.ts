import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { StatusController } from '@/controllers/status.controller';
import { NiveauController } from '@/controllers/niveau.controller';

export class NiveauRoute implements Routes {
  public path = '/niveau';
  public router = Router();
  public niveauController = new NiveauController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, this.niveauController.getAllNiveaux);
    this.router.get(`${this.path}`, this.niveauController.getNiveauById);
    this.router.post(`${this.path}/create`, this.niveauController.createNiveau);
    this.router.put(`${this.path}/update`, this.niveauController.updateNiveau);
    this.router.delete(`${this.path}/delete`, this.niveauController.deleteNiveau);
  }
}
