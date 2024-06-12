import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { RoleController } from '@/controllers/role.controller';
import { CreateRoleDto } from '@/dtos/role.dto';

export class RoleRoute implements Routes {
  public path = '/role';
  public router = Router();
  public role = new RoleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, ValidationMiddleware(CreateRoleDto), this.role.createRoles);
    this.router.put(`${this.path}/update/:id(\\d+)`, ValidationMiddleware(CreateRoleDto), this.role.updateRoles);
    this.router.get(`${this.path}/all`, this.role.getAllRole);
    this.router.delete(`${this.path}/delete/:id(\\d+)`, this.role.deleteRoles);
  }
}
