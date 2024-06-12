import { Router } from 'express';
import {CreateUserDto, ForgetPasswordDto, UpdateUserDto, ValidateAccountDto} from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import {AuthController} from "@controllers/auth.controller";

export class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/registerTeacher`, this.auth.registerTeacher);
    this.router.post(`${this.path}/loginTeacher`, ValidationMiddleware(UpdateUserDto), this.auth.logInTeacher);
  }
}
