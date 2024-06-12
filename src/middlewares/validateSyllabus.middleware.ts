import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import {CreateSyllabusDto} from "@dtos/syllabus.dto";
import {HttpException} from "@exceptions/HttpException";

export const validateSyllabusMiddleware = (type: any, skipMissingProperties = false, whitelist = false, forbidNonWhitelisted = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req.body);
    console.log("le dto",dto);
    validateOrReject(dto, { skipMissingProperties, whitelist, forbidNonWhitelisted })
      .then(() => {
        req.body = dto;
        next();
      })
      .catch((errors: ValidationError[]) => {
        console.log("errors", errors);
        const message = errors.map((error: ValidationError) => {
          return error.constraints ? Object.values(error.constraints) : ''
        }).join(', ');
        next(new HttpException(400, message));
      });
  };
};
