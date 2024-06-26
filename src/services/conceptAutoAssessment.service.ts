import { PrismaClient } from '@prisma/client';
import {Container, Service} from 'typedi';
import {CreateAutoAssessmentDTO} from "@dtos/autoAssessment.dto";
import {AutoAssessmentInterface} from "@interfaces/autoAssessment.interface";
import {QuizzService} from "@services/quizz.service";
import {HttpException} from "@exceptions/HttpException";

@Service()
export class ConceptAutoAssessmentService {

  public prisma = new PrismaClient();

  public async saveConceptAutoAssessment(conceptId, learnerId, critereId) {
    const getNoteFromCriteria = (critereId) => {
      switch (critereId) {
        case 1:
          return 0; // Pas du tout compris
        case 2:
          return 0.20; // Très peu compris
        case 3:
          return 0.40; // Peu compris
        case 4:
          return 0.60; // Moyennement compris
        case 5:
          return 0.80; // Bien compris
        case 6:
          return 0.90; // Très bien compris
        case 7:
          return 1; // Complètement compris
        default:
          throw new Error('Critère invalide');
      }
    };
    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      throw new HttpException(404, 'Learner not found');
    }

    const concept = await this.prisma.concept.findUnique({ where: { id: conceptId } });
    if (!concept) {
      throw new HttpException(404, 'Concept not found');
    }

    const note = getNoteFromCriteria(critereId);
    const mastered = note >= 6;
    const conceptAutoAssessment= await this.prisma.conceptAutoAssessment.create({
      data: {
        mastered: mastered,
        learnerId: learnerId,
        conceptId: conceptId,
        criteriaId: critereId,
        noteCritere: note
      }})
    return conceptAutoAssessment
  }

  public async getConceptAutoAssessment(conceptId: number, learnerId: number) {
    const assessment = await this.prisma.conceptAutoAssessment.findFirst({
      where: {
          conceptId: conceptId,
          learnerId: learnerId,
      },
    });

    if (!assessment) {
      throw new HttpException(404, 'ConceptAutoAssessment not found');
    }

    return assessment.noteCritere;
  }

}
