import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {TypeSchoolsService} from "@services/TypeSchools.service";
import {TypeSchools} from "@interfaces/types_schools.interface";
import {SchoolsService} from "@services/schools.service";
import {Schools} from "@interfaces/schools.interface";

export class SchoolController {
  public school = Container.get(SchoolsService);

  public getSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllSchools: Schools[] = await this.school.getAllSchools();

      res.status(200).json({ data: findAllSchools});
    } catch (error) {
      next(error);
    }
  };

  public getSchoolById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = Number(req.params.id);
      const findSchool: Schools= await this.school.getSchoolById(schoolId);
      res.status(200).json({ data:findSchool });
    } catch (error) {
      next(error);
    }
  };

  public createSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const SchoolsData: Schools = req.body;
      const createSchoolsData: Schools = await this.school.CreateSchool(SchoolsData);

      res.status(201).json({ data: createSchoolsData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };


  public deleteSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = Number(req.params.id);
      const deleteTypeSchoolId: TypeSchools = await this.school.deleteSchool(schoolId);

      res.status(200).json({ data: deleteTypeSchoolId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolsData: Schools = req.body;
      const schoolId = Number(req.params.id);
      const updateSchoolsData: Schools = await this.school.updateSchool(schoolId, schoolsData);

      res.status(201).json({ data: updateSchoolsData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getSchoolsByTypeSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolsData: Schools = req.body;
      const findSchoolByTypeSchool: Schools = await this.school.getSchoolById(schoolsData.typeSchoolId);

      res.status(200).json({ data: findSchoolByTypeSchool});
    } catch (error) {
      next(error);
    }
  };


}
