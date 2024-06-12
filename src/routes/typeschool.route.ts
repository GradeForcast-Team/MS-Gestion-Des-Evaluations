import { Router } from 'express';
import {CreateUserDto, ForgetPasswordDto, UpdateUserDto, ValidateAccountDto} from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import {AuthController} from "@controllers/auth.controller";
import {TypesSchoolController} from "@controllers/typesSchool.controller";
import {CreateTypeSchoolDto} from "@dtos/typeschools.dto";

export class TypeschoolRoute implements Routes {
  public path = '/typeschool';
  public router = Router();
  public typeschool = new TypesSchoolController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, ValidationMiddleware(CreateTypeSchoolDto), this.typeschool.createTypeSchools);
    this.router.put(`${this.path}/update/:id(\\d+)`, ValidationMiddleware(CreateTypeSchoolDto), this.typeschool.updateTypeSchools);
    this.router.get(`${this.path}/all`, this.typeschool.getTypeSchool);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.typeschool.deleteTypeSchools);
  }
}
