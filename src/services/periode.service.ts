import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { Periode } from '@interfaces/periode.interface';
import { CreatePeriodeDto, ValidatePeriodeDto } from '@/dtos/periode.dto';

@Service()
export class PeriodeService {
  public periode = new PrismaClient().periode;

  async getPeriodeById(id: number): Promise<Periode | null> {
    const periode = await this.periode.findUnique({
      where: {
        id,
      },
    });

    if (!periode) {
      throw new HttpException(404, 'Periode not found');
    }

    return periode;
  }

  public async getAllPeriodes(): Promise<Periode[]> {
    return this.periode.findMany();
  }

  public async createPeriode(periodeData: CreatePeriodeDto): Promise<Periode> {
    return this.periode.create({
      data: {
        name: periodeData.name,
      },
    });
  }

  public async updatePeriode(id: number, periodeData: ValidatePeriodeDto): Promise<Periode | null> {
    const existingPeriode = await this.getPeriodeById(id);

    if (!existingPeriode) {
      throw new HttpException(404, 'Periode not found');
    }

    return this.periode.update({
      where: {
        id,
      },
      data: {
        ...periodeData
      },
    });
  }

  async deletePeriode(id: number): Promise<Periode | null> {
    const existingPeriode = await this.getPeriodeById(id);

    if (!existingPeriode) {
      throw new HttpException(404, 'Periode not found');
    }

    return this.periode.delete({
      where: {
        id,
      },
    });
  }
}
