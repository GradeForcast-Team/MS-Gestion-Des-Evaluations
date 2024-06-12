import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { CreateStatusDto } from '@/dtos/status.dto';
import { StatusController } from '@/controllers/status.controller';

export class StatusRoute implements Routes {
  public path = '/status';
  public router = Router();
  public status = new StatusController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, ValidationMiddleware(CreateStatusDto), this.status.createStatus);
    this.router.put(`${this.path}/update/:id(\\d+)`, ValidationMiddleware(CreateStatusDto), this.status.updateStatus);
    this.router.put(`${this.path}/getByRole/:id(\\d+)`, this.status.getStatusByRole);
    this.router.get(`${this.path}/all`, this.status.getAllStatus);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.status.deleteStatuss);
  }
}
