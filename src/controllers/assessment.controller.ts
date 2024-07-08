import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { AssessmentService } from '@services/assessment.service';

export class AssessmentController {
  public assessment = Container.get(AssessmentService);

  // Evaluation 0 on fait les ecarts entre auto evaluation et evaluation
  public level0Assessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conceptId = Number(req.query.conceptId);
      const learnerId = Number(req.query.learnerId);
      const level0Assessment = await this.assessment.getConceptEvaluation(conceptId, learnerId);
      res.status(201).json({ data: level0Assessment, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  // Controller pour faire l'evaluation d'un concept (la somme des quizz)
  public AssessmentConceptLearner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const learnerId = Number(req.query.learnerId);
      const conceptId = Number(req.query.conceptId);
      const scoreAssessmentConcept = await this.assessment.calculateConceptAssessment(learnerId, conceptId);
      res.status(200).json({ data: scoreAssessmentConcept });
    } catch (error) {
      next(error);
    }
  };

  // Controller pour avoir la note d'evaluation pour une session (somme et moyenne des concepts)
  public AssessmentConceptLearnerForSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const learnerId = Number(req.query.learnerId);
      const sessionId = Number(req.query.sessionId);
      const scoreAssessmentConcept = await this.assessment.calculateSessionAssessment(sessionId, learnerId);
      res.status(200).json({ data: scoreAssessmentConcept });
    } catch (error) {
      next(error);
    }
  };

  // Controller pour obtenir les détails d'une évaluation
  public getAssessmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const learnerId = Number(req.query.learnerId);
      const conceptId = Number(req.query.conceptId);
      const evaluationDetails = await this.assessment.getEvaluationDetails(learnerId, conceptId);
      res.status(200).json({ data: evaluationDetails });
    } catch (error) {
      next(error);
    }
  };
}
