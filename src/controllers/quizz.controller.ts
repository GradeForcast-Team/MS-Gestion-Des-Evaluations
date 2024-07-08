import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import console from 'console';
import { QuizzService } from '@services/quizz.service';
import { Quiz } from '@interfaces/quizz.interface';

export class QuizzController {
  public quizzService = Container.get(QuizzService);

  public createQuizz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
    try {
      const conceptId = Number(req.query.conceptId);
      const quizz = req.body;
      const createdQuizz = await this.quizzService.createQuiz(conceptId, quizz);

      res.status(201).json({ data: createdQuizz, message: 'Quizz created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllQuizzForConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.query.conceptId);
      const getAllQuizzForSession = await this.quizzService.getAllQuizzForConcept(conceptId);
      res.status(200).json({ data: getAllQuizzForSession });
    } catch (error) {
      next(error);
    }
  };

  public updateQuizzForConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizz: Quiz = req.body;
      const conceptId = Number(req.query.conceptId);
      const quizzId = Number(req.query.quizzId);

      const updateQuizzForSession: Quiz = await this.quizzService.updateQuizzForConcept(conceptId, quizzId, quizz);

      res.status(201).json({ data: updateQuizzForSession, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public calculerNoteLearner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const learnerId = Number(req.query.learnerId);
      const quizzId = Number(req.query.quizzId);

      const scoreQuizz = await this.quizzService.calculateLearnerScore(learnerId, quizzId);
      res.status(200).json({ data: scoreQuizz });
    } catch (error) {
      next(error);
    }
  };

  public deleteQuizz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzId = Number(req.query.id);
      const deleteQuizz: Quiz = await this.quizzService.deleteQuizz(quizzId);

      res.status(200).json({ data: deleteQuizz, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
