import { Container, Service } from 'typedi';
import { SyllabusService } from '@services/syllabus.service';
import { NextFunction, Request, Response } from 'express';
import * as console from 'console';
import { Syllabus } from '@interfaces/syllabus.interface';
import path from "path";

export class SyllabusController {
  public syllabusService = Container.get(SyllabusService);

  public generatePdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { syllabusId, teacherId } = req.params;
      const filePath = await this.syllabusService.generateSyllabusPDF(parseInt(syllabusId), parseInt(teacherId));
      res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  };
  public createSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
    try {
      const professorId = Number(req.params.id);
      const syllabus = req.body;
      console.log('syllabus', syllabus);
      const createdSyllabus = await this.syllabusService.createOptimalSyllabus(professorId, syllabus);

      res.status(201).json({ data: createdSyllabus, message: 'Syllabus created' });
    } catch (error) {
      next(error);
    }
  };
  public getAllSyllabusForTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professorId = Number(req.params.id);
      const getAllSyllabusForTeacher = await this.syllabusService.geAllSyllabusForTeacher(professorId);
      res.status(200).json({ data: getAllSyllabusForTeacher });
    } catch (error) {
      next(error);
    }
  };


  // public getSyllabusByLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const link = req.params.link;
  //     const syllabus = await this.syllabusService.getSyllabusByLink(link);
  //     res.status(200).json(syllabus);
  //   } catch (error) {
  //     next(error);
  //   }
  // };


  // public getSyllabusForTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { syllabusId, teacherId } = req.params;
  //     const getSyllabusForTeacher = await this.syllabusService.getSyllabusForTeacher(parseInt(syllabusId), parseInt(teacherId));
  //     res.status(200).json({ data: getSyllabusForTeacher });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public updateSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syllabus: Syllabus = req.body;
      const { syllabusId, teacherId } = req.params;
      // @ts-ignore
      // const updateSyllabusData: Syllabus = await this.syllabusService.updateSyllabusGeneral(parseInt(syllabusId), parseInt(teacherId), syllabus);
      const updateSyllabusData: Syllabus = await this.syllabusService.updateSyllabus(parseInt(syllabusId), parseInt(teacherId), syllabus);
      res.status(201).json({ data: updateSyllabusData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  // public deleteSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { syllabusId, teacherId } = req.params;
  //     const deleteSyllabus: Syllabus = await this.syllabusService.deleteSyllabus(parseInt(syllabusId), parseInt(teacherId));

  //     res.status(200).json({ data: deleteSyllabus, message: 'deleted' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
