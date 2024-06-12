import { Router } from 'express';
import {CreateUserDto, ForgetPasswordDto, UpdateUserDto, ValidateAccountDto} from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import {AuthController} from "@controllers/auth.controller";
import {TypesSchoolController} from "@controllers/typesSchool.controller";
import {CreateTypeSchoolDto} from "@dtos/typeschools.dto";
import {ClasseController} from "@controllers/classe.controller";
import {TeacherMiddleware} from "@middlewares/teacher.middleware";

export class ClasseRoute implements Routes {
  public path = '/classe';
  public router = Router();
  public classe = new ClasseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, TeacherMiddleware, ValidationMiddleware(CreateTypeSchoolDto), this.classe.createclasses);
    this.router.put(`${this.path}/update/:id(\\d+)`, TeacherMiddleware, ValidationMiddleware(CreateTypeSchoolDto), this.classe.updateclasses);
    this.router.get(`${this.path}/all`, this.classe.getclasse);
    this.router.get(`${this.path}/:id(\\d+)`, this.classe.getclasseById);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, TeacherMiddleware, this.classe.deleteclasses);
  }
}
