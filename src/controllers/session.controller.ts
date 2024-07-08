import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import console from 'console';
import { SessionService } from '@services/session.service';
import { Session } from '@interfaces/session.interface';

export class SessionController {
  public sessionService = Container.get(SessionService);

  public createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
    try {
      const syllabusId = Number(req.query.syllabusId);
      const sessions = req.body;
      const createdSyllabus = await this.sessionService.createSession(syllabusId, sessions);

      res.status(201).json({ data: createdSyllabus, message: 'Session created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllSessionForSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syllabusId = Number(req.query.syllabusId);
      const getAllSyllabusForSyllabus = await this.sessionService.getAllSessionsForSyllabus(syllabusId);
      res.status(200).json({ data: getAllSyllabusForSyllabus });
    } catch (error) {
      next(error);
    }
  };

  public getSessionForSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syllabusId = Number(req.query.syllabusId);
      const sessionId = Number(req.query.sessionId);
      const getSessionForSyllabus = await this.sessionService.getSessionById(syllabusId, sessionId);
      res.status(200).json({ data: getSessionForSyllabus });
    } catch (error) {
      next(error);
    }
  };

  public getSessionBeetweenDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.query.teacherId);
      const sessionDate = req.body;
      const getSessionBeetweenDate = await this.sessionService.getSessionsBetweenDates(teacherId, sessionDate);
      res.status(200).json({ data: getSessionBeetweenDate });
    } catch (error) {
      next(error);
    }
  };

  public updateSessionForSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session: Session = req.body;
      const syllabusId = Number(req.query.syllabusId);
      const sessionId = Number(req.query.sessionId);
      const updateSessionData: Session = await this.sessionService.updateSessionForSyllabus(syllabusId, sessionId, session);

      res.status(201).json({ data: updateSessionData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = Number(req.query.id);
      const deleteSession: Session = await this.sessionService.deleteSession(sessionId);
      res.status(200).json({ data: deleteSession, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
