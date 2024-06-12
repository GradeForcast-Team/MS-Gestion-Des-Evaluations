import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {TypeSchoolsService} from "@services/TypeSchools.service";
import {TypeSchools} from "@interfaces/types_schools.interface";

export class TypesSchoolController {
  public typeschool = Container.get(TypeSchoolsService);

  public getTypeSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("le get")
      const findAllTypeSchools: TypeSchools[] = await this.typeschool.getAllTypeSchools();

      res.status(200).json({ data: findAllTypeSchools});
    } catch (error) {
      next(error);
    }
  };

  public createTypeSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeSchoolsData: TypeSchools = req.body;
      const createtypeSchoolsData: TypeSchools = await this.typeschool.createTypeSchool(typeSchoolsData);

      res.status(201).json({ data: createtypeSchoolsData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };


  public deleteTypeSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeSchoolId = Number(req.params.id);
      const deleteTypeSchoolId: TypeSchools = await this.typeschool.deleteTypeSchool(typeSchoolId);

      res.status(200).json({ data: deleteTypeSchoolId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateTypeSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeSchoolId = Number(req.params.id);
      const typeSchoolsData: TypeSchools = req.body;
      const updatetypeSchoolsData: TypeSchools = await this.typeschool.updateTypeSchool(typeSchoolId, typeSchoolsData.name);

      res.status(200).json({ data: updatetypeSchoolsData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };



}
