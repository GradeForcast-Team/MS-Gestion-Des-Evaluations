import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { Periode } from '@/interfaces/periode.interface';
import { PeriodeService } from '@/services/periode.service';
import { CreatePeriodeDto, ValidatePeriodeDto } from '@/dtos/periode.dto';

export class PeriodeController {
  public periodeService = Container.get(PeriodeService);

  public getAllPeriodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const periodes: Periode[] = await this.periodeService.getAllPeriodes();
      res.status(200).json({ data: periodes });
    } catch (error) {
      next(error);
    }
  };

  public getPeriodeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const periodeId = Number(req.query.id);
      const periode: Periode = await this.periodeService.getPeriodeById(periodeId);
      res.status(200).json({ data: periode });
    } catch (error) {
      next(error);
    }
  };

  public createPeriode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const periodeData: CreatePeriodeDto = req.body;
      const createdPeriode: Periode = await this.periodeService.createPeriode(periodeData);
      res.status(201).json({ data: createdPeriode, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updatePeriode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const periodeData: ValidatePeriodeDto = req.body;
      const periodeId = Number(req.query.id);
      const updatedPeriode: Periode = await this.periodeService.updatePeriode(periodeId, periodeData);
      res.status(200).json({ data: updatedPeriode, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deletePeriode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const periodeId = Number(req.query.id);
      const deletedPeriode: Periode = await this.periodeService.deletePeriode(periodeId);
      res.status(200).json({ data: deletedPeriode, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
