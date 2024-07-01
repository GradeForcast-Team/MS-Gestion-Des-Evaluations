import { CreateTypeAssessmentDto, ValidateTypeAssessmentDto } from '@/dtos/typeAssessment.dto';
import { TypeAssessment } from '@/interfaces/typeAssessment.interface';
import { TypeAssessmentService } from '@/services/typeAssessment.service';
import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';

export class TypeAssessmentController {
  public typeAssessment = Container.get(TypeAssessmentService);

  public getAllTypeAssessments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeAssessments: TypeAssessment[] = await this.typeAssessment.getAllTypeAssessments();
      res.status(200).json({ data: typeAssessments });
    } catch (error) {
      next(error);
    }
  };

  public getTypeAssessmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeAssessmentId = Number(req.params.id);
      const typeAssessment: TypeAssessment = await this.typeAssessment.getTypeAssessmentById(typeAssessmentId);
      res.status(200).json({ data: typeAssessment });
    } catch (error) {
      next(error);
    }
  };

  public createTypeAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeAssessmentData: CreateTypeAssessmentDto = req.body;
      const createdTypeAssessment: TypeAssessment = await this.typeAssessment.createTypeAssessment(typeAssessmentData);
      res.status(201).json({ data: createdTypeAssessment, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateTypeAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeAssessmentData: ValidateTypeAssessmentDto = req.body;
      const typeAssessmentId = Number(req.params.id);
      const updatedTypeAssessment: TypeAssessment = await this.typeAssessment.updateTypeAssessment(typeAssessmentId, typeAssessmentData);
      res.status(200).json({ data: updatedTypeAssessment, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTypeAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeAssessmentId = Number(req.params.id);
      const deletedTypeAssessment: TypeAssessment = await this.typeAssessment.deleteTypeAssessment(typeAssessmentId);
      res.status(200).json({ data: deletedTypeAssessment, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
