import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { CreateEvaluationModeDto, ValidateEvaluationModeDto } from '@/dtos/evaluationMode.dto';
import { EvaluationMode } from '@/interfaces/evaluationMode.interface';

@Service()
export class EvaluationModeService {
  public evaluationMode = new PrismaClient().evaluationMode;

  async getEvaluationModeById(id: number): Promise<EvaluationMode | null> {
    const evaluationMode = await this.evaluationMode.findUnique({
      where: {
        id,
      },
    });

    if (!evaluationMode) {
      throw new HttpException(404, 'Evaluation Mode not found');
    }

    return evaluationMode;
  }

  public async getAllEvaluationModes(): Promise<EvaluationMode[]> {
    return this.evaluationMode.findMany();
  }

  public async createEvaluationMode(evaluationModeData: CreateEvaluationModeDto): Promise<EvaluationMode> {
    return this.evaluationMode.create({
      data: {
        name: evaluationModeData.name,
      },
    });
  }

  public async updateEvaluationMode(id: number, evaluationModeData: ValidateEvaluationModeDto): Promise<EvaluationMode | null> {
    const existingEvaluationMode = await this.getEvaluationModeById(id);

    if (!existingEvaluationMode) {
      throw new HttpException(404, 'Evaluation Mode not found');
    }

    return this.evaluationMode.update({
      where: {
        id,
      },
      data: {
        ...evaluationModeData
      },
    });
  }

  async deleteEvaluationMode(id: number): Promise<EvaluationMode | null> {
    const existingEvaluationMode = await this.getEvaluationModeById(id);

    if (!existingEvaluationMode) {
      throw new HttpException(404, 'Evaluation Mode not found');
    }

    return this.evaluationMode.delete({
      where: {
        id,
      },
    });
  }
}