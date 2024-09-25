import { SyllabusService } from '../services/syllabus.service';
import PrismaService from '../services/prisma.service';
import { HttpException } from '@exceptions/HttpException';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { CreateSyllabusDto } from '@/dtos/syllabus.dto';
jest.mock('fs');
jest.mock('path');
jest.mock('../services/prisma.service');

// Mock de l'instance PDFDocument
jest.mock('pdfkit', () => {
    return jest.fn().mockImplementation(() => ({
      pipe: jest.fn(),
      text: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      image: jest.fn().mockReturnThis(),
      end: jest.fn(),
      moveTo: jest.fn().mockReturnThis(), // Ajout du mock de moveTo
      lineTo: jest.fn().mockReturnThis(), // Ajout du mock de lineTo
      stroke: jest.fn().mockReturnThis(), // Ajout du mock de stroke
    }));
  });
  
  describe('SyllabusService', () => {
    let syllabusService: SyllabusService;
    let prismaMock: any;
  
    beforeEach(() => {
      prismaMock = {
        syllabus: {
          findFirst: jest.fn(),
        },
        teacher: {
          findUnique: jest.fn(),
        },
      };
  
      jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);
      syllabusService = new SyllabusService();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // describe('generateSyllabusPDF', () => {
    //     it('should generate a PDF for a valid syllabus', async () => {
    //       const syllabusId = 1;
    //       const teacherId = 1;
    //       const syllabus = {
    //         id: syllabusId,
    //         name: 'Test Syllabus',
    //         nbhr: 20,
    //         courseDescription: 'Course Description',
    //         session: [],
    //         pedagogicalMethod: { name: 'Method' },
    //         educationalSupport: { name: 'Support' },
    //         evaluationMode: { name: 'Evaluation' },
    //       };
      
    //       const teacher = {
    //         id: teacherId,
    //         user: { name: 'John', surname: 'Doe' },
    //       };
      
    //       prismaMock.syllabus.findFirst.mockResolvedValue(syllabus);
    //       prismaMock.teacher.findUnique.mockResolvedValue(teacher);
      
    //       const writeStreamMock = {
    //         on: jest.fn().mockImplementation((event, callback) => {
    //           if (event === 'finish') {
    //             callback();  // Simule la fin de l'écriture du fichier PDF
    //           }
    //         }),
    //       };
      
    //       (fs.createWriteStream as jest.Mock).mockReturnValue(writeStreamMock);
      
    //       // Attendre que le PDF soit généré et vérifier que le chemin est correct
    //       const filePath = await syllabusService.generateSyllabusPDF(syllabusId, teacherId);
      
    //       // Vérifiez que le filePath contient bien le chemin attendu
    //       expect(filePath).toContain('Test Syllabus1.pdf');
    //       expect(fs.createWriteStream).toHaveBeenCalled();
    //       expect(prismaMock.syllabus.findFirst).toHaveBeenCalledWith({
    //         where: { id: syllabusId, teacherId },
    //         include: expect.any(Object),
    //       });
    //     });
    //   });
      
      describe('SyllabusService - createOptimalSyllabus', () => {
        let syllabusService: SyllabusService;
        let prismaMock: any;
      
        beforeEach(() => {
          prismaMock = {
            academicYear: {
              findUnique: jest.fn(),
            },
            pedagogicalMethod: {
              findUnique: jest.fn(),
            },
            supportsPedagogiques: {
              findUnique: jest.fn(),
            },
            evaluationMode: {
              findUnique: jest.fn(),
            },
            periode: {
              findUnique: jest.fn(),
            },
            syllabus: {
              create: jest.fn(),
            },
          };
      
          jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);
          syllabusService = new SyllabusService();
        });
      
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        it('should create a syllabus successfully with valid data', async () => {
          const syllabusData: any = {
            name: 'Test Syllabus',
            nbhr: 40,
            creditCoef: 4,
            courseDescription: 'Description',
            generalObjective: 'General Objective',
            specificObjective: 'Specific Objective',
            academicYearId: 1,
            periodId: 1,
            sessions: [
              {
                name: 'Session 1',
                startDate: new Date(),
                endDate: new Date(),
                concepts: [],
              },
              {
                name: 'Session 2',
                startDate: new Date(),
                endDate: new Date(),
                concepts: [],
              },
            ],
          };
      
          prismaMock.academicYear.findUnique.mockResolvedValue({ id: 1 });
          prismaMock.periode.findUnique.mockResolvedValue({ id: 1 });
          prismaMock.syllabus.create.mockResolvedValue({ id: 1, ...syllabusData });
      
          const result = await syllabusService.createOptimalSyllabus(1, syllabusData);
      
          expect(result).toEqual({ id: 1, ...syllabusData });
          expect(prismaMock.academicYear.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
          expect(prismaMock.periode.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
          expect(prismaMock.syllabus.create).toHaveBeenCalledWith({
            data: expect.any(Object),
            include: expect.any(Object),
          });
        });
      
      
        it('should throw an error if the academic year does not exist', async () => {
          const syllabusData: any = {
            name: 'Test Syllabus',
            nbhr: 40,
            creditCoef: 4,
            courseDescription: 'Description',
            generalObjective: 'General Objective',
            specificObjective: 'Specific Objective',
            academicYearId: 1,
            periodId: 1,
            sessions: [
              {
                name: 'Session 1',
                startDate: new Date(),
                endDate: new Date(),
                concepts: [],
              },
            ],
          };
      
          prismaMock.academicYear.findUnique.mockResolvedValue(null); // Academic year does not exist
      
          await expect(syllabusService.createOptimalSyllabus(1, syllabusData)).rejects.toThrow(
            "L'année académique spécifiée n'existe pas."
          );
        });
      
        it('should throw an error if pedagogical method does not exist', async () => {
            const syllabusData: any = {
              name: 'Test Syllabus',
              nbhr: 40,
              creditCoef: 4,
              courseDescription: 'Description',
              generalObjective: 'General Objective',
              specificObjective: 'Specific Objective',
              academicYearId: 1,
              periodId: 1,
              methodeId: 2, // Pedagogical method specified
              sessions: [
                {
                  name: 'Session 1',
                  startDate: new Date(),
                  endDate: new Date(),
                  concepts: [],
                },
              ],
            };
          
            // Simuler que l'année académique et la période existent dans la base de données
            prismaMock.academicYear.findUnique.mockResolvedValue({ id: 1 });
            prismaMock.periode.findUnique.mockResolvedValue({ id: 1 });
            // Simuler que la méthode pédagogique n'existe pas
            prismaMock.pedagogicalMethod.findUnique.mockResolvedValue(null);
          
            // Vérification de l'erreur
            await expect(syllabusService.createOptimalSyllabus(1, syllabusData)).rejects.toThrow(
              'La méthode pédagogique spécifiée n\'existe pas.'
            );
          });
          
      });
  });