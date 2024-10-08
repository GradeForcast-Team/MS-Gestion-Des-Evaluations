import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import {HttpException} from "@exceptions/HttpException";

const getAuthorization = req => {
  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

export const ProtectedMiddelware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);

    if (Authorization === process.env.SECRET_PROTECTED_ROAD) {
      next();
    } else {
      next(new HttpException(403, 'Access denied'));
    }
  } catch (error) {
    next(new HttpException(403, 'Access denied'));
  }
};
