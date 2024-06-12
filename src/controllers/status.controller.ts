import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { StatusService } from '@/services/status.service';

export class StatusController {
  public status = Container.get(StatusService);

  public getAllStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllStatuss: Status[]= await this.status.getAllStatuss();

      res.status(200).json({ data: findAllStatuss});
    } catch (error) {
      next(error);
    }
  };

  public getStatusByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const RoleId = Number(req.params.id);
      const findStatusByRole: Status= await this.status.getstatusById(RoleId);

      res.status(200).json({ data: findStatusByRole});
    } catch (error) {
      next(error);
    }
  };

  public createStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const StatusData: Status = req.body;
      const createStatussData: Status = await this.status.createStatus(StatusData);

      res.status(201).json({ data: createStatussData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };


  public deleteStatuss = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const StatusId = Number(req.params.id);
      const deleteStatusId: Status = await this.status.deletestatus(StatusId);

      res.status(200).json({ data: deleteStatusId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const StatusId = Number(req.params.id);
      const StatusData: Status = req.body;
      const updateStatussData: Status = await this.status.updatestatus(StatusId, StatusData);

      res.status(200).json({ data: updateStatussData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };



}
