import { CreateSupportsPedagogiquesDto, ValidateSupportsPedagogiquesDto } from '@/dtos/supportsPedagogiques.dto';
import { SupportsPedagogiquesService } from '@/services/supportsPedagogiques.service';
import { SupportsPedagogiques } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';


export class SupportsPedagogiquesController {
  public supportsPedagogiquesService = Container.get(SupportsPedagogiquesService);

  public getAllSupportsPedagogiques = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supportsPedagogiques: SupportsPedagogiques[] = await this.supportsPedagogiquesService.getAllSupportsPedagogiques();
      res.status(200).json({ data: supportsPedagogiques });
    } catch (error) {
      next(error);
    }
  };

  public getSupportsPedagogiquesById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supportsPedagogiquesId = Number(req.params.id);
      const supportsPedagogiques: SupportsPedagogiques = await this.supportsPedagogiquesService.getSupportsPedagogiquesById(supportsPedagogiquesId);
      res.status(200).json({ data: supportsPedagogiques });
    } catch (error) {
      next(error);
    }
  };

  public createSupportsPedagogiques = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supportsPedagogiquesData: CreateSupportsPedagogiquesDto = req.body;
      const createdSupportsPedagogiques: SupportsPedagogiques = await this.supportsPedagogiquesService.createSupportsPedagogiques(supportsPedagogiquesData);
      res.status(201).json({ data: createdSupportsPedagogiques, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateSupportsPedagogiques = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supportsPedagogiquesData: ValidateSupportsPedagogiquesDto = req.body;
      const supportsPedagogiquesId = Number(req.params.id);
      const updatedSupportsPedagogiques: SupportsPedagogiques = await this.supportsPedagogiquesService.updateSupportsPedagogiques(supportsPedagogiquesId, supportsPedagogiquesData);
      res.status(200).json({ data: updatedSupportsPedagogiques, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteSupportsPedagogiques = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supportsPedagogiquesId = Number(req.params.id);
      const deletedSupportsPedagogiques: SupportsPedagogiques = await this.supportsPedagogiquesService.deleteSupportsPedagogiques(supportsPedagogiquesId);
      res.status(200).json({ data: deletedSupportsPedagogiques, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
