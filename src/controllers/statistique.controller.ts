import { StatistiqueService } from "@/services/statistique.service";
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';

export class StatistiqueController {
    public statistiqueService = Container.get(StatistiqueService);
  
    public calculateEvaluationAndAutoEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const syllabusId = Number(req.params.syllabusId)
        const learnerId = Number(req.params.learnerId)
        const calculateEvaluationAndAutoEvaluationGap = await this.statistiqueService.calculateEvaluationAndAutoEvaluationGap(learnerId,syllabusId);
        res.status(200).json({ data: calculateEvaluationAndAutoEvaluationGap });
      } catch (error) {
        next(error);
      }
    };
}  