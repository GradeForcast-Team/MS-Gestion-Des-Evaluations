import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { LearnerAnswerService } from '@services/learnerAnswer.service';
import { LearnerAnswer } from '@interfaces/learnerAnswer.interface';

export class LearnerAnswerController {
  public learnerAnswer = Container.get(LearnerAnswerService);

  public createLearnerAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzId = Number(req.query.quizzId);
      const learnerId = Number(req.query.learnerId);
      const learnerAnswerData: LearnerAnswer[] = req.body;
      const createLearnerAnswerData: LearnerAnswer[] = await this.learnerAnswer.createLearnerResponse(quizzId, learnerId, learnerAnswerData);

      res.status(201).json({ data: createLearnerAnswerData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}
