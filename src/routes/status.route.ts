import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { StatusController } from '@/controllers/status.controller';

export class StatusRoute implements Routes {
  public path = '/status';
  public router = Router();
  public statusController = new StatusController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, this.statusController.getAllStatus);
    this.router.get(`${this.path}`, this.statusController.getStatusByRole);
    this.router.post(`${this.path}/create`, this.statusController.createStatus);
    this.router.put(`${this.path}/update`, this.statusController.updateStatus);
    this.router.delete(`${this.path}/delete`, this.statusController.deleteStatus);
  }
}
