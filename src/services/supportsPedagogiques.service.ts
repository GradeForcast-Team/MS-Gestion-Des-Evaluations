import { PrismaClient, SupportsPedagogiques } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { CreateSupportsPedagogiquesDto, ValidateSupportsPedagogiquesDto } from '@/dtos/supportsPedagogiques.dto';

@Service()
export class SupportsPedagogiquesService {
  public supportsPedagogiques = new PrismaClient().supportsPedagogiques;

  async getSupportsPedagogiquesById(id: number): Promise<SupportsPedagogiques | null> {
    const supportsPedagogiques = await this.supportsPedagogiques.findUnique({
      where: {
        id,
      },
    });

    if (!supportsPedagogiques) {
      throw new HttpException(404, 'Supports Pedagogiques not found');
    }

    return supportsPedagogiques;
  }

  public async getAllSupportsPedagogiques(): Promise<SupportsPedagogiques[]> {
    return this.supportsPedagogiques.findMany();
  }

  public async createSupportsPedagogiques(supportsPedagogiquesData: CreateSupportsPedagogiquesDto): Promise<SupportsPedagogiques> {
    return this.supportsPedagogiques.create({
      data: {
        name: supportsPedagogiquesData.name,
      },
    });
  }

  public async updateSupportsPedagogiques(id: number, supportsPedagogiquesData: ValidateSupportsPedagogiquesDto): Promise<SupportsPedagogiques | null> {
    const existingSupportsPedagogiques = await this.getSupportsPedagogiquesById(id);

    if (!existingSupportsPedagogiques) {
      throw new HttpException(404, 'Supports Pedagogiques not found');
    }

    return this.supportsPedagogiques.update({
      where: {
        id,
      },
      data: {
        ...supportsPedagogiquesData
      },
    });
  }

  async deleteSupportsPedagogiques(id: number): Promise<SupportsPedagogiques | null> {
    const existingSupportsPedagogiques = await this.getSupportsPedagogiquesById(id);

    if (!existingSupportsPedagogiques) {
      throw new HttpException(404, 'Supports Pedagogiques not found');
    }

    return this.supportsPedagogiques.delete({
      where: {
        id,
      },
    });
  }
}
