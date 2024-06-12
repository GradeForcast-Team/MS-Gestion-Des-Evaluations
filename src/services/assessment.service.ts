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
  // async getAssessmentScores(learnerId: number, classeId: number) {
  //   // Récupérer les sessions, matières et concepts pour l'apprenant et la classe
  //   const sessions = await prisma.session.findMany({
  //     where: {
  //       syllabus: {
  //         teacher: {
  //           classes: {
  //             some: {
  //               classeId: classeId,
  //             }
  //           }
  //         }
  //       },
  //       quizzes: {
  //         some: {
  //           learnerAnswer: {
  //             some: {
  //               learnerId: learnerId
  //             }
  //           }
  //         }
  //       }
  //     },
  //     include: {
  //       quizzes: {
  //         include: {
  //           learnerAnswer: {
  //             where: { learnerId: learnerId },
  //           },
  //           autoAssessment: {
  //             where: { learnerId: learnerId },
  //           },
  //         }
  //       }
  //     }
  //   });
  //
  //
  //   // Calcul des niveaux d'évaluation
  //   const level0 = this.evaluateLevel0(sessions);
  //   const level1 = this.evaluateLevel1(sessions);
  //   const level2 = this.evaluateLevel2(sessions);
  //   const level3 = this.evaluateLevel3(sessions);
  //   const level4 = this.evaluateLevel4(sessions);
  //
  //   return { level0, level1, level2, level3, level4 };
  // }
  //
  // evaluateLevel0(sessions: Session[]) {
  //   // Calcul du niveau 0 : Degré de compréhension d'un concept
  //   // CC = Mesure au niveau du concept
  //   // - CA = note d'autoévaluation du concept
  //   // - CE = note d'évaluation du concept
  //   // - &CC = écart de notes (CE-CA) du concept
  //   const concepts = sessions.flatMap(session => session.quizzes.flatMap(quiz => quiz.questions));
  //   return concepts.map(concept => {
  //     const autoEvaluationScore = concept.a.find(answer => answer.type === 'autoEvaluation')?.score || 0;
  //     const evaluationScore = concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0;
  //     const scoreDifference = evaluationScore - autoEvaluationScore;
  //     return {
  //       conceptId: concept.id,
  //       CA: autoEvaluationScore,
  //       CE: evaluationScore,
  //       CC: scoreDifference
  //     };
  //   });
  // }
  //
  // evaluateLevel1(sessions: any) {
  //   // Calcul du niveau 1 : Degré d'appropriation des concepts d'une session
  //   // MCS = Mesure au niveau de chaque session (4 concepts par session)
  //   // - MCA = moyenne des notes des autoévaluations des 4 concepts de la session
  //   // - MCE = moyenne des notes des évaluations des 4 concepts de la session
  //   // - &MCS = moyenne des écarts des notes (MCE-MCA) des 4 concepts de la session
  //   return sessions.map(session => {
  //     const concepts = session.quizzes.flatMap(quiz => quiz.questions);
  //     const autoEvaluationScores = concepts.map(concept => concept.learnerAnswer.find(answer => answer.type === 'autoEvaluation')?.score || 0);
  //     const evaluationScores = concepts.map(concept => concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0);
  //     const scoreDifferences = evaluationScores.map((score, index) => score - autoEvaluationScores[index]);
  //     const MCA = this.calculateAverage(autoEvaluationScores);
  //     const MCE = this.calculateAverage(evaluationScores);
  //     const MCS = this.calculateAverage(scoreDifferences);
  //     return {
  //       sessionId: session.id,
  //       MCA,
  //       MCE,
  //       MCS
  //     };
  //   });
  // }
  //
  // evaluateLevel2(sessions: any) {
  //   // Calcul du niveau 2 : Potentiel d'évolution dans une matière
  //   // MGS = Mesure au niveau d'un groupe de sessions
  //   // - MSA = moyenne des notes des autoévaluations des sessions passées
  //   // - MSE = moyenne des notes des évaluations des concepts des sessions passées
  //   // - NSN = note de la session normale / séquence
  //   // - &NSNA = écart entre moyenne des notes des autoévaluations des sessions passées et note de la session normale / séquence
  //   // - &NSNE = écart entre moyenne des notes des évaluations des sessions passées et note de la session normale / séquence
  //   const pastSessions = sessions.slice(0, -1);
  //   const currentSession = sessions[sessions.length - 1];
  //   const pastAutoEvaluationScores = pastSessions.flatMap(session => session.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'autoEvaluation')?.score || 0)));
  //   const pastEvaluationScores = pastSessions.flatMap(session => session.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0)));
  //   const currentAutoEvaluationScore = currentSession.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'autoEvaluation')?.score || 0));
  //   const currentEvaluationScore = currentSession.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0));
  //   const MSA = this.calculateAverage(pastAutoEvaluationScores);
  //   const MSE = this.calculateAverage(pastEvaluationScores);
  //   const NSNA = this.calculateAverage(currentAutoEvaluationScore);
  //   const NSNE = this.calculateAverage(currentEvaluationScore);
  //   const &NSNA = NSNA - MSA;
  //   const &NSNE = NSNE - MSE;
  //   return {
  //     MSA,
  //     MSE,
  //     NSNA,
  //     NSNE,
  //   &NSNA,
  // &NSNE
  // };
  // }
  //
  // evaluateLevel3(sessions: any) {
  //   // Calcul du niveau 3 : Potentiel de réussite dans une matière
  //   // MMT = Mesure au niveau d'une matière (l'ensemble des sessions d'un cours)
  //   // - MNA = moyenne des notes des autoévaluations de l'ensemble des sessions de la matière
  //   // - MNE = moyenne des évaluations des concepts de l'ensemble des sessions de la matière
  //   // - MNSN = note de la session normale / séquence
  //   // - &MNSNA = écart entre moyenne des autoévaluations de l'ensemble des sessions de la matière et la note de la session normale / séquence
  //   // - &MNSNE = écart entre moyenne des évaluations de l'ensemble des sessions de la matière et la note de la session normale / séquence
  //   const autoEvaluationScores = sessions.flatMap(session => session.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'autoEvaluation')?.score || 0)));
  //   const evaluationScores = sessions.flatMap(session => session.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0)));
  //   const currentSession = sessions[sessions.length - 1];
  //   const currentAutoEvaluationScore = currentSession.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'autoEvaluation')?.score || 0));
  //   const currentEvaluationScore = currentSession.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0));
  //   const MNA = this.calculateAverage(autoEvaluationScores);
  //   const MNE = this.calculateAverage(evaluationScores);
  //   const MNSNA = this.calculateAverage(currentAutoEvaluationScore);
  //   const MNSNE = this.calculateAverage(currentEvaluationScore);
  //   const &MNSNA = MNSNA - MNA;
  //   const &MNSNE = MNSNE - MNE;
  //   return {
  //     MNA,
  //     MNE,
  //     MNSNA,
  //     MNSNE,
  //   &MNSNA,
  // &MNSNE
  // };
  // }
  //
  // evaluateLevel4(sessions: any) {
  //   // Calcul du niveau 4 : Potentiel de réussite à l'examen ou de passage en classe supérieure
  //   // MEX = Mesure au niveau d'une classe ou d'un examen (l'ensemble des matières d'une classe ou d'un examen)
  //   // - MEMA = moyenne des autoévaluations de l'ensemble des matières d'une classe ou d'un examen
  //   // - MENE = moyenne des évaluations de l'ensemble des matières d'une classe ou d'un examen
  //   // - MNEX = note de la session normale / séquence
  //   // - &MNXA = écart entre moyenne des autoévaluations de l'ensemble des matières d'une classe ou d'un examen de l'enseignement et la note de la session normale / séquence
  //   // - &MNXE = écart entre moyenne des évaluations de l'ensemble des matières de l'enseignement et la note de la session normale / séquence
  //   const autoEvaluationScores = sessions.flatMap(session => session.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'autoEvaluation')?.score || 0)));
  //   const evaluationScores = sessions.flatMap(session => session.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0)));
  //   const currentSession = sessions[sessions.length - 1];
  //   const currentAutoEvaluationScore = currentSession.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'autoEvaluation')?.score || 0));
  //   const currentEvaluationScore = currentSession.quizzes.flatMap(quiz => quiz.questions.map(concept => concept.learnerAnswer.find(answer => answer.type === 'evaluation')?.score || 0));
  //   const MEMA = this.calculateAverage(autoEvaluationScores);
  //   const MENE = this.calculateAverage(evaluationScores);
  //   const MNEX = this.calculateAverage(currentAutoEvaluationScore);
  //   const MNXE = this.calculateAverage(currentEvaluationScore);
  //   const &MNXA = MNEX - MEMA;
  //   const &MNXE = MNXE - MENE;
  //   return {
  //     MEMA,
  //     MENE,
  //     MNEX,
  //     MNXE,
  //   &MNXA,
  // &MNXE
  // };
  // }
  //
  // calculateAverage(scores: number[]): number {
  //   return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  // }
  //

   public async getConceptEvaluation(quizId, learnerId) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        learnerAnswer: {
          where: { learnerId }
        },
        questions: {
          include: { answer: true }
        }
      }
    });

    const autoEvaluation =  await this.conceptAutoAssessment.getConceptAutoAssessment(quizId,learnerId);
    const evaluation = await this.quizzService.NoteLearner(learnerId,quizId);
    const noteEcart = evaluation - autoEvaluation;

    return {
      autoEvaluation,
      evaluation,
      noteEcart
    };
  }
}
