import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { PedagogicalMethodController } from '@/controllers/pedagogicalMethod.controller';
import { CreatePedagogicalMethodDto, ValidatePedagogicalMethodDto } from '@/dtos/pedagogicalMethod.dto';

export class PedagogicalMethodRoute implements Routes {
  public path = '/pedagogical-method';
  public router = Router();
  public pedagogicalMethodController = new PedagogicalMethodController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(CreatePedagogicalMethodDto),
      this.pedagogicalMethodController.createPedagogicalMethod
    );
    this.router.put(
      `${this.path}/update`,
      ValidationMiddleware(ValidatePedagogicalMethodDto),
      this.pedagogicalMethodController.updatePedagogicalMethod
    );
    this.router.get(`${this.path}/all`, this.pedagogicalMethodController.getAllPedagogicalMethods);
    this.router.get(`${this.path}`, this.pedagogicalMethodController.getPedagogicalMethodById);
    this.router.delete(`${this.path}/delete`, this.pedagogicalMethodController.deletePedagogicalMethod);
  }
}
