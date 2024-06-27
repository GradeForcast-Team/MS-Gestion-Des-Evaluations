import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {SessionAutoAssessmentService} from "@services/sessionAutoAssessment.service";
import {AutoAssessmentInterface} from "@interfaces/autoAssessment.interface";
import {ConceptAutoAssessmentService} from "@services/conceptAutoAssessment.service";

export class ConceptAutoAssessmentController {

  public conceptAutoAssessment = Container.get(ConceptAutoAssessmentService);
  public createConceptAutoAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conceptId, learnerId } = req.params;
      const { criteriaId } = req.body;
      const createAutoAssessmentData = await this.conceptAutoAssessment.saveConceptAutoAssessment(parseInt(conceptId), parseInt(learnerId), criteriaId);
      res.status(201).json({data: createAutoAssessmentData, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

}
