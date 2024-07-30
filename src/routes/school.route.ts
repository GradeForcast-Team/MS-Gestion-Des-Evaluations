import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { SchoolController } from '@/controllers/school.controller';

export class SchoolRoute implements Routes {
  public path = '/school';
  public router = Router();
  public schoolController = new SchoolController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, this.schoolController.getSchool);
    this.router.get(`${this.path}`, this.schoolController.getSchoolById);
    this.router.get(`${this.path}/schoolByTeacher`, this.schoolController.getSchoolsAndLevelsForTeacher);
    this.router.post(`${this.path}/create`, this.schoolController.createSchools);
    this.router.put(`${this.path}/update`, this.schoolController.updateSchools);
    this.router.delete(`${this.path}/delete`, this.schoolController.deleteSchools);
    this.router.get(`${this.path}/by-type`, this.schoolController.getSchoolsByTypeSchools);
  }
}
