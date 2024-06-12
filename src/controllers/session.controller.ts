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
      const syllabusId = Number(req.params.id);
      const sessions = req.body;
      const createdSyllabus = await this.sessionService.createSession(syllabusId, sessions);

      res.status(201).json({ data: createdSyllabus, message: 'Session created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllSessionForSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syllabusId = Number(req.params.id);
      const getAllSyllabusForSyllabus = await this.sessionService.getAllSessionForSyllabus(syllabusId);
      res.status(200).json({ data: getAllSyllabusForSyllabus });
    } catch (error) {
      next(error);
    }
  };

  public getSessionForSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { syllabusId, sessionId } = req.params;
      const getSessionForSyllabus = await this.sessionService.getSessionById(parseInt(syllabusId), parseInt(sessionId));
      res.status(200).json({ data: getSessionForSyllabus });
    } catch (error) {
      next(error);
    }
  };

  public getSessionBeetweenDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = Number(req.params.id);
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
      const { syllabusId, sessionId } = req.params;
      // @ts-ignore
      const updateSessionData: Session = await this.sessionService.updateSessionForSyllabus(parseInt(syllabusId), parseInt(sessionId), session);

      res.status(201).json({ data: updateSessionData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = Number(req.params.id);
      const deleteSession: Session = await this.sessionService.deleteSession(sessionId);

      res.status(200).json({ data: deleteSession, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
