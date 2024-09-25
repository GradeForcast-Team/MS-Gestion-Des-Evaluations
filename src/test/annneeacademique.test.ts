import { AcademicYearService } from '../services/academicYear.service';
import PrismaService from '../services/prisma.service';
import { CreateAcademicYearDto, ValidateAcademicYearDto } from '@/dtos/academicYears.dto';
import { HttpException } from '@exceptions/HttpException';

describe('AcademicYearService', () => {
  let academicYearService: AcademicYearService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      academicYear: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    // Mock de PrismaService pour utiliser prismaMock
    jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);

    academicYearService = new AcademicYearService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAcademicYearById', () => {
    it('devrait retourner une année académique si elle existe', async () => {
      const id = 1;
      const academicYear = {
        id,
        startYear: 2021,
        endYear: 2022,
      };

      prismaMock.academicYear.findUnique.mockResolvedValue(academicYear);

      const result = await academicYearService.getAcademicYearById(id);

      expect(result).toEqual(academicYear);
      expect(prismaMock.academicYear.findUnique).toHaveBeenCalledWith({ where: { id } });
    });

    it("devrait lancer une erreur si l'année académique n'existe pas", async () => {
      const id = 1;

      prismaMock.academicYear.findUnique.mockResolvedValue(null);

      await expect(academicYearService.getAcademicYearById(id)).rejects.toThrow(HttpException);
      await expect(academicYearService.getAcademicYearById(id)).rejects.toThrow('Academic Year not found');
    });
  });

  describe('getAllAcademicYears', () => {
    it('devrait retourner toutes les années académiques', async () => {
      const academicYears = [
        { id: 1, startYear: 2021, endYear: 2022 },
        { id: 2, startYear: 2022, endYear: 2023 },
      ];

      prismaMock.academicYear.findMany.mockResolvedValue(academicYears);

      const result = await academicYearService.getAllAcademicYears();

      expect(result).toEqual(academicYears);
      expect(prismaMock.academicYear.findMany).toHaveBeenCalled();
    });
  });

  describe('createAcademicYear', () => {
    it('devrait créer et retourner une nouvelle année académique', async () => {
      const academicYearData: CreateAcademicYearDto = {
        startYear: 2021,
        endYear: 2022,
      };

      const createdAcademicYear = {
        id: 1,
        ...academicYearData,
      };

      prismaMock.academicYear.create.mockResolvedValue(createdAcademicYear);

      const result = await academicYearService.createAcademicYear(academicYearData);

      expect(result).toEqual(createdAcademicYear);
      expect(prismaMock.academicYear.create).toHaveBeenCalledWith({
        data: {
          startYear: academicYearData.startYear,
          endYear: academicYearData.endYear,
        },
      });
    });
  });

  describe('updateAcademicYear', () => {
    it("devrait mettre à jour et retourner l'année académique", async () => {
      const id = 1;
      const academicYearData: ValidateAcademicYearDto = {
        startYear: 2022,
        endYear: 2023,
      };

      const existingAcademicYear = {
        id,
        startYear: 2021,
        endYear: 2022,
      };

      jest.spyOn(academicYearService, 'getAcademicYearById').mockResolvedValue(existingAcademicYear);

      prismaMock.academicYear.update.mockResolvedValue({
        id,
        ...academicYearData,
      });

      const result = await academicYearService.updateAcademicYear(id, academicYearData);

      expect(result).toEqual({ id, ...academicYearData });
      expect(prismaMock.academicYear.update).toHaveBeenCalledWith({
        where: { id },
        data: { ...academicYearData },
      });
    });

    it("devrait lancer une erreur si l'année académique n'existe pas", async () => {
      const id = 1;
      const academicYearData: ValidateAcademicYearDto = {
        startYear: 2022,
        endYear: 2023,
      };

      jest.spyOn(academicYearService, 'getAcademicYearById').mockRejectedValue(new HttpException(404, 'Academic Year not found'));

      await expect(academicYearService.updateAcademicYear(id, academicYearData)).rejects.toThrow(HttpException);
      await expect(academicYearService.updateAcademicYear(id, academicYearData)).rejects.toThrow('Academic Year not found');
    });
  });

  describe('deleteAcademicYear', () => {
    it("devrait supprimer et retourner l'année académique", async () => {
      const id = 1;
      const existingAcademicYear = {
        id,
        startYear: 2021,
        endYear: 2022,
      };

      jest.spyOn(academicYearService, 'getAcademicYearById').mockResolvedValue(existingAcademicYear);

      prismaMock.academicYear.delete.mockResolvedValue(existingAcademicYear);

      const result = await academicYearService.deleteAcademicYear(id);

      expect(result).toEqual(existingAcademicYear);
      expect(prismaMock.academicYear.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it("devrait lancer une erreur si l'année académique n'existe pas", async () => {
      const id = 1;

      jest.spyOn(academicYearService, 'getAcademicYearById').mockRejectedValue(new HttpException(404, 'Academic Year not found'));

      await expect(academicYearService.deleteAcademicYear(id)).rejects.toThrow(HttpException);
      await expect(academicYearService.deleteAcademicYear(id)).rejects.toThrow('Academic Year not found');
    });
  });
});
