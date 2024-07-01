import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { EvaluationModeController } from '@/controllers/evaluationMode.controller';
import { CreateEvaluationModeDto, ValidateEvaluationModeDto } from '@/dtos/evaluationMode.dto';


export class EvaluationModeRoute implements Routes {
  public path = '/evaluation-mode';
  public router = Router();
  public evaluationModeController = new EvaluationModeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(CreateEvaluationModeDto),
      this.evaluationModeController.createEvaluationMode
    );
    this.router.put(
      `${this.path}/update/:id(\\d+)`,
      ValidationMiddleware(ValidateEvaluationModeDto),
      this.evaluationModeController.updateEvaluationMode
    );
    this.router.get(`${this.path}/all`, this.evaluationModeController.getAllEvaluationModes);
    this.router.get(`${this.path}/:id(\\d+)`, this.evaluationModeController.getEvaluationModeById);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.evaluationModeController.deleteEvaluationMode);
  }
}
