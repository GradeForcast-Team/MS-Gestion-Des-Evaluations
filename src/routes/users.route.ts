// import { Router } from 'express';
// import { UserController } from '@controllers/users.controller';
// import { CreateUserDto, LoginDoubleFaDto } from '@dtos/users.dto';
// import { Routes } from '@interfaces/routes.interface';
// import { ValidationMiddleware } from '@middlewares/validation.middleware';
// import { TeacherMiddleware } from '@middlewares/teacher.middleware';
// import { CreateAdminDto } from '../dtos/admin.dto';
// import { ProtectedMiddelware } from '../middlewares/protected.middleware';
// import { AuthMiddleware } from '../middlewares/auth.middleware';
//
// export class UserRoute implements Routes {
//   public path = '/users';
//   public router = Router();
//   public user = new UserController();
//
//   constructor() {
//     this.initializeRoutes();
//   }
//
//   private initializeRoutes() {
//     this.router.get(`${this.path}`, TeacherMiddleware, this.user.getUsers);
//     this.router.post(`${this.path}/create-admin`, ProtectedMiddelware, ValidationMiddleware(CreateAdminDto), this.user.createAdmin);
//     this.router.post(
//       `${this.path}/first-double-fa-validate`,
//       AuthMiddleware,
//       ValidationMiddleware(LoginDoubleFaDto),
//       this.user.firstDoubleFaValidate,
//     );
//     this.router.get(`${this.path}/:id(\\d+)`, TeacherMiddleware, this.user.getUserById);
//     this.router.post(`${this.path}`, TeacherMiddleware, ValidationMiddleware(CreateUserDto), this.user.createUser);
//     this.router.put(`${this.path}/:id(\\d+)`, TeacherMiddleware, ValidationMiddleware(CreateUserDto, true), this.user.updateUser);
//     this.router.delete(`${this.path}/:id(\\d+)`, TeacherMiddleware, this.user.deleteUser);
//     this.router.put(`${this.path}/update-profil`, AuthMiddleware, ValidationMiddleware(CreateUserDto, true), this.user.updateProfil);
//   }
// }
