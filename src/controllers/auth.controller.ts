import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { AuthService } from '@services/auth.service';
import { CreateTeacherDto } from '@dtos/users.dto';
import { CreateAddressDto } from '@dtos/address.dto';
import multer from 'multer';
import { logger } from '@utils/logger';
import * as path from 'path';
import * as fs from 'fs';
import { uploadImage } from '@utils/Helper';
import { HttpException } from '@exceptions/HttpException';
import { UpdateTeacherDto } from '@/dtos/teacher.dto';

export class AuthController {
  public auth = Container.get(AuthService);

  public storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const destinationFolder = path.join(__dirname, '../../public/uploads');
      console.log(destinationFolder);

      try {
        await fs.promises.mkdir(destinationFolder, { recursive: true });
        cb(null, destinationFolder);
      } catch (error) {
        logger.error('Erreur lors de la création du dossier de destination :', error);
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + '.jpg');
    },
  });

  public upload = multer({
    storage: this.storage,
    limits: { fileSize: 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
      console.log(allowedMimes);
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const error = new Error('Type de fichier non autorisé.');
        console.error('Erreur lors de la vérification du type de fichier :', error);
        cb(error);
      }
    },
  }).single('photo');

  public registerTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.upload(req, res, async (err: any) => {
        if (err) {
          return next(err);
        }

        // Votre logique de création de l'enseignant ici
        const userData = req.body; // Données de l'utilisateur
        const image = req.file; // Informations sur l'image téléchargée

        // Traitez les données de l'utilisateur et l'image téléchargée ici...
        const SignUpUserData = await this.auth.registerTeacher(userData, image);
        res.status(201).json({ data: SignUpUserData, message: 'signup' });
      });
    } catch (error) {
      next(error);
    }
  };

  public logInTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.body;
      const { findUser, tokenData } = await this.auth.loginTeacher(userData);

      res.status(200).json({ data: { user: findUser, token: tokenData }, message: 'login success' });
    } catch (error) {
      next(error);
    }
  };

  public registergoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
    } catch (error) {}
  };

  // public getTeacherById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const teacherId = Number(req.params.id);
  //     const teacherData = await this.auth.(teacherId);
  //     res.status(200).json({ data: teacherData, message: 'Teacher data retrieved' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public updateTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.params.id);
      const teacherData: UpdateTeacherDto = req.body;
      const updateTeacherData = await this.auth.updateSpecificInfoTeacher(teacherId, teacherData);
      res.status(200).json({ data: updateTeacherData, message: 'Teacher updated' });
    } catch (error) {
      next(error);
    }
  };
}
