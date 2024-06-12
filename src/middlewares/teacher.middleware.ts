import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { HttpException } from "@exceptions/HttpException";
import {logger} from "@utils/logger";

const SECRET_KEY = 'c56288e7b9b2dae9f3f9b02904ee0f8a057ab03cc48d647d1cc38933116f8a8b'; // Remplacez 'your_secret_key' par votre clé secrète JWT

const getAuthorization = (req: RequestWithUser) => {

  const header = req.headers.authorization;
  console.log(header)
  // if (header) return header.split('Bearer ')[1];
  // return null;
  if (header) {
    // Vérifie si la valeur de l'en-tête commence par 'Bearer '
    if (header.startsWith('Bearer ')) {
      // Extrait et retourne le token JWT en enlevant 'Bearer ' du début de la valeur
      return header.slice(7);
    }
  }
};

export const TeacherMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);

    if (Authorization) {
      const { id } = (await verify(Authorization, SECRET_KEY)) as DataStoredInToken;
      const users = new PrismaClient().user;
      const findUser = await users.findUnique({ where: { id: Number(id) } });

      if (findUser.roleId == 1) {
        req.user = findUser;
        next();
      } else {
        req.user = null;
        next();
      }
    } else {
      throw new HttpException(404, 'Authentication token missing');
    }
  } catch (error) {
    next(new HttpException(error.status || 500, error.message || 'Internal server error'));
  }
};
