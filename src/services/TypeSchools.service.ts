import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { TypeSchools } from '@interfaces/types_schools.interface';
import { CreateTypeSchoolDto } from '@dtos/typeschools.dto';
import { HttpException } from '@exceptions/HttpException';
import PrismaService from './prisma.service';

@Service()
export class TypeSchoolsService {
  private prisma = PrismaService.getInstance();
  public typeschool = this.prisma.typeSchools;

  async getTypeSchoolById(id: number): Promise<TypeSchools | null> {
    const typeSchool = await this.typeschool.findUnique({
      where: {
        id,
      },
    });

    if (!typeSchool) {
      throw new HttpException(404, 'Type school not found');
    }

    return typeSchool;
  }
  public async getAllTypeSchools(): Promise<TypeSchools[]> {
    console.log(this.typeschool.findMany());
    return this.typeschool.findMany();
  }
  public async createTypeSchool(typeSchoolData: CreateTypeSchoolDto): Promise<TypeSchools> {
    const existingTypeSchool = await this.typeschool.findFirst({
      where: {
        name: typeSchoolData.name,
      },
    });

    if (existingTypeSchool) {
      throw new HttpException(409, 'Type school already exists');
    }

    return this.typeschool.create({
      data: {
        name: typeSchoolData.name,
      },
    });
  }
  public async updateTypeSchool(id: number, name: string): Promise<TypeSchools | null> {
    const existingTypeSchool = await this.getTypeSchoolById(id);

    if (!existingTypeSchool) {
      throw new HttpException(404, "Type school not found'");
    }

    return this.typeschool.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  async deleteTypeSchool(id: number): Promise<TypeSchools | null> {
    const existingTypeSchool = await this.getTypeSchoolById(id);

    if (!existingTypeSchool) {
      throw new HttpException(404, "Type school not found'");
    }

    return this.typeschool.delete({
      where: {
        id,
      },
    });
  }
}
