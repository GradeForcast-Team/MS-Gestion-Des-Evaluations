import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { LearnerAnswerController } from '@/controllers/learnerAnswer.controller';

export class LearnerAnswerRoute implements Routes {
  public path = '/learnerAnswer';
  public router = Router();
  public learnerAnswerController = new LearnerAnswerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      this.learnerAnswerController.createLearnerAnswer
    );
    this.router.get(
      `${this.path}/getLearnerPerformance/:learnerId/syllabus/:syllabusId`,
      this.learnerAnswerController.getLearnerPerformance
    );
  }
  
}
