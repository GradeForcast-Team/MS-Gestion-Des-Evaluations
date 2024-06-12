import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {Classe} from "@interfaces/classe.interface";
import {CreateClasseDto, ValidateClasseDto} from "@dtos/classe.dto";

@Service()
export class ClasseService {
  public classe = new PrismaClient().classe;

  async getClasseById(id: number): Promise<Classe | null> {
    const Classe = await this.classe.findUnique({
      where: {
        id,
      },
    });

    if (!Classe) {
      throw new HttpException(404, 'Classe not found');
    }

    // @ts-ignore
    return Classe;
  }
  public async getAllClasse(): Promise<Classe[]> {
    console.log( this.classe.findMany())
    // @ts-ignore
    return this.classe.findMany();
  }
  public async createclasse(id: number, classeData: CreateClasseDto): Promise<Classe> {
    const existingClasse = await this.classe.findFirst({
      where: {
        name: classeData.name,
        ecoleId: classeData.ecoleId,
      },
    });

    if (existingClasse) {
      throw new HttpException(409, 'Classe already exists');
    }

    const connectTeachers = classeData.teachers?.map(teacherId => ({ id: teacherId }));
    const connectLearners = classeData.learners?.map(learnerId => ({ id: learnerId }));

    // @ts-ignore
    return this.classe.create({
      data: {
        name: classeData.name,
        ecoleId: classeData.ecoleId,
        learners: {
          connect: connectLearners || [],
        },
      },
    });
  }


  public async updateclasse(id: number,classeData: ValidateClasseDto): Promise<Classe | null> {
    const existingclasse = await this.getClasseById(id);

    if (!existingclasse) {
      throw new HttpException(404, 'Classe not found\'');
    }

    // @ts-ignore
    return this.classe.update({
      where: {
        id,
      },
      data: {
        ...classeData
      },
    });
  }

  async deleteclasse(id: number): Promise<Classe | null> {
    const existingclasse = await this.getClasseById(id);

    if (!existingclasse) {
      throw new HttpException(404, 'Classe not found\'');
    }

    // @ts-ignore
    return this.classe.delete({
      where: {
        id,
      },
    });
  }

}
