import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {validateSyllabusMiddleware} from "@middlewares/validateSyllabus.middleware";
import {SessionController} from "@controllers/session.controller";
import {CreateSessionDto} from "@dtos/session.dto";

export class SessionRoute implements Routes {
  public path = '/session';
  public router = Router();
  public session = new SessionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create/:id(\\d+)`,this.session.createSession);
    this.router.get(`${this.path}/getAllSessionForSyllabus/:id(\\d+)`, this.session.getAllSessionForSyllabus);
    this.router.post(`${this.path}/getSessionBeetweenDate/teacher/:id(\\d+)`, this.session.getSessionBeetweenDate);
    this.router.get(`${this.path}/getSessionForSyllabus/:sessionId(\\d+)/syllabus/:syllabusId(\\d+)`, this.session.getSessionForSyllabus);
    this.router.put(`${this.path}/updateSessionForSyllabus/:sessionId(\\d+)/syllabus/:syllabusId(\\d+)`, validateSyllabusMiddleware(CreateSessionDto), this.session.updateSessionForSyllabus);
    this.router.delete(`${this.path}/deleteSession/:id(\\d+)`, this.session.deleteSession);
  }
}
