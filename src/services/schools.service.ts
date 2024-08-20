import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {Schools} from "@interfaces/schools.interface";
import {CreateSchoolDto, ValidateSchoolDto} from "@dtos/schools.dto";
import PrismaService from './prisma.service';

@Service()
export class SchoolsService {
  private prisma = PrismaService.getInstance();
  public school = this.prisma.schools;

  async getSchoolById(id: number): Promise<Schools> {
    const school = await this.school.findUnique({
      where: {
        id,
      },
      include: {
        typeSchools: true, // Incluez la relation typeSchools
        users: {
          include: { specialisation: true }, // Incluez la relation users avec la propriété 'specialisation'
        },
        classes: true, // Incluez la relation classes
      },
    });

    if (!school) {
      throw new HttpException(404, 'School not found');
    }

    return school;
  }
  public async getAllSchools(): Promise<Schools[]> {
    const schools = await this.school.findMany({
      include: {
        typeSchools: true,
      },
    });

    // Vérifier si aucune école n'est trouvée
    if (!schools) {
      throw new HttpException(404, 'No schools found');
    }

    return schools;
  }
  public async CreateSchool(SchoolData: CreateSchoolDto): Promise<Schools> {
    const existingTypeSchool = await this.school.findFirst({
      where: {
        name: SchoolData.name,
      },
    });

    if (existingTypeSchool) {
      throw new HttpException(409, 'Type school already exists');
    }

    const createdSchool = await this.school.create({
      data: {
        name: SchoolData.name,
        telephone: SchoolData.telephone,
        typeSchools: {
          connect: { id: SchoolData.typeSchoolId },
        },
      },
      include: {
        typeSchools: true,
      },
    });

    return  createdSchool;
  }
  public async updateSchool(id:number, validateSchool:  ValidateSchoolDto): Promise<Schools | null> {
    const existingSchool = await this.getSchoolById(id);

    if (!existingSchool) {
      throw new HttpException(404, 'Type school not found\'');
    }

    return this.school.update({
      where: {
        id: id
      },
      data: {
        name: validateSchool.name,
        telephone: validateSchool.telephone,
        typeSchools: {
          connect: { id: validateSchool.typeSchoolId },
        },
      },
    });

  }

  async deleteSchool(id:  number): Promise<Schools | null> {
    const existingSchool = await this.getSchoolById(id);

    if (!existingSchool) {
      throw new HttpException(404, 'school not found\'');
    }

    return this.school.delete({
      where: {
        id
      },
    });
  }


  async  getSchoolsByTypeSchool(typeSchoolId: number) {
    try {
      const schools = await this.school.findMany({
        where: {
          typeSchoolId: typeSchoolId,
        },
      });
      return schools;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  }

  public async getSchoolsAndLevelsForTeacher(teacherId: number): Promise<any[]> {
    try {
      const teacherSchools = await this.school.findMany({
        where: {
          teacherSchools: {
            some: {
              teacherId: teacherId,
            },
          },
        },
        include: {
          classes: {
            include: {
              niveau: true,
            },
          },
        },
      });

      const formattedSchools = teacherSchools.map(school => {
        const levels = Array.from(new Set(school.classes.map(classe => JSON.stringify(classe.niveau)))).map(level => JSON.parse(level));
        return {
          ...school,
          levels: levels,
        };
      });

      return formattedSchools;
    } catch (error) {
      console.error('Error fetching schools and levels for teacher:', error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }
  
  
  

}
