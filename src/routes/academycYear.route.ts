import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AcademicYearController } from '@/controllers/academicYear.controller';
import { CreateAcademicYearDto, ValidateAcademicYearDto } from '@/dtos/academicYears.dto';

export class AcademicYearRoute implements Routes {
  public path = '/academic-year';
  public router = Router();
  public academicYearController = new AcademicYearController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(CreateAcademicYearDto),
      this.academicYearController.createAcademicYear
    );
    this.router.put(
      `${this.path}/update/:id(\\d+)`,
      ValidationMiddleware(ValidateAcademicYearDto),
      this.academicYearController.updateAcademicYear
    );
    this.router.get(`${this.path}/all`, this.academicYearController.getAllAcademicYears);
    this.router.get(`${this.path}/:id(\\d+)`, this.academicYearController.getAcademicYearById);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.academicYearController.deleteAcademicYear);
  }
}
