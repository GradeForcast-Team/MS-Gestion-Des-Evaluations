import {Service} from "typedi";
import {PrismaClient} from "@prisma/client";
import {Session} from "@interfaces/session.interface";
import {HttpException} from "@exceptions/HttpException";
import {CreateSessionDto, GetSessionsBetweenDatesDto} from "@dtos/session.dto";

@Service()
export class SessionService {

  private session = new PrismaClient().session;
  private syllabus = new PrismaClient().syllabus;
  public async createSession(syllabusId: number, session: CreateSessionDto) : Promise<Session> {

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
        name : session.name
      },
    });

    if (existingSession) {
      throw new HttpException(409, 'Session already exists');
    }

    const createSession = await this.session.create({
      data: {
        syllabusId: syllabusId,
        startDate: session.startDate,
        name: session.name,
        endDate: session.endDate,
        quizzes: {
          create: session.quizzes.map(quiz => ({
            ...quiz,
            questions: {
              create: quiz.questions.map(question => {
                // Réinitialiser le compteur à 1 pour chaque nouvelle question
                let count = 1;
                return {
                  ...question,
                  propositions: {
                    create: question.propositions.map(proposition => ({
                      numbQuestion: count++, // Incrémenter le compteur à chaque proposition
                      ...proposition,
                    })),
                  },
                  answer: {
                    create: question.answer.map(answer => ({
                      ...answer,
                    })),
                  },
                };
              }),
            },
          }))
        }
      },
      include: {
          quizzes: {
            include: {
              questions: {
                include: {
                  propositions: true,
                    answer: true
                }
              }
            }
          }
    }

    })

    return  createSession;

  }

  public  async  getAllSessionForSyllabus(syllabusId: number): Promise <Session[]> {

    const sessions = await this.session.findMany({
      where: {
        syllabusId,
      },
      include : {
        quizzes: {
          include: {
            questions: {
              include: {
                propositions: true,
                answer: true,
              }
            }
          }
        }
      }
    })
    if (!sessions) {
      throw new HttpException(404, 'Sessions not found');
    }
    return  sessions;
  }

  public async getSessionById(syllabusId: number, id:number): Promise<Session>{

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
        syllabusId
      },
      include : {
        quizzes: {
          include: {
            questions: {
              include: {
                propositions: true,
                answer: true,
              }
            }
          }
        }
      }
    })
    if (!session) {
      throw new HttpException(404, 'Session not found');
    }
    return  session;
  }

  public async getSessionsBetweenDates(teacherId: number, query: GetSessionsBetweenDatesDto) {
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
    });

    if (!sessions.length) {
      throw new HttpException(404,'No sessions found for the given dates');
    }

    return sessions;
  }


  public async updateSessionForSyllabus( syllabusId: number, id:number, session: CreateSessionDto): Promise<Session> {

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
        id
      },
    });

    if (!existingSession) {
      throw new HttpException(409, 'Session not exists');
    }

    const updatedsession = await this.session.update({
      where: {
        id: syllabusId,
      },
      data: {
        name : session.name,
        startDate : session.startDate,
        endDate: session.endDate
      },
    });

    return updatedsession;

  }

  async deleteSession(id:number): Promise<Session | null> {

    const existingSession = await this.session.findFirst({
      where: {
        id
      },
    });

    if (!existingSession) {
      throw new HttpException(409, 'Session not exists');
    }

    return this.session.delete({
      where: {
        id,
      },
    });
  }

}
