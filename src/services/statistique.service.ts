import { Service } from "typedi";
import { PrismaClient } from "@prisma/client";
import { HttpException } from "@exceptions/HttpException";
import { CreateSessionDto, GetSessionsBetweenDatesDto } from "@dtos/session.dto";
import PrismaService from "./prisma.service";

// Déclarations des Types
type ConceptScore = {
  score: number;
  totalQuestions: number;
  sessionId: number;
  conceptName: string;
  sessionName: string;// Ajouter cette ligne pour inclure le nom de la session
};

type SessionScore = {
  score: number;
  totalConcepts: number;
  sessionName: string;
  scorePercentage?: number;
};

type QuizDetail = {
  quizId: number;
  questions: {
    question: string;
    propositions: { id: number; valeur: string }[];
    learnerAnswer: string | null;
    correctAnswer: string | null;
    isCorrect: boolean;
  }[];
};
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
  
  public async trackLearnerProgress(learnerId: number, syllabusId: number): Promise<any[]> {
    // Récupérer les scores des quiz
    const quizDetails = await this.getAllQuizDetails(learnerId);
    const autoEvaluations = await this.getLearnerAutoEvaluations(learnerId, syllabusId);

    const progressData = [];

    // Align and merge quiz and auto-evaluation data by session and concept
    for (const autoEvalSession of autoEvaluations) {
      const sessionId = autoEvalSession.sessionId;
      const sessionName = autoEvalSession.sessionName;

      const quizSession = quizDetails.evaluations.find(e => e.session.id === sessionId);
      const quizConcepts = quizSession ? quizSession.detailleQuizz : [];

      for (const autoEvalConcept of autoEvalSession.concepts) {
        const conceptId = autoEvalConcept.conceptId;
        const conceptName = autoEvalConcept.conceptName;
        const autoEvalScore = autoEvalConcept.score || 0;

        // Find matching quiz concept
        const quizConcept = quizConcepts.find(qc => qc.concept === conceptName);
        const quizScores = quizConcept ? quizConcept.Questions.map(q => q.score || 0) : [0];

        // Prepare progress data
        progressData.push({
          sessionId,
          sessionName,
          conceptId,
          conceptName,
          quizScores,
          autoEvaluationScore: autoEvalScore,
          date: autoEvalConcept.date
        });
      }
    }

    return progressData;
  }

  // Existing methods...

  public async getQuizDetailsByConcept(conceptName: string, learnerId: number) {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        concept: {
          name: conceptName,
        },
      },
      include: {
        questions: {
          include: {
            propositions: true,
          },
        },
      },
    });
  
    const quizDetails = await Promise.all(quizzes.map(async (quiz) => {
      const questions = await Promise.all(quiz.questions.map(async (question) => {
        const learnerAnswer = await this.prisma.learnerAnswer.findFirst({
          where: {
            questionId: question.id,
            learnerId: learnerId,
          },
          include: {
            proposition: true,
          },
        });
  
        const correctAnswer = await this.prisma.answer.findFirst({
          where: {
            questionId: question.id,
          },
        });
  
        return {
          question: question.libelle,
          propositions: question.propositions.map(p => ({
            id: p.id,
            valeur: p.valeur,
          })),
          learnerAnswer: learnerAnswer ? learnerAnswer.proposition.valeur : null,
          correctAnswer: correctAnswer ? correctAnswer.valeur : null,
          isCorrect: learnerAnswer ? learnerAnswer.proposition.numbQuestion === correctAnswer?.valeur : false,
        };
      }));
  
      return {
        quizId: quiz.id,
        questions,
      };
    }));
  
    return quizDetails;
  }
  
  public async getAllQuizDetails(learnerId: number) {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        user: true,
        classe: {
          include: {
            ecole: true,
          },
        },
      },
    });

    if (!learner) {
      throw new HttpException(404, 'Learner not found');
    }

    const learnerQuizzes = await this.prisma.learnerAnswer.findMany({
      where: { learnerId },
      select: { quizId: true },
      distinct: ['quizId'],
    });

    const quizScores = await Promise.all(
      learnerQuizzes.map(async (quiz) => {
        const scorePercentage = await this.calculateLearnerScore(learnerId, quiz.quizId);
        return { quizId: quiz.quizId, scorePercentage };
      })
    );

    const evaluations: any[] = [];
    const conceptScores: Record<number, ConceptScore> = {};
    for (const { quizId } of learnerQuizzes) {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          concept: {
            include: {
              session: {
                include: {
                  syllabus: {
                    include: {
                      teacher: {
                        include: { user: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (quiz && quiz.concept) {
        const conceptId = quiz.concept.id;
        const session = quiz.concept.session;
        if (!conceptScores[conceptId]) {
          conceptScores[conceptId] = {
            score: 0,
            totalQuestions: 0,
            sessionId: session.id,
            conceptName: quiz.concept.name,
            sessionName: session.name,
          };
        }
        conceptScores[conceptId].score += quizScores.find((qs) => qs.quizId === quizId)?.scorePercentage || 0;
        conceptScores[conceptId].totalQuestions += 1;
      }
    }

    const sessionScores: Record<number, SessionScore> = {};
    for (const conceptId in conceptScores) {
      const concept = conceptScores[conceptId];
      if (!sessionScores[concept.sessionId]) {
        sessionScores[concept.sessionId] = {
          score: 0,
          totalConcepts: 0,
          sessionName: concept.sessionName,
        };
      }
      sessionScores[concept.sessionId].score += (concept.score / concept.totalQuestions);
      sessionScores[concept.sessionId].totalConcepts += 1;
    }

    for (const sessionId in sessionScores) {
      sessionScores[sessionId].scorePercentage = (sessionScores[sessionId].score / sessionScores[sessionId].totalConcepts);
    }

    for (const sessionId in sessionScores) {
      const sessionConcepts = Object.values(conceptScores).filter(concept => concept.sessionId === parseInt(sessionId));
      const detailleQuizz = await Promise.all(sessionConcepts.map(async (concept, index) => {
        const quizDetails = await this.getQuizDetailsByConcept(concept.conceptName, learnerId);
        return {
          concept: concept.conceptName,
          Questions: quizDetails,
        };
      }));

      const sessionName = sessionScores[sessionId].sessionName;
      const firstSessionConcept = sessionConcepts[0];
      const syllabus = await this.prisma.syllabus.findUnique({
        where: { id: firstSessionConcept.sessionId },
        include: {
          teacher: {
            include: { user: true },
          },
        },
      });

      evaluations.push({
        class: learner.classe,
        school: learner.classe?.ecole,
        detailleQuizz,
        session: { id: sessionId, name: sessionName },
        score: sessionScores[sessionId].scorePercentage,
        syllabus: syllabus,
        teacher: syllabus?.teacher?.user,
      });
    }

    const response = {
      learner,
      evaluations,
      quizScores,
      sessionScores,
      conceptScores,
    };

    return response;
  }


 
  
}