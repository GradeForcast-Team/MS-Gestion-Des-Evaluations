import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { StatusController } from '@/controllers/status.controller';
import { StatistiqueController } from '@/controllers/statistique.controller';

export class StatitiqueRoute implements Routes {
  public path = '/statistique';
  public router = Router();
  public statistiqueController = new StatistiqueController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/calculateEvaluationAndAutoEvaluation/:learnerId/syllabus/:syllabusId`, this.statistiqueController.calculateEvaluationAndAutoEvaluation);
    this.router.get(`${this.path}/trackLearnerProgress/:learnerId/syllabus/:syllabusId`, this.statistiqueController.trackLearnerProgress);
  }
}
