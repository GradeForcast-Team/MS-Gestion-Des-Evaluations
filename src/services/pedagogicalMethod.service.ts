import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { CreatePedagogicalMethodDto, ValidatePedagogicalMethodDto } from '@/dtos/pedagogicalMethod.dto';
import { PedagogicalMethod } from '@/interfaces/pedagogicalMethode.interface';
import PrismaService from './prisma.service';

@Service()
export class PedagogicalMethodService {
  private prisma = PrismaService.getInstance();
  public pedagogicalMethod = this.prisma.pedagogicalMethod;

  async getPedagogicalMethodById(id: number): Promise<PedagogicalMethod | null> {
    const pedagogicalMethod = await this.pedagogicalMethod.findUnique({
      where: {
        id,
      },
    });

    if (!pedagogicalMethod) {
      throw new HttpException(404, 'Pedagogical Method not found');
    }

    return pedagogicalMethod;
  }

  public async getAllPedagogicalMethods(): Promise<PedagogicalMethod[]> {
    return this.pedagogicalMethod.findMany();
  }

  public async createPedagogicalMethod(pedagogicalMethodData: CreatePedagogicalMethodDto): Promise<PedagogicalMethod> {
    return this.pedagogicalMethod.create({
      data: {
        name: pedagogicalMethodData.name,
      },
    });
  }

  public async updatePedagogicalMethod(id: number, pedagogicalMethodData: ValidatePedagogicalMethodDto): Promise<PedagogicalMethod | null> {
    const existingPedagogicalMethod = await this.getPedagogicalMethodById(id);

    if (!existingPedagogicalMethod) {
      throw new HttpException(404, 'Pedagogical Method not found');
    }

    return this.pedagogicalMethod.update({
      where: {
        id,
      },
      data: {
        ...pedagogicalMethodData
      },
    });
  }

  async deletePedagogicalMethod(id: number): Promise<PedagogicalMethod | null> {
    const existingPedagogicalMethod = await this.getPedagogicalMethodById(id);

    if (!existingPedagogicalMethod) {
      throw new HttpException(404, 'Pedagogical Method not found');
    }

    return this.pedagogicalMethod.delete({
      where: {
        id,
      },
    });
  }
}
