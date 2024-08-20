import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {LearnerAnswer} from "@interfaces/learnerAnswer.interface";
import PrismaService from './prisma.service';

@Service()
export class LearnerAnswerService {
  private prisma = PrismaService.getInstance();


  async createLearnerResponse(quizzId: number, learnerId: number, learnerAnswers: LearnerAnswer[]): Promise<LearnerAnswer[]> {
    // Vérifiez si le quiz existe
    const existingQuizz = await this.prisma.quiz.findFirst({
      where: {
        id: quizzId,
      },
    });
  
    if (!existingQuizz) {
      throw new HttpException(409, 'Quiz does not exist');
    }
  
    // Vérifiez l'existence de chaque question et assurez-vous que chaque question appartient bien au quiz
    await Promise.all(learnerAnswers.map(async (learnerAnswer) => {
      const existingQuestion = await this.prisma.question.findFirst({
        where: {
          id: learnerAnswer.questionId,
          quizId: quizzId,  // Assurez-vous que la question appartient bien au quiz
        },
      });
  
      if (!existingQuestion) {
        throw new HttpException(409, `Question with id ${learnerAnswer.questionId} does not exist or does not belong to the specified quiz`);
      }
    }));
  
    // Créez ou mettez à jour les réponses de l'apprenant
    const reponsesCrees: LearnerAnswer[] = [];
    
    for (const answer of learnerAnswers) {
      const existingAnswer = await this.prisma.learnerAnswer.findFirst({
        where: {
          learnerId: learnerId,
          quizId: quizzId,
          questionId: answer.questionId,
        },
      });
  
      if (existingAnswer) {
        // Mettre à jour l'ancienne réponse avec la nouvelle valeur
        const updatedAnswer = await this.prisma.learnerAnswer.update({
          where: {
            id: existingAnswer.id,
          },
          data: {
            propositionId: answer.propositionId,
          },
        });
        reponsesCrees.push(updatedAnswer);
      } else {
        // Créer une nouvelle réponse
        const newAnswer = await this.prisma.learnerAnswer.create({
          data: {
            learnerId: learnerId,
            quizId: quizzId,
            questionId: answer.questionId,
            propositionId: answer.propositionId,
          },
        });
        reponsesCrees.push(newAnswer);
      }
    }
  
    return reponsesCrees;
  }
  
  



  async  getLearnerResponseById(learnerResponseId) {
      const learnerAnswer = await this.prisma.learnerAnswer.findUnique({
        where: {
          id: learnerResponseId
        },
        include: {
          learner: true,
          quiz: true,
          question: true,
          proposition: true
        }
      });
      return learnerAnswer;

  }


  // async getLearnerPerformance(learnerId, syllabusId)  {
  //   const result = await this.prisma.syllabus.findUnique({
  //     where: { id: syllabusId },
  //     include: {
  //       session: {
  //         include: {
  //           concept: {
  //             include: {
  //               quizzes: {
  //                 include: {
  //                   learnerAnswer: {
  //                     where: { learnerId: learnerId },
  //                     select: {
  //                       quizId: true,
  //                       question: {
  //                         select: {
  //                           answer: true,
  //                         },
  //                       },
  //                       proposition: true,
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  
  //   const conceptsWithScores = result.session.flatMap(session => 
  //     session.concept.map(concept => {
  //       const quizzes = concept.quizzes.map(quiz => {
  //         const learnerAnswers = quiz.learnerAnswer;
  
  //         // Calcul du score
  //         let score = null;
  //         if (learnerAnswers.length > 0) {
  //           const correctAnswers = learnerAnswers.filter(answer =>
  //             answer.proposition.valeur === answer.question.answer[0].valeur
  //           );
  //           score = (correctAnswers.length / quiz.questions.length) * 100;
  //         }
  
  //         return {
  //           quizId: quiz.id,
  //           quizName: quiz.name,
  //           score: score,
  //         };
  //       });
  
  //       return {
  //         conceptId: concept.id,
  //         conceptName: concept.name,
  //         quizzes: quizzes,
  //       };
  //     })
  //   );
  
  //   return conceptsWithScores;
  // };



// Optimisation du calcul du score d'un apprenant pour un quiz spécifique
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

}
