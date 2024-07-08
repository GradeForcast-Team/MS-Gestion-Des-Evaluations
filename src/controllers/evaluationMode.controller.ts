import { CreateEvaluationModeDto, ValidateEvaluationModeDto } from '@/dtos/evaluationMode.dto';
import { EvaluationMode } from '@/interfaces/evaluationMode.interface';
import { EvaluationModeService } from '@/services/evaluationMode.service';
import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';

export class EvaluationModeController {
  public evaluationModeService = Container.get(EvaluationModeService);

  public getAllEvaluationModes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evaluationModes: EvaluationMode[] = await this.evaluationModeService.getAllEvaluationModes();
      res.status(200).json({ data: evaluationModes });
    } catch (error) {
      next(error);
    }
  };

  public getEvaluationModeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evaluationModeId = Number(req.query.id);
      const evaluationMode: EvaluationMode = await this.evaluationModeService.getEvaluationModeById(evaluationModeId);
      res.status(200).json({ data: evaluationMode });
    } catch (error) {
      next(error);
    }
  };

  public createEvaluationMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evaluationModeData: CreateEvaluationModeDto = req.body;
      const createdEvaluationMode: EvaluationMode = await this.evaluationModeService.createEvaluationMode(evaluationModeData);
      res.status(201).json({ data: createdEvaluationMode, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateEvaluationMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evaluationModeData: ValidateEvaluationModeDto = req.body;
      const evaluationModeId = Number(req.query.id);
      const updatedEvaluationMode: EvaluationMode = await this.evaluationModeService.updateEvaluationMode(evaluationModeId, evaluationModeData);
      res.status(200).json({ data: updatedEvaluationMode, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteEvaluationMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evaluationModeId = Number(req.query.id);
      const deletedEvaluationMode: EvaluationMode = await this.evaluationModeService.deleteEvaluationMode(evaluationModeId);
      res.status(200).json({ data: deletedEvaluationMode, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
