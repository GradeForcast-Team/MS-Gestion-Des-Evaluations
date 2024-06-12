import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {SessionAutoAssessmentService} from "@services/sessionAutoAssessment.service";
import {AutoAssessmentInterface} from "@interfaces/autoAssessment.interface";

export class SessionautoAssessmentController {

  public autoAssessment = Container.get(SessionAutoAssessmentService);
  public createAutoAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const autoAssessment: AutoAssessmentInterface[] = req.body;
      const { sessionId, learnerId } = req.body[0];
      const createAutoAssessmentData = await this.autoAssessment.saveSesssionAutoAssessmentAndGetScore(autoAssessment, sessionId, learnerId);
      res.status(201).json({data: createAutoAssessmentData, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public getAutoEvaluationScoresClasseForTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.params.id);
      const getAutoEvaluationScoresForTeacher = await this.autoAssessment.getSessionAutoAssessmentScoresClasseForTeacher(teacherId);
      res.status(200).json({ data: getAutoEvaluationScoresForTeacher });
    } catch (error) {
      next(error);
    }
  };

  public getAutoEvaluationScoresForLearnersInClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.params.id);
      const getAutoEvaluationScoresForLearnersInClass = await this.autoAssessment.getSesssionAutoAssessmentScoresForLearnersInClass(teacherId);
      res.status(200).json({ data: getAutoEvaluationScoresForLearnersInClass });
    } catch (error) {
      next(error);
    }
  };

}
