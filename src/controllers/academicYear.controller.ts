import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { AcademicYearService } from '@/services/academicYear.service';
import { AcademicYear } from '@/interfaces/academicYear.interface';
import { CreateAcademicYearDto, ValidateAcademicYearDto } from '@/dtos/academicYears.dto';

export class AcademicYearController {
  public academicYear = Container.get(AcademicYearService);

  public getAllAcademicYears = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const academicYears: AcademicYear[] = await this.academicYear.getAllAcademicYears();
      res.status(200).json({ data: academicYears });
    } catch (error) {
      next(error);
    }
  };

  public getAcademicYearById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const academicYearId = Number(req.params.id);
      const academicYear: AcademicYear = await this.academicYear.getAcademicYearById(academicYearId);
      res.status(200).json({ data: academicYear });
    } catch (error) {
      next(error);
    }
  };

  public createAcademicYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const academicYearData: CreateAcademicYearDto = req.body;
      const createdAcademicYear: AcademicYear = await this.academicYear.createAcademicYear(academicYearData);
      res.status(201).json({ data: createdAcademicYear, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateAcademicYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const academicYearData: ValidateAcademicYearDto = req.body;
      const academicYearId = Number(req.params.id);
      const updatedAcademicYear: AcademicYear = await this.academicYear.updateAcademicYear(academicYearId, academicYearData);
      res.status(200).json({ data: updatedAcademicYear, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteAcademicYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const academicYearId = Number(req.params.id);
      const deletedAcademicYear: AcademicYear = await this.academicYear.deleteAcademicYear(academicYearId);
      res.status(200).json({ data: deletedAcademicYear, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
