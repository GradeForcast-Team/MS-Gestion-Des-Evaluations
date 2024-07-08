import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ClasseController } from '@/controllers/classe.controller';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { CreateClasseDto} from '@/dtos/classe.dto';
export class ClasseRoute implements Routes {
  public path = '/classe';
  public router = Router();
  public classeController = new ClasseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.get(`${this.path}`, this.classeController.getclasse);
    this.router.get(`${this.path}/:id(\\d+)`, this.classeController.getclasseById);
    this.router.post(`${this.path}/create`, ValidationMiddleware(CreateClasseDto), this.classeController.createclasses);
    this.router.put(`${this.path}/update`, this.classeController.updateclasses);
    this.router.delete(`${this.path}/delete`, this.classeController.deleteclasses);
  }
}
