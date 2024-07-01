import { CreatePedagogicalMethodDto, ValidatePedagogicalMethodDto } from '@/dtos/pedagogicalMethod.dto';
import { PedagogicalMethod } from '@/interfaces/pedagogicalMethode.interface';
import { PedagogicalMethodService } from '@/services/pedagogicalMethod.service';
import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';


export class PedagogicalMethodController {
  public pedagogicalMethodService = Container.get(PedagogicalMethodService);

  public getAllPedagogicalMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pedagogicalMethods: PedagogicalMethod[] = await this.pedagogicalMethodService.getAllPedagogicalMethods();
      res.status(200).json({ data: pedagogicalMethods });
    } catch (error) {
      next(error);
    }
  };

  public getPedagogicalMethodById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pedagogicalMethodId = Number(req.params.id);
      const pedagogicalMethod: PedagogicalMethod = await this.pedagogicalMethodService.getPedagogicalMethodById(pedagogicalMethodId);
      res.status(200).json({ data: pedagogicalMethod });
    } catch (error) {
      next(error);
    }
  };

  public createPedagogicalMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pedagogicalMethodData: CreatePedagogicalMethodDto = req.body;
      const createdPedagogicalMethod: PedagogicalMethod = await this.pedagogicalMethodService.createPedagogicalMethod(pedagogicalMethodData);
      res.status(201).json({ data: createdPedagogicalMethod, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updatePedagogicalMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pedagogicalMethodData: ValidatePedagogicalMethodDto = req.body;
      const pedagogicalMethodId = Number(req.params.id);
      const updatedPedagogicalMethod: PedagogicalMethod = await this.pedagogicalMethodService.updatePedagogicalMethod(pedagogicalMethodId, pedagogicalMethodData);
      res.status(200).json({ data: updatedPedagogicalMethod, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deletePedagogicalMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pedagogicalMethodId = Number(req.params.id);
      const deletedPedagogicalMethod: PedagogicalMethod = await this.pedagogicalMethodService.deletePedagogicalMethod(pedagogicalMethodId);
      res.status(200).json({ data: deletedPedagogicalMethod, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
