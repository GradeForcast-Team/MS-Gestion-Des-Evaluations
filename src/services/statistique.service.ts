import { Service } from "typedi";
import { PrismaClient } from "@prisma/client";
import { HttpException } from "@exceptions/HttpException";
import { CreateSessionDto, GetSessionsBetweenDatesDto } from "@dtos/session.dto";
import PrismaService from "./prisma.service";

@Service()
export class StatistiqueService {
    private prisma = PrismaService.getInstance();

    public async calculateLearnerScore(learnerId: number, quizId: number): Promise<number> {
        // Récupérer toutes les réponses de l'apprenant pour ce quiz
        const learnerAnswers = await this.prisma.learnerAnswer.findMany({
          where: { learnerId, quizId },
          include: {
            proposition: { select: { numbQuestion: true, questionId: true } },
          },
        });
      
        // Récupérer toutes les réponses correctes pour les questions du quiz en une seule requête
        const correctAnswers = await this.prisma.answer.findMany({
          where: {
            questionId: { in: learnerAnswers.map(answer => answer.questionId) },
          },
          select: { questionId: true, valeur: true },
        });
      
        // Mapper les réponses correctes par questionId pour un accès plus rapide
        const correctAnswersMap = new Map(correctAnswers.map(answer => [answer.questionId, answer.valeur]));
      
        // Calculer le score
        let score = 0;
        for (const answer of learnerAnswers) {
          if (answer.proposition.numbQuestion === correctAnswersMap.get(answer.questionId)) {
            score++;
          }
        }
      
        // Récupérer le nombre total de questions dans le quiz (si pas déjà récupéré avant)
        const totalQuestions = correctAnswers.length;
      
        const scorePercentage = (score / totalQuestions) * 100;
        return scorePercentage;
      }
      
      // Récupérer les concepts, les quiz, le score de l'apprenant pour chaque quiz, et les sessions associées
      public async getLearnerPerformance(learnerId: number, syllabusId: number) {
        const syllabusData = await this.prisma.syllabus.findUnique({
          where: { id: syllabusId },
          include: {
            session: {
              include: {
                concept: {
                  include: {
                    quizzes: true, // On récupère uniquement les quiz
                  },
                },
              },
            },
          },
        });
      
        const conceptsWithScores = [];
      
        for (const session of syllabusData.session) {
          for (const concept of session.concept) {
            const quizzesWithScores = [];
      
            for (const quiz of concept.quizzes) {
              const score = await this.calculateLearnerScore(learnerId, quiz.id);
              quizzesWithScores.push({
                quizId: quiz.id,
                quizName: quiz.name,
                score: score,
              });
            }
      
            conceptsWithScores.push({
              sessionId: session.id,
              sessionName: session.name,
              conceptId: concept.id,
              conceptName: concept.name,
              quizzes: quizzesWithScores,
            });
          }
        }
      
        return conceptsWithScores;
      }
      
      public async getLearnerAutoEvaluations(learnerId: number, syllabusId: number) {
        // Récupérer toutes les sessions et concepts pour le syllabus spécifié
        const sessions = await this.prisma.session.findMany({
          where: { syllabusId: syllabusId },
          include: {
            concept: {
              include: {
                conceptAutoAssessment: {
                  where: { learnerId: learnerId },
                  select: {
                    noteCritere: true,
                    autoEvaluationDate: true
                  }
                }
              }
            }
          }
        });
      
        // Préparer le tableau final des sessions
        const sessionsArray = sessions.map(session => {
          const concepts = session.concept.map(concept => {
            const assessment = concept.conceptAutoAssessment[0]; // Puisque nous récupérons pour un seul learner
            return {
              conceptId: concept.id,
              conceptName: concept.name,
              score: assessment ? assessment.noteCritere : null, // Score ou NULL si pas d'évaluation
              date: assessment ? assessment.autoEvaluationDate.toISOString().split('T')[0] : null // Date ou NULL si pas d'évaluation
            };
          });
      
          return {
            sessionId: session.id,
            sessionName: session.name,
            concepts: concepts
          };
        });
      
        // Vérification si des sessions sont trouvées
        if (!sessionsArray.length) {
          throw new HttpException(404, 'No sessions found for the given syllabus');
        }
      
        return sessionsArray;
      }

//    public async calculateEvaluationAndAutoEvaluationGap(learnerId: number, syllabusId: number): Promise<number> {
//   // Récupérer les performances de l'apprenant
//   const learnerPerformance = await this.getLearnerPerformance(learnerId, syllabusId);
//   const learnerAutoEvaluations = await this.getLearnerAutoEvaluations(learnerId, syllabusId);

//   let totalEvaluationScore = 0;
//   let totalAutoEvaluationScore = 0;
//   let totalConcepts = 0;
//   let totalSessions = learnerPerformance.length;

//   // Parcourir chaque session dans les performances de l'apprenant
//   learnerPerformance.forEach((session) => {
//     let sessionEvaluationScore = 0;
//     let sessionAutoEvaluationScore = 0;
//     let numberOfConceptsInSession = session.concepts.length;

//     session.concepts.forEach((concept) => {
//       totalConcepts++;

//       // Calculer le score de l'évaluation pour ce concept
//       const conceptEvaluationScore = concept.quizzes.reduce((sum, quiz) => {
//         // Supposons que chaque quiz a un score sur 100
//         return sum + 100; // Remplacer 100 par la méthode de calcul réelle si nécessaire
//       }, 0) / (concept.quizzes.length || 1); // Eviter division par zéro

//       sessionEvaluationScore += conceptEvaluationScore;

//       // Trouver l'auto-évaluation correspondante
//       const autoEvaluationSession = learnerAutoEvaluations.find(
//         (autoEvalSession) => autoEvalSession.sessionId === session.sessionId
//       );

//       if (autoEvaluationSession) {
//         const autoEvaluationConcept = autoEvaluationSession.concepts.find(
//           (autoEvalConcept) => autoEvalConcept.conceptId === concept.conceptId
//         );

//         if (autoEvaluationConcept) {
//           sessionAutoEvaluationScore += autoEvaluationConcept.score || 0;
//         }
//       }
//     });

//     // Ajouter les scores de la session aux totaux globaux
//     totalEvaluationScore += sessionEvaluationScore / numberOfConceptsInSession;
//     totalAutoEvaluationScore += sessionAutoEvaluationScore / numberOfConceptsInSession;
//   });

//   // Calculer les notes finales pour la matière
//   const finalEvaluationScore = totalEvaluationScore / totalSessions;
//   const finalAutoEvaluationScore = totalAutoEvaluationScore / totalSessions;

//   // Calculer l'écart
//   const ecart = finalEvaluationScore - finalAutoEvaluationScore;

//   return ecart;
// }

public async calculateEvaluationAndAutoEvaluationGap(learnerId: number, syllabusId: number): Promise<number> {
    console.log("Début du calcul de l'écart pour le learner:", learnerId, "et le syllabus:", syllabusId);
  
    // Étape 1: Récupérer et calculer les scores d'évaluation pour le syllabus
    const learnerPerformance = await this.getLearnerPerformance(learnerId, syllabusId);
    console.log("Performance de l'apprenant récupérée:", learnerPerformance);
  
    const autoEvaluationsData = await this.getLearnerAutoEvaluations(learnerId, syllabusId);
    console.log("Auto-évaluations récupérées:", autoEvaluationsData);
  
    let totalEvaluationScore = 0;
    let totalAutoEvaluationScore = 0;
    let numberOfSessions = learnerPerformance.length;
  
    // Utilisation de la nouvelle fonction pour traiter les données de session
    const processedSessions = this.processSessionData(learnerPerformance);
    console.log("Sessions traitées:", processedSessions);
  
    for (const session of processedSessions) {
      const autoSession = autoEvaluationsData.find(s => s.sessionId === session.sessionId);
      console.log("Session actuelle:", session.sessionName, "Auto-session correspondante:", autoSession);
  
      let sessionEvaluationScore = 0;
      let sessionAutoEvaluationScore = 0;
      let numberOfConceptsInSession = session.concepts.length;
  
      for (const concept of session.concepts) {
        console.log("Concept actuel:", concept.conceptName);
        const quizzes = concept.quizzes;
  
        // Calculer la note de concept en pourcentage
        let conceptScore = 0;
        if (quizzes.length > 0) {
          let totalQuizScore = 0;
          for (const quiz of quizzes) {
            const quizScore = await this.calculateLearnerScore(learnerId, quiz.quizId);
            console.log("Score du quiz", quiz.quizName, ":", quizScore);
            totalQuizScore += quizScore;
          }
          conceptScore = totalQuizScore / quizzes.length;
        }
        console.log("Score du concept calculé:", conceptScore);
        
        // Récupérer le score de l'auto-évaluation pour ce concept, converti en pourcentage
        const autoConcept = autoSession?.concepts.find(c => c.conceptId === concept.conceptId);
        const autoConceptScore = autoConcept?.score !== null && autoConcept?.score !== undefined ? autoConcept.score * 100 : 0;
        console.log("Score de l'auto-évaluation pour le concept (en pourcentage):", autoConceptScore);
  
        // Ajouter au score total de la session
        sessionEvaluationScore += conceptScore;
        sessionAutoEvaluationScore += autoConceptScore;
      }
  
      // Calculer les moyennes pour chaque session
      if (numberOfConceptsInSession > 0) {
        sessionEvaluationScore /= numberOfConceptsInSession;
        sessionAutoEvaluationScore /= numberOfConceptsInSession;
      }
      console.log("Score moyen de la session (évaluation):", sessionEvaluationScore);
      console.log("Score moyen de la session (auto-évaluation en pourcentage):", sessionAutoEvaluationScore);
  
      // Ajouter au score total
      totalEvaluationScore += sessionEvaluationScore;
      totalAutoEvaluationScore += sessionAutoEvaluationScore;
    }
  
    // Calculer les moyennes finales pour le syllabus
    if (numberOfSessions > 0) {
      totalEvaluationScore /= numberOfSessions;
      totalAutoEvaluationScore /= numberOfSessions;
    }
    console.log("Score final du syllabus (évaluation):", totalEvaluationScore);
    console.log("Score final du syllabus (auto-évaluation en pourcentage):", totalAutoEvaluationScore);
  
    // Étape 2: Calculer l'écart entre la note d'évaluation et d'auto-évaluation
    const ecart = totalEvaluationScore - totalAutoEvaluationScore;
    console.log("Écart final:", ecart);
  
    return ecart;
  }
  
  // Méthode pour grouper les concepts par ID (mise à jour selon la structure actuelle des données)
  private processSessionData(sessions) {
    const groupedSessions = sessions.map(session => {
      return {
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        concepts: [
          {
            conceptId: session.conceptId,
            conceptName: session.conceptName,
            quizzes: session.quizzes
          }
        ]
      };
    });
  
    console.log("Sessions regroupées:", groupedSessions);
    return groupedSessions;
  }
  
  
}