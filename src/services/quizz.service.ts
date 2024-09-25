import { Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '@exceptions/HttpException';
import { CreateQuizDto } from '@dtos/quizz.dto';
import { Quiz } from '@interfaces/quizz.interface';
import PrismaService from './prisma.service';

@Service()
export class QuizzService {
  private prisma = PrismaService.getInstance();
  private quizz = this.prisma.quiz;
  private learnerAnswer = this.prisma.learnerAnswer;
  private answer = this.prisma.answer;
  private question = this.prisma.question;
  private concept = this.prisma.concept;
  private syllabus = this.prisma.syllabus;
  private session = this.prisma.session;
  public async createQuiz(conceptId: number, quizData: CreateQuizDto): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const createQuizz = await this.quizz.create({
      data: {
        ...quizData,
        concept: { connect: { id: conceptId } },
        questions: {
          create: quizData.questions.map(question => {
            let count = 1;
            return {
              ...question,
              propositions: {
                create: question.propositions.map(proposition => ({
                  numbQuestion: count++,
                  ...proposition,
                })),
              },
              answer: {
                create: question.answer.map(answer => ({ ...answer })),
              },
            };
          }),
        },
      },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    return createQuizz;
  }

  public async getAllQuizzForConcept(conceptId: number): Promise<Quiz[]> {
    const quizzes = await this.quizz.findMany({
      where: { conceptId },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    if (!quizzes) {
      throw new HttpException(404, 'quizzes not found');
    }
    return quizzes;
  }

  public async getQuizzById(conceptId: number, id: number): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const quizz = await this.quizz.findFirst({
      where: { id, conceptId },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    if (!quizz) {
      throw new HttpException(404, 'Quizz not found');
    }
    return quizz;
  }

  public async getQuizDetails(quizId: number) {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          concept: {
            include: {
              session: {
                include: {
                  syllabus: {
                    include: {
                      teacher: true,
                    },
                  },
                },
              },
            },
          },
          questions: {
            include: {
              propositions: true,
              answer: true,
            },
          },
        },
      });

      if (!quiz) {
        throw new HttpException(404, 'Quiz not found');
      }

      return {
        id: quiz.id,
        name: quiz.name,
        isActive: quiz.isActive,
        Date: quiz.Date,
        concept: {
          id: quiz.concept.id,
          name: quiz.concept.name,
        },
        session: {
          id: quiz.concept.session.id,
          name: quiz.concept.session.name,
        },
        syllabus: {
          id: quiz.concept.session.syllabus.id,
          name: quiz.concept.session.syllabus.name,
        },
        questions: quiz.questions.map(question => ({
          id: question.id,
          libelle: question.libelle,
          propositions: question.propositions.map(proposition => ({
            id: proposition.id,
            valeur: proposition.valeur,
            numbQuestion: proposition.numbQuestion,
          })),
          answer: question.answer.map(answer => ({
            id: answer.id,
            valeur: answer.valeur,
          })),
        })),
      };
    } catch (error) {
      console.error('Error retrieving quiz details:', error);
      throw new HttpException(500, 'Internal server error');
    }
  }

  public async updateQuizzForConcept(conceptId: number, id: number, quizz: any): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const updatedQuizz = await this.quizz.update({
      where: { id },
      data: { ...quizz },
    });

    return updatedQuizz;
  }


  public async updateQuiz(conceptId: number, quizId: number, quizData: CreateQuizDto): Promise<Quiz> {
    const existingConcept = await this.concept.findFirst({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const existingQuiz = await this.quizz.findFirst({ where: { id: quizId, conceptId } });

    if (!existingQuiz) {
      throw new HttpException(409, 'Quiz not exists');
    }

    const updatedQuiz = await this.quizz.update({
      where: { id: quizId },
      data: {
        ...quizData,
        questions: {
          deleteMany: {}, 
          create: quizData.questions.map(question => {
            let count = 1;
            return {
              ...question,
              propositions: {
                create: question.propositions.map(proposition => ({
                  numbQuestion: count++,
                  ...proposition,
                })),
              },
              answer: {
                create: question.answer.map(answer => ({ ...answer })),
              },
            };
          }),
        },
      },
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });

    return updatedQuiz;
  }

// Méthode pour mettre à jour un quiz avec des optimisations
public async updateQuizzData(quizId: number, updateQuizData: any): Promise<Quiz> {
  const existingQuiz = await this.quizz.findFirst({ where: { id: quizId } });

  if (!existingQuiz) {
      throw new HttpException(404, 'Quiz not found');
  }

  return this.prisma.$transaction(async (prisma) => {
      // Suppression des questions existantes
      await prisma.question.deleteMany({
          where: { quizId },
      });

      // Création de nouvelles questions et propositions
      const createdQuestions = [];
      for (const questionData of updateQuizData.questions) {
          const createdQuestion = await prisma.question.create({
              data: {
                  libelle: questionData.libelle,
                  quizId: quizId,
                  propositions: {
                      create: questionData.propositions.map((prop, index) => ({
                          ...prop,
                          numbQuestion: index + 1,
                      })),
                  },
                  answer: {
                      create: questionData.answer.map(ans => ({ ...ans })),
                  },
              },
              include: {
                  propositions: true,
                  answer: true,
              },
          });

          createdQuestions.push(createdQuestion);
      }

      // Mise à jour des informations principales du quiz
      const updatedQuiz = await prisma.quiz.update({
          where: { id: quizId },
          data: {
              name: updateQuizData.name,
              isActive: updateQuizData.isActive,
              conceptId: updateQuizData.conceptId,
              Date: updateQuizData.Date ? new Date(updateQuizData.Date) : undefined,
              questions: {
                  set: createdQuestions.map(q => ({ id: q.id })),
              },
          },
          include: {
              questions: {
                  include: {
                      propositions: true,
                      answer: true,
                  },
              },
          },
      });

      return updatedQuiz;
  });
}








  public async deleteQuizz(id: number): Promise<Quiz | null> {
    const existingQuizz = await this.quizz.findFirst({ where: { id } });

    if (!existingQuizz) {
      throw new HttpException(409, 'Quizz not exists');
    }

    return this.quizz.delete({ where: { id } });
  }

  // Evaluation d'un quizz
  public async calculateLearnerScore(learnerId: number, quizId: number) {
    const learnerAnswers = await this.learnerAnswer.findMany({
      where: { learnerId, quizId },
      include: {
        proposition: { include: { question: true } },
      },
    });

    let score = 0;

    for (const answer of learnerAnswers) {
      const correctAnswer = await this.answer.findFirst({ where: { questionId: answer.questionId } });

      if (answer.proposition.numbQuestion === correctAnswer.valeur) {
        score++;
      }
    }

    const totalQuestions = await this.question.count({ where: { quizId } });
    const scorePercentage = (score / totalQuestions) * 100;

    return scorePercentage;
  }


  // Méthode pour récupérer tous les quiz associés à un professeur
// Méthode pour récupérer tous les quiz associés à un professeur
public async getAllQuizzForTeacher(teacherId: number): Promise<any[]> {
  // Récupérer tous les quiz associés aux syllabus du professeur
  const syllabusWithQuizzes = await this.syllabus.findMany({
    where: { teacherId },
    select: {
      session: {  // Corrected to 'session' based on schema
        select: {
          concept: {
            select: {
              quizzes: {
                include: {
                  questions: {
                    include: {
                      propositions: true,
                      answer: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Si aucun quiz n'est trouvé, lever une exception
  if (syllabusWithQuizzes.length === 0) {
    throw new HttpException(404, 'No quizzes found for this teacher');
  }

  // Extraire les quiz des résultats imbriqués
  const allQuizzes = syllabusWithQuizzes
    .flatMap(syllabus => syllabus.session)  // Extract sessions from syllabus
    .flatMap(session => session.concept)   // Extract concepts from sessions
    .flatMap(concept => concept.quizzes);   // Extract quizzes from concepts

  return allQuizzes;
}
  
  
}
