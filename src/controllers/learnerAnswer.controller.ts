import { Classe } from '@/interfaces/classe.interface';
import { ClasseService } from '@/services/classe.service';
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {LearnerAnswerService} from "@services/learnerAnswer.service";
import {LearnerAnswer} from "@interfaces/learnerAnswer.interface";

export class LearnerAnswerController {
  public learnerAnswer = Container.get(LearnerAnswerService);

  public createlearnerAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const learnerAnswerData: LearnerAnswer = req.body;
      const createlearnerAnswerData: LearnerAnswer[] = await this.learnerAnswer.createLearnerResponse(learnerAnswerData);

      res.status(201).json({ data: createlearnerAnswerData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };



}
