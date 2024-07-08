import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { SessionController } from '@/controllers/session.controller';

export class SessionRoute implements Routes {
  public path = '/session';
  public router = Router();
  public sessionController = new SessionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, this.sessionController.createSession);
    this.router.get(`${this.path}/all`, this.sessionController.getAllSessionForSyllabus);
    this.router.get(`${this.path}`, this.sessionController.getSessionForSyllabus);
    this.router.get(`${this.path}/between-dates`, this.sessionController.getSessionBeetweenDate);
    this.router.put(`${this.path}/update`, this.sessionController.updateSessionForSyllabus);
    this.router.delete(`${this.path}/delete`, this.sessionController.deleteSession);
  }
}
