import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { PeriodeController } from '@/controllers/periode.controller';
import { CreatePeriodeDto, ValidatePeriodeDto } from '@/dtos/periode.dto';

export class PeriodeRoute implements Routes {
  public path = '/periode';
  public router = Router();
  public periodeController = new PeriodeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(CreatePeriodeDto),
      this.periodeController.createPeriode
    );
    this.router.put(
      `${this.path}/update`,
      ValidationMiddleware(ValidatePeriodeDto),
      this.periodeController.updatePeriode
    );
    this.router.get(`${this.path}/all`, this.periodeController.getAllPeriodes);
    this.router.get(`${this.path}`, this.periodeController.getPeriodeById);
    this.router.delete(`${this.path}/delete`, this.periodeController.deletePeriode);
  }
}
