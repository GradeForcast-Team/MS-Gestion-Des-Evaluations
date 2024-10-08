import { Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '@exceptions/HttpException';
import { CreateConceptDto } from '@/dtos/concept.dto';
import { Concept } from '@/interfaces/concept.interface';
import PrismaService from './prisma.service';

@Service()
export class ConceptService {
  private prisma = PrismaService.getInstance();
  private session = this.prisma.session;
  private concept = this.prisma.concept;

  public async createConcept(sessionId: number, conceptData: CreateConceptDto): Promise<Concept> {
    const existingSession = await this.session.findFirst({ where: { id: sessionId } });

    if (!existingSession) {
      throw new HttpException(409, 'Concept not exists');
    }

    const createConcept = await this.concept.create({
      data: {
        ...conceptData,
        sessionId: sessionId,
        quizzes: {
          create: conceptData.quizzes.map(quiz => ({
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
      },
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
    });

    return createConcept;
  }

  public async getAllConceptsForSession(sessionId: number): Promise<Concept[]> {
    try {
      const concepts = await this.prisma.concept.findMany({
        where: { sessionId },
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
      });
  
      if (!concepts) {
        throw new HttpException(404, 'Concepts not found');
      }
      return concepts;
    } catch (error) {
      console.error('Error getting concepts for session:', error);
      throw new Error('Error getting concepts for session');
    }
  }
  
  public async getConceptById(conceptId: number): Promise<Concept> {
    try {
      const concept = await this.prisma.concept.findUnique({
        where: { id: conceptId },
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
      });
  
      if (!concept) {
        throw new HttpException(404, 'Concept not found');
      }
      return concept;
    } catch (error) {
      console.error('Error getting concept by ID:', error);
      throw new Error('Error getting concept by ID');
    }
  }
    
  public async updateConcept(conceptId: number, conceptData: CreateConceptDto): Promise<Concept> {
  
    const existingConcept = await this.prisma.concept.findUnique({ where: { id: conceptId } });

    if (!existingConcept) {
      throw new HttpException(409, 'Concept not exists');
    }

    const updatedConcept = await this.prisma.concept.update({
        where: { id: conceptId },
        data: {
          ...conceptData,
          quizzes: {
            deleteMany: {}, // Suppression des anciens quizzes
            create: conceptData.quizzes ? conceptData.quizzes.map(quiz => ({
              name: quiz.name,
              questions: {
                create: quiz.questions.map(question => {
                  let count = 1;
                  return {
                    libelle: question.libelle,
                    propositions: {
                      create: question.propositions.map(proposition => ({
                        numbQuestion: count++,
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
            })) : undefined,
          },
        },
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
      });
  
      return updatedConcept;
  }


  public async deleteConcept(conceptId: number): Promise<Concept> {
    try {
      const existingConcept = await this.prisma.concept.findUnique({ where: { id: conceptId } });
  
      if (!existingConcept) {
        throw new HttpException(409, 'Concept not exists');
      }
  
      const deletedConcept = await this.prisma.concept.delete({
        where: { id: conceptId },
      });
  
      return deletedConcept;
    } catch (error) {
      console.error('Error deleting concept:', error);
      throw new Error('Error deleting concept');
    }
  }

  public async getTeacherData(teacherId: number): Promise<any> {
    try {
      const teacherData = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          syllabus: {
            include: {
              session: {
                include: {
                  concept: true, // Inclut les concepts associés à la session
                },
              },
            },
          },
        },
      });

      if (!teacherData) {
        throw new HttpException(404, 'Teacher not found');
      }

      // Construction d'une réponse JSON minimaliste avec les IDs
      const result = teacherData.syllabus.map(syllabus => ({
        syllabusId: syllabus.id,
        syllabusName: syllabus.name,
        sessions: syllabus.session.map(session => ({
          sessionId: session.id,
          sessionName: session.name,
          concepts: session.concept.map(concept => ({
            conceptId: concept.id,
            conceptName: concept.name
          })),
        })),
      }));

      return result;
    } catch (error) {
      console.error('Error getting teacher data:', error);
      throw new Error('Error getting teacher data');
    }
  }

  
}
