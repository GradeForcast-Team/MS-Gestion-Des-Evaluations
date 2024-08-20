import { Classe } from '@/interfaces/classe.interface';
import { ClasseService } from '@/services/classe.service';
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Server as SocketServer } from 'socket.io';
import { HttpException } from '@/exceptions/HttpException';

export class ClasseController {
  private classeService: ClasseService;

  constructor(io: SocketServer) {
    this.classeService = new ClasseService(io);
  }

  public getclasse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllclasses = await this.classeService.getAllClasse();
      res.status(200).json({ data: findAllclasses });
    } catch (error) {
      next(error);
    }
  };

  public getclasseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classeId = Number(req.query.id);
      const findclasse: Classe = await this.classeService.getClasseById(classeId);
      res.status(200).json({ data: findclasse });
    } catch (error) {
      next(error);
    }
  };

  public getclasseByTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.query.teacherId);
      const findclasseByTeacher = await this.classeService.getClassesByTeacher(teacherId);
      res.status(200).json({ data: findclasseByTeacher });
    } catch (error) {
      next(error);
    }
  };

  public getLearnersByClasseId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const findlearnerByClasseId = await this.classeService.getLearnersByClasseId(parseInt(id));
      res.status(200).json({ data: findlearnerByClasseId });
    } catch (error) {
      next(error);
    }
  };

  public getSyllabiByTeacherAndClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.query.teacherId);
      const classeId = Number(req.query.classeId);
      const getSyllabiByTeacherAndClass = await this.classeService.getSyllabiByTeacherAndClass(teacherId,classeId);
      res.status(200).json({ data: getSyllabiByTeacherAndClass });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Unexpected error in controller:", error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  };

  public createclasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classesData: Classe = req.body;
      const createclassesData = await this.classeService.createclasse(classesData);
      res.status(201).json({ data: createclassesData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public createClasseWithTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.query.teacherId);
      const classesData: Classe = req.body;
      const createClasseWithTeacher = await this.classeService.createClasseWithTeacher(classesData,teacherId);
      res.status(201).json({ data: createClasseWithTeacher, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteclasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classeId = Number(req.query.id);
      const deleteclasseId = await this.classeService.deleteClasse(classeId);
      res.status(200).json({ data: deleteclasseId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateclasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classesData: Classe = req.body;
      const classeId = Number(req.query.id);
      const updateclassesData = await this.classeService.updateClasse(classeId, classesData);
      res.status(201).json({ data: updateclassesData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}
