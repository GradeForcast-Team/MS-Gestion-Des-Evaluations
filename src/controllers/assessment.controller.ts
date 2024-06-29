import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {AssessmentService} from "@services/assessment.service";

export class AssessmentController {

  public assessment = Container.get(AssessmentService);
  
  // Evaluation 0 on fait les ecarts entre auto evaluation et evaluation
  public level0Assessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conceptId, learnerId } =  req.params;
      const level0Assessment = await this.assessment.getConceptEvaluation(parseInt(conceptId), parseInt(learnerId));
      res.status(201).json({data: level0Assessment, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  // controller pour faire l'evaluation d'un concept (la somme des quizz)
  public AssessmentConceptLearner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

      const { learnerId, conceptId } = req.params;

      const scoreAssessmentConcept = await  this.assessment.calculateConceptAssessment(parseInt(learnerId), parseInt(conceptId));
      res.status(200).json({ data: scoreAssessmentConcept})
    } catch (error) {
      next(error)
    }

  }

  // controler pour avoir la note d'evaluation pour une session ( somme et moyenne des concepts)
  public AssessmentConceptLearnerForSession  = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

      const { learnerId, sessionId } = req.params;

      const scoreAssessmentConcept = await  this.assessment.calculateSessionAssessment(parseInt(sessionId), parseInt(learnerId));
      res.status(200).json({ data: scoreAssessmentConcept})
    } catch (error) {
      next(error)
    }

  }

  // Controller pour obtenir les détails d'une évaluation
  public getAssessmentnDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { learnerId, conceptId } = req.params;
      const evaluationDetails = await this.assessment.getEvaluationDetails(parseInt(learnerId), parseInt(conceptId));
      res.status(200).json({ data: evaluationDetails });
    } catch (error) {
      next(error);
    }
  };

}
