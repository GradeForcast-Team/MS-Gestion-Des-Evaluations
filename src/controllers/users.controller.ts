// import { NextFunction, Request, Response } from 'express';
// import { Container } from 'typedi';
// import { User } from '@interfaces/users.interface';
// import { UserService } from '@services/users.service';
//
// export class UserController {
//   public user = Container.get(UserService);
//
//   public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const findAllUsersData: User[] = await this.user.findAllUser();
//
//       res.status(200).json({ data: findAllUsersData, message: 'findAll' });
//     } catch (error) {
//       next(error);
//     }
//   };
//
//   public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userId = Number(req.params.id);
//       const findOneUserData: User = await this.user.findUserById(userId);
//
//       res.status(200).json({ data: findOneUserData, message: 'findOne' });
//     } catch (error) {
//       next(error);
//     }
//   };
//
//   public createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userData: User = req.body;
//       const createUserData: User = await this.user.createAdmin(userData);
//
//       res.status(201).json({ data: createUserData, message: 'created' });
//     } catch (error) {
//       next(error);
//     }
//   };
//
//   public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userData: User = req.body;
//       const createUserData: User = await this.user.createUser(userData);
//
//       res.status(201).json({ data: createUserData, message: 'created' });
//     } catch (error) {
//       next(error);
//     }
//   };
//
//   public setSocketId = (userId: number, socketId: string): void => {
//     this.user.setSocketId(userId, socketId);
//   };
//
//   public firstDoubleFaValidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userData: User = req.body;
//       const createUserData: User = await this.user.firstDoubleFaValidate(userData, req.user);
//
//       res.status(201).json({ data: createUserData, message: 'Activated' });
//     } catch (error) {
//       next(error);
//     }
//   };
//
//   public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userId = Number(req.params.id);
//       const userData: User = req.body;
//       const updateUserData: User = await this.user.updateUser(userId, userData);
//
//       res.status(200).json({ data: updateUserData, message: 'updated' });
//     } catch (error) {
//       next(error);
//     }
//   };
//
//   public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userId = Number(req.params.id);
//       const deleteUserData: User = await this.user.deleteUser(userId);
//
//       res.status(200).json({ data: deleteUserData, message: 'deleted' });
//     } catch (error) {
//       next(error);
//     }
//   };
//
//   public updateProfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userData: User = req.body;
//       const updateUserData: User = await this.user.updateProfil(userData, req.user);
//
//       res.status(200).json({ data: updateUserData, message: 'updated' });
//     } catch (error) {
//       next(error);
//     }
//   };
// }
