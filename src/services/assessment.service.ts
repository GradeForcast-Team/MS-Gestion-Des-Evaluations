import { PrismaClient } from '@prisma/client';
import {Session} from "@interfaces/session.interface";
import {Container, Service} from "typedi";
import {QuizzService} from "@services/quizz.service";
import {ConceptAutoAssessmentService} from "@services/conceptAutoAssessment.service";
const prisma = new PrismaClient();

@Service()
export class AssessmentService {
  public quizzService = Container.get(QuizzService);
  public conceptAutoAssessment = Container.get(ConceptAutoAssessmentService);
  // Function pour calculer l'ecart entre la note de l'auto evaluation et la note d'evaluation
   public async getConceptEvaluation(conceptId, learnerId) {
    // const quiz = await prisma.quiz.findUnique({
    //   where: { id: quizId },
    //   include: {
    //     learnerAnswer: {
    //       where: { learnerId }
    //     },
    //     questions: {
    //       include: { answer: true }
    //     }
    //   }
    // });

    const autoEvaluation =  await this.conceptAutoAssessment.getConceptAutoAssessment(conceptId,learnerId);
    // const evaluation = await this.quizzService.calculateLearnerScore(learnerId,conceptId);
    const evaluation = 50;
    const noteEcart = evaluation - autoEvaluation;

    return {
      autoEvaluation,
      evaluation,
      noteEcart
    };
  }
}
