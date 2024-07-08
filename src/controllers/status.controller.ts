import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { StatusService } from '@/services/status.service';

export class StatusController {
  public statusService = Container.get(StatusService);

  public getAllStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllStatus: Status[] = await this.statusService.getAllStatuss();
      res.status(200).json({ data: findAllStatus });
    } catch (error) {
      next(error);
    }
  };

  public getStatusByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleId = Number(req.query.roleId);
      const findStatusByRole = await this.statusService.getStatutsByRole(roleId);
      res.status(200).json({ data: findStatusByRole });
    } catch (error) {
      next(error);
    }
  };

  public createStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusData: Status = req.body;
      const createStatusData: Status = await this.statusService.createStatus(statusData);
      res.status(201).json({ data: createStatusData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusId = Number(req.query.id);
      const deleteStatusId: Status = await this.statusService.deletestatus(statusId);
      res.status(200).json({ data: deleteStatusId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusId = Number(req.query.id);
      const statusData: Status = req.body;
      const updateStatusData: Status = await this.statusService.updatestatus(statusId, statusData);
      res.status(200).json({ data: updateStatusData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}
