import { Router } from 'express';
import {CreateUserDto, ForgetPasswordDto, UpdateUserDto, ValidateAccountDto} from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import {AuthController} from "@controllers/auth.controller";
import {TypesSchoolController} from "@controllers/typesSchool.controller";
import {SchoolController} from "@controllers/school.controller";
import {CreateSchoolDto, ValidateSchoolDto} from "@dtos/schools.dto";

export class SchoolRoute implements Routes {
  public path = '/school';
  public router = Router();
  public school = new SchoolController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, ValidationMiddleware(CreateSchoolDto), this.school.createSchools);
    this.router.put(`${this.path}/update/:id(\\d+)`, ValidationMiddleware(ValidateSchoolDto), this.school.updateSchools);
    this.router.get(`${this.path}/all`, this.school.getSchool);
    this.router.get(`${this.path}/:id(\\d+)`, this.school.getSchoolById);
    this.router.get(`${this.path}/getschoolbyType/:id(\\d+)`, this.school.getSchoolsByTypeSchools);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.school.deleteSchools);
  }
}
