import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from "@exceptions/HttpException";
import { Options } from '@/interfaces/options.interface';
import { CreateOptionsDto } from '@/dtos/options.dto';
import PrismaService from './prisma.service';

@Service()
export class Options2Service {
  private prisma = PrismaService.getInstance();
  public options = this.prisma.options;

  async getOptionById(id: number): Promise<Options | null> {
    const option = await this.options.findUnique({
      where: {
        id,
      },
    });

    if (!option) {
      throw new HttpException(404, 'Option not found');
    }

    return option;
  }

  public async getAllOptions(): Promise<Options[]> {
    return this.options.findMany();
  }

  public async createOption(optionData: CreateOptionsDto): Promise<Options> {
    try {
      const existingOption = await this.options.findFirst({
        where: {
          name: optionData.name,
        },
      });

      if (existingOption) {
        throw new HttpException(409, 'Option already exists');
      }

      return this.options.create({
        data: {
          name: optionData.name,
        },
      });
    } catch (error) {
      throw new HttpException(500, 'Error creating option: ' + error.message);
    }
  }

  public async updateOption(id: number, updateOptionDto: CreateOptionsDto): Promise<Options | null> {
    const existingOption = await this.getOptionById(id);

    if (!existingOption) {
      throw new HttpException(404, 'Option not found');
    }

    return this.options.update({
      where: {
        id,
      },
      data: {
        name: updateOptionDto.name,
      },
    });
  }

  async deleteOption(id: number): Promise<Options | null> {
    const existingOption = await this.getOptionById(id);

    if (!existingOption) {
      throw new HttpException(404, 'Option not found');
    }

    return this.options.delete({
      where: {
        id,
      },
    });
  }
}
