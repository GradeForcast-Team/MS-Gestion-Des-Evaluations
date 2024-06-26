import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { CreateStatusDto } from '@/dtos/status.dto';
import {SyllabusController} from "@controllers/syllabus.controller";
import {CreateSyllabusDto} from "@dtos/syllabus.dto";
import {validateSyllabusMiddleware} from "@middlewares/validateSyllabus.middleware";

export class SyllabusRoute implements Routes {
  public path = '/syllabus';
  public router = Router();
  public syllabus = new SyllabusController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create/:id(\\d+)`, this.syllabus.createSyllabus);
    this.router.get(`${this.path}/generatepdf/:syllabusId(\\d+)/teacher/:teacherId(\\d+)`, this.syllabus.generatePdf);
    this.router.get(`${this.path}/getAllSyllabusForTeacher/:id(\\d+)`, this.syllabus.getAllSyllabusForTeacher);
    // this.router.get(`${this.path}/getSyllabusForTeacher/:syllabusId(\\d+)/teacher/:teacherId(\\d+)`, this.syllabus.getSyllabusForTeacher);
    this.router.put(`${this.path}/updateSyllabus/:syllabusId(\\d+)/teacher/:teacherId(\\d+)`, this.syllabus.updateSyllabus);
    // this.router.delete(`${this.path}/deleteSyllabus/:syllabusId(\\d+)/teacher/:teacherId(\\d+)`, this.syllabus.deleteSyllabus);

  }
}
