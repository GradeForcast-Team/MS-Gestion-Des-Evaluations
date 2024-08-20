import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { TypeAssessment } from '@/interfaces/typeAssessment.interface';
import { CreateTypeAssessmentDto, ValidateTypeAssessmentDto } from '@/dtos/typeAssessment.dto';
import PrismaService from './prisma.service';

@Service()
export class TypeAssessmentService {
  private prisma = PrismaService.getInstance();
  public typeAssessment = this.prisma.typeAssessment;

  async getTypeAssessmentById(id: number): Promise<TypeAssessment | null> {
    const typeAssessment = await this.typeAssessment.findUnique({
      where: {
        id,
      },
    });

    if (!typeAssessment) {
      throw new HttpException(404, 'Type Assessment not found');
    }

    return typeAssessment;
  }

  public async getAllTypeAssessments(): Promise<TypeAssessment[]> {
    return this.typeAssessment.findMany();
  }

  public async createTypeAssessment(typeAssessmentData: CreateTypeAssessmentDto): Promise<TypeAssessment> {
    return this.typeAssessment.create({
      data: {
        name: typeAssessmentData.name,
      },
    });
  }

  public async updateTypeAssessment(id: number, typeAssessmentData: ValidateTypeAssessmentDto): Promise<TypeAssessment | null> {
    const existingTypeAssessment = await this.getTypeAssessmentById(id);

    if (!existingTypeAssessment) {
      throw new HttpException(404, 'Type Assessment not found');
    }

    return this.typeAssessment.update({
      where: {
        id,
      },
      data: {
        ...typeAssessmentData
      },
    });
  }

  async deleteTypeAssessment(id: number): Promise<TypeAssessment | null> {
    const existingTypeAssessment = await this.getTypeAssessmentById(id);

    if (!existingTypeAssessment) {
      throw new HttpException(404, 'Type Assessment not found');
    }

    return this.typeAssessment.delete({
      where: {
        id,
      },
    });
  }
}
