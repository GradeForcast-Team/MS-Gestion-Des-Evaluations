import {Classe} from '@/interfaces/classe.interface';
import {ClasseService} from '@/services/classe.service';
import {NextFunction, Request, Response} from 'express';
import {Container} from 'typedi';

export class ClasseController {
  public classe = Container.get(ClasseService);

  public getclasse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllclasses: Classe[] = await this.classe.getAllClasse();

      res.status(200).json({ data: findAllclasses });
    } catch (error) {
      next(error);
    }
  };

  public getclasseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classeId = Number(req.params.id);
      const findclasse: Classe = await this.classe.getClasseById(classeId);
      res.status(200).json({ data: findclasse });
    } catch (error) {
      next(error);
    }
  };

  public createclasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classesData: Classe = req.body;
      const createclassesData: Classe = await this.classe.createclasse(classesData.id, classesData);

      res.status(201).json({ data: createclassesData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteclasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classeId = Number(req.params.id);
      const deleteclasseId: Classe = await this.classe.deleteclasse(classeId);

      res.status(200).json({ data: deleteclasseId, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateclasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classesData: Classe = req.body;
      const classeId = Number(req.params.id);
      const updateclassesData: Classe = await this.classe.updateclasse(classeId, classesData);

      res.status(201).json({ data: updateclassesData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}
