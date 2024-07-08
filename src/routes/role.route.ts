import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { RoleController } from '@/controllers/role.controller';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { CreateRoleDto } from '@/dtos/role.dto';

export class RoleRoute implements Routes {
  public path = '/roles';
  public router = Router();
  public roleController = new RoleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, this.roleController.getAllRole);
    this.router.post(`${this.path}/create`, ValidationMiddleware(CreateRoleDto), this.roleController.createRoles);
    this.router.put(`${this.path}/update`, this.roleController.updateRoles);
    this.router.delete(`${this.path}/delete`, this.roleController.deleteRoles);
  }
}
