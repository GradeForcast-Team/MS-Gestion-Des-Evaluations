import { Service } from "typedi";
import { PrismaClient } from "@prisma/client";
import { Session } from "@interfaces/session.interface";
import { HttpException } from "@exceptions/HttpException";
import { CreateSessionDto, GetSessionsBetweenDatesDto } from "@dtos/session.dto";

@Service()
export class SessionService {
  private session = new PrismaClient().session;
  private syllabus = new PrismaClient().syllabus;

  public async createSession(syllabusId: number, sessionData: CreateSessionDto): Promise<Session> {
    const existingSyllabus = await this.syllabus.findUnique({
      where: {
        id: syllabusId,
      },
    });

    if (!existingSyllabus) {
      throw new HttpException(404, 'Syllabus not found');
    }

    const existingSession = await this.session.findFirst({
      where: {
        name: sessionData.name,
        syllabusId: syllabusId,
      },
    });

    if (existingSession) {
      throw new HttpException(409, 'Session already exists');
    }

    const createSession = await this.session.create({
      data: {
        syllabusId: syllabusId,
        startDate: sessionData.startDate,
        name: sessionData.name,
        endDate: sessionData.endDate,
        concept: {
          create: sessionData.concepts.map(concepts => ({
            name: concepts.name,
            quizzes: {
              create: concepts.quizzes.map(quiz => ({
                name: quiz.name,
                questions: {
                  create: quiz.questions.map(question => {
                    // Réinitialiser le compteur à 1 pour chaque nouvelle question
                    let count = 1;
                    return {
                      libelle: question.libelle,
                      propositions: {
                        create: question.propositions.map(proposition => ({
                          numbQuestion: count++, // Incrémenter le compteur à chaque proposition
                          valeur: proposition.valeur,
                        })),
                      },
                      answer: {
                        create: question.answer.map(answer => ({
                          valeur: answer.valeur,
                        })),
                      },
                    };
                  }),
                },
              })),
            },
          })),
        },
      },
      include: {
        concept: {
          include: {
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
    });

    return createSession;
  }

  public async getAllSessionsForSyllabus(syllabusId: number): Promise<Session[]> {
    const sessions = await this.session.findMany({
      where: {
        syllabusId,
      },
      include: {
        concept: {
          include: {
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
    });

    if (!sessions) {
      throw new HttpException(404, 'Sessions not found');
    }

    return sessions;
  }

  public async getSessionById(syllabusId: number, id: number): Promise<Session> {
    const existingSyllabus = await this.syllabus.findUnique({
      where: {
        id: syllabusId,
      },
    });

    if (!existingSyllabus) {
      throw new HttpException(404, 'Syllabus not found');
    }

    const session = await this.session.findFirst({
      where: {
        id,
        syllabusId,
      },
      include: {
        concept: {
          include: {
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
    });

    if (!session) {
      throw new HttpException(404, 'Session not found');
    }

    return session;
  }

  public async getSessionsBetweenDates(teacherId: number, query: GetSessionsBetweenDatesDto): Promise<Session[]> {
    const sessions = await this.session.findMany({
      where: {
        startDate: {
          gte: query.startDate,
        },
        endDate: {
          lte: query.endDate,
        },
        syllabus: {
          teacherId: teacherId,
        },
      },
      include: {
        concept: {
          include: {
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
    });

    if (!sessions.length) {
      throw new HttpException(404, 'No sessions found for the given dates');
    }

    return sessions;
  }

  public async updateSessionForSyllabus(syllabusId: number, id: number, sessionData: CreateSessionDto): Promise<Session> {
    const existingSyllabus = await this.syllabus.findUnique({
      where: {
        id: syllabusId,
      },
    });

    if (!existingSyllabus) {
      throw new HttpException(404, 'Syllabus not found');
    }

    const existingSession = await this.session.findFirst({
      where: {
        id,
        syllabusId,
      },
    });

    if (!existingSession) {
      throw new HttpException(404, 'Session not found');
    }

    const updatedSession = await this.session.update({
      where: {
        id,
      },
      data: {
        name: sessionData.name,
        startDate: sessionData.startDate,
        endDate: sessionData.endDate,
        concept: {
          deleteMany: {},
          create: sessionData.concepts.map(concepts => ({
            name: concepts.name,
            quizzes: {
              create: concepts.quizzes.map(quiz => ({
                name: quiz.name,
                questions: {
                  create: quiz.questions.map(question => {
                    // Réinitialiser le compteur à 1 pour chaque nouvelle question
                    let count = 1;
                    return {
                      libelle: question.libelle,
                      propositions: {
                        create: question.propositions.map(proposition => ({
                          numbQuestion: count++, // Incrémenter le compteur à chaque proposition
                          valeur: proposition.valeur,
                        })),
                      },
                      answer: {
                        create: question.answer.map(answer => ({
                          valeur: answer.valeur,
                        })),
                      },
                    };
                  }),
                },
              })),
            },
          }))
        },
      },
      include: {
        concept: {
          include: {
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
    });

    return updatedSession;
  }

  public async deleteSession(id: number): Promise<Session | null> {
    const existingSession = await this.session.findFirst({
      where: {
        id,
      },
    });

    if (!existingSession) {
      throw new HttpException(404, 'Session not found');
    }

    return this.session.delete({
      where: {
        id,
      },
    });
  }
}
