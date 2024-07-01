import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { AcademicYear } from '@/interfaces/academicYear.interface';
import { CreateAcademicYearDto, ValidateAcademicYearDto } from '@/dtos/academicYears.dto';

@Service()
export class AcademicYearService {
  public academicYear = new PrismaClient().academicYear;

  async getAcademicYearById(id: number) : Promise<AcademicYear | null> {
    const academicYear = await this.academicYear.findUnique({
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
    return this.academicYear.findMany();
  }

  public async createAcademicYear(academicYearData: CreateAcademicYearDto): Promise<AcademicYear> {
    return this.academicYear.create({
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

    return this.academicYear.update({
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

    return this.academicYear.delete({
      where: {
        id,
      },
    });
  }
}
