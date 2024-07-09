import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { OptionsController } from '@/controllers/options.controller';

export class OptionsRoute implements Routes {
  public path = '/options';
  public router = Router();
  public optionsController = new OptionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, this.optionsController.getAllOptions);
    this.router.get(`${this.path}`, this.optionsController.getOptionById);
    this.router.post(`${this.path}/create`, this.optionsController.createOption);
    this.router.put(`${this.path}/update`, this.optionsController.updateOption);
    this.router.delete(`${this.path}/delete`, this.optionsController.deleteOption);
  }
}
