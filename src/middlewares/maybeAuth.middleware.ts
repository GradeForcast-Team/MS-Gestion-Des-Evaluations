// import { PrismaClient } from '@prisma/client';
// import { NextFunction, Response } from 'express';
// import { verify } from 'jsonwebtoken';
// import { SECRET_KEY } from '@config';
// import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
//
// const getAuthorization = req => {
//   const coockie = req.cookies['Authorization'];
//   if (coockie) return coockie;
//
//   const header = req.header('Authorization');
//   if (header) return header.split('Bearer ')[1];
//
//   return null;
// };
//
// export const MaybeAuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//   try {
//     const Authorization = getAuthorization(req);
//
//     if (Authorization) {
//       const { id } = (await verify(Authorization, SECRET_KEY)) as DataStoredInToken;
//       const users = new PrismaClient().user;
//       const findUser = await users.findUnique({ where: { id: Number(id) } });
//
//       if (findUser) {
//         req.user = findUser;
//         next();
//       } else {
//         req.user = null;
//         next();
//       }
//     } else {
//       req.user = null;
//       next();
//     }
//   } catch (error) {
//     req.user = null;
//     next();
//   }
// };
