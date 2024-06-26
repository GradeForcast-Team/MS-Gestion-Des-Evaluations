import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {AssessmentService} from "@services/assessment.service";

export class AssessmentController {

  public assessment = Container.get(AssessmentService);
  public level0Assessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conceptId, learnerId } =  req.params;
      const level0Assessment = await this.assessment.getConceptEvaluation(parseInt(conceptId), parseInt(learnerId));
      res.status(201).json({data: level0Assessment, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

}
