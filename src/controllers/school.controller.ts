import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { SchoolsService } from '@services/schools.service';
import { Schools } from '@interfaces/schools.interface';
import { TypeSchools } from '@interfaces/types_schools.interface';

export class SchoolController {
  public schoolService = Container.get(SchoolsService);

  public getSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllSchools: Schools[] = await this.schoolService.getAllSchools();
      res.status(200).json({ data: findAllSchools });
    } catch (error) {
      next(error);
    }
  };

  public getSchoolById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = Number(req.query.id);
      const findSchool: Schools = await this.schoolService.getSchoolById(schoolId);
      res.status(200).json({ data: findSchool });
    } catch (error) {
      next(error);
    }
  };

  public createSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolsData: Schools = req.body;
      const createSchoolsData: Schools = await this.schoolService.CreateSchool(schoolsData);
      res.status(201).json({ data: createSchoolsData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = Number(req.query.id);
      const deleteSchoolId: TypeSchools = await this.schoolService.deleteSchool(schoolId);
      res.status(200).json({ data: deleteSchoolId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolsData: Schools = req.body;
      const schoolId = Number(req.query.id);
      const updateSchoolsData: Schools = await this.schoolService.updateSchool(schoolId, schoolsData);
      res.status(201).json({ data: updateSchoolsData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getSchoolsByTypeSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeSchoolId = Number(req.query.typeSchoolId);
      const findSchoolByTypeSchool: Schools[] = await this.schoolService.getSchoolsByTypeSchool(typeSchoolId);
      res.status(200).json({ data: findSchoolByTypeSchool });
    } catch (error) {
      next(error);
    }
  };
}
