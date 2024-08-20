import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { AcademicYear } from '@/interfaces/academicYear.interface';
import { CreateAcademicYearDto, ValidateAcademicYearDto } from '@/dtos/academicYears.dto';
import PrismaService from './prisma.service';

@Service()
export class AcademicYearService {
  
  private prisma = PrismaService.getInstance();

  async getAcademicYearById(id: number) : Promise<AcademicYear | null> {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: {
        id,
      },
    });

    if (!academicYear) {
      throw new HttpException(404, 'Academic Year not found');
    }

    return academicYear;
  }

  public async getAllAcademicYears(): Promise<AcademicYear[]> {
    return this.prisma.academicYear.findMany();
  }

  public async createAcademicYear(academicYearData: CreateAcademicYearDto): Promise<AcademicYear> {
    return this.prisma.academicYear.create({
      data: {
        startYear: academicYearData.startYear,
        endYear: academicYearData.endYear,
      },
    });
  }

  public async updateAcademicYear(id: number, academicYearData: ValidateAcademicYearDto): Promise<AcademicYear | null> {
    const existingAcademicYear = await this.getAcademicYearById(id);

    if (!existingAcademicYear) {
      throw new HttpException(404, 'Academic Year not found');
    }

    return this.prisma.academicYear.update({
      where: {
        id,
      },
      data: {
        ...academicYearData
      },
    });
  }

  async deleteAcademicYear(id: number): Promise<AcademicYear | null> {
    const existingAcademicYear = await this.getAcademicYearById(id);

    if (!existingAcademicYear) {
      throw new HttpException(404, 'Academic Year not found');
    }

    return this.prisma.academicYear.delete({
      where: {
        id,
      },
    });
  }
}
