import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { SupportsPedagogiquesController } from '@/controllers/supportPedagogic.controller';
import { CreateSupportsPedagogiquesDto, ValidateSupportsPedagogiquesDto } from '@/dtos/supportsPedagogiques.dto';


export class SupportsPedagogiquesRoute implements Routes {
  public path = '/supports-pedagogiques';
  public router = Router();
  public supportsPedagogiquesController = new SupportsPedagogiquesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(CreateSupportsPedagogiquesDto),
      this.supportsPedagogiquesController.createSupportsPedagogiques
    );
    this.router.put(
      `${this.path}/update/:id(\\d+)`,
      ValidationMiddleware(ValidateSupportsPedagogiquesDto),
      this.supportsPedagogiquesController.updateSupportsPedagogiques
    );
    this.router.get(`${this.path}/all`, this.supportsPedagogiquesController.getAllSupportsPedagogiques);
    this.router.get(`${this.path}/:id(\\d+)`, this.supportsPedagogiquesController.getSupportsPedagogiquesById);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.supportsPedagogiquesController.deleteSupportsPedagogiques);
  }
}
