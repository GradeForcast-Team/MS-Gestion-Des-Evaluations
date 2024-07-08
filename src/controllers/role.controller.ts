import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RolesService } from '@/services/role.service';
import { Role } from '@/interfaces/role.interface';
import { logger } from '@utils/logger';

export class RoleController {
  public role = Container.get(RolesService);

  public getAllRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("le get");
      const findAllRoles: Role[] = await this.role.getAllroles();
      res.status(200).json({ data: findAllRoles });
    } catch (error) {
      next(error);
    }
  };

  public createRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const RolesData: Role = req.body;
      const createRolesData: Role = await this.role.createrole(RolesData);
      res.status(201).json({ data: createRolesData, message: 'created' });
    } catch (error) {
      logger.error("le error", error);
      next(error);
    }
  };

  public deleteRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const RoleId = Number(req.query.id);
      const deleteRoleId: Role = await this.role.deleterole(RoleId);
      res.status(200).json({ data: deleteRoleId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const RoleId = Number(req.query.id);
      const RolesData: Role = req.body;
      const updateRolesData: Role = await this.role.updaterole(RoleId, RolesData.name);
      res.status(200).json({ data: updateRolesData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}
