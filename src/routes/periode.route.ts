import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { TypeAssessmentController } from '@/controllers/typeAssessment.controller';
import { CreateTypeAssessmentDto, ValidateTypeAssessmentDto } from '@/dtos/typeAssessment.dto';

export class TypeAssessmentRoute implements Routes {
  public path = '/type-assessment';
  public router = Router();
  public typeAssessmentController = new TypeAssessmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(CreateTypeAssessmentDto),
      this.typeAssessmentController.createTypeAssessment
    );
    this.router.put(
      `${this.path}/update/:id(\\d+)`,
      ValidationMiddleware(ValidateTypeAssessmentDto),
      this.typeAssessmentController.updateTypeAssessment
    );
    this.router.get(`${this.path}/all`, this.typeAssessmentController.getAllTypeAssessments);
    this.router.get(`${this.path}/:id(\\d+)`, this.typeAssessmentController.getTypeAssessmentById);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.typeAssessmentController.deleteTypeAssessment);
  }
}
