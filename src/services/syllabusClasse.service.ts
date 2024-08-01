import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from "@exceptions/HttpException";
import { SyllabusClasse } from '../interfaces/syllabusClasse.interface';
import { v4 as uuid } from 'uuid';

@Service()
export class SyllabusClasseService {
  private prisma = new PrismaClient();

  async getSyllabusClassesBySyllabusId(syllabusId: number): Promise<SyllabusClasse[]> {
    try {
      const syllabusClasses = await this.prisma.syllabusClasse.findMany({
        where: {
          syllabusId: syllabusId,
        },
        include: {
          syllabus: true,
          classe: true,
        },
      });

      if (!syllabusClasses.length) {
        throw new HttpException(404, 'No classes found for the given syllabus');
      }

      return syllabusClasses;
    } catch (error) {
      console.error("Error fetching classes by syllabus ID:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  async getSyllabusClassesByClasseId(classeId: number): Promise<SyllabusClasse[]> {
    try {
      // Vérifier si la classe existe
      const classeExists = await this.prisma.classe.findUnique({
        where: { id: classeId },
      });
  
      if (!classeExists) {
        throw new HttpException(404, 'Class not found');
      }
  
      // Récupérer les syllabus associés à la classe
      const syllabusClasses = await this.prisma.syllabusClasse.findMany({
        where: {
          classeId: classeId,
        },
        include: {
          syllabus: {
            include: {
              academicYear: true, // Inclure l'année académique
              teacher: {
                include: {
                  user: true, // Inclure les informations de l'utilisateur lié au professeur
                },
              },
              periode: true, // Inclure les informations de la période
            },
          },
          classe: true,
        },
      });
  
      // Vérifier si des syllabus sont associés à la classe
      if (!syllabusClasses.length) {
        throw new HttpException(404, 'No syllabi found for the given class');
      }
  
      return syllabusClasses;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Relancer l'exception HTTP personnalisée
      }
      console.error("Error fetching syllabi by class ID:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }
  
  
  

  async createSyllabusClasse(syllabusId: number, classeId: number) {
    try {
      const link = uuid();
      const existingSyllabusClasse = await this.prisma.syllabusClasse.findUnique({
        where: {
          syllabusId_classeId: {
            syllabusId: syllabusId,
            classeId: classeId
          },
        },
      });

      if (existingSyllabusClasse) {
        throw new HttpException(409, 'SyllabusClasse already exists');
      }

      const syllabusClasse = await this.prisma.syllabusClasse.create({
        data: {
          syllabus: { connect: { id: syllabusId } },
          classe: { connect: { id: classeId } },
          linkSyllabusClasse: link
        },
      });

      return { syllabusClasse, link: `${process.env.FRONT_URI}/${link}` };
    } catch (error) {
      console.error("Error creating SyllabusClasse:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  async deleteSyllabusClasse(syllabusId: number, classeId: number): Promise<SyllabusClasse | null> {
    try {
      const existingSyllabusClasse = await this.prisma.syllabusClasse.findUnique({
        where: {
          syllabusId_classeId: {
            syllabusId: syllabusId,
            classeId: classeId,
          },
        },
      });

      if (!existingSyllabusClasse) {
        throw new HttpException(404, 'SyllabusClasse not found');
      }

      return this.prisma.syllabusClasse.delete({
        where: {
          syllabusId_classeId: {
            syllabusId: syllabusId,
            classeId: classeId,
          },
        },
      });
    } catch (error) {
      console.error("Error deleting SyllabusClasse:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }
  async getLearnersBySyllabusAndClasse(syllabusId: number, classeId: number): Promise<any[]> {
    try {
      const syllabusClasse = await this.prisma.syllabusClasse.findUnique({
        where: {
          syllabusId_classeId: {
            syllabusId: syllabusId,
            classeId: classeId,
          },
        },
        include: {
          classe: {
            include: {
              learners: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!syllabusClasse) {
        throw new HttpException(404, 'SyllabusClasse not found');
      }

      const learners = syllabusClasse.classe.learners.map(learner => learner.user);

      return learners;
    } catch (error) {
      console.error("Error fetching learners by syllabus and class:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  public async accessSyllabus(userId: number, link: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { learner: true }
    });
  
    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }
  
    const syllabusClasse = await this.prisma.syllabusClasse.findUnique({
      where: { linkSyllabusClasse: link },
      include: { classe: true }
    });
  
    if (!syllabusClasse) {
      throw new Error("Lien invalide.");
    }
  
    const learner = await this.prisma.learner.findUnique({
      where: { userId: userId }
    });
  
    if (learner && learner.classeId === syllabusClasse.classeId) {
      return this.prisma.syllabus.findUnique({
        where: { id: syllabusClasse.syllabusId },
        include: {
          session: {
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
          },
        },
      });
    } else if (!learner) {
      throw new Error("Vous devez créer un compte pour accéder à ce syllabus.");
    } else {
      throw new Error("Vous n'êtes pas dans la classe associée à ce syllabus.");
    }
  }
  
  public async getAllSyllabusByLearnerId(learnerId: number): Promise<any[]> {
    try {
      const learner = await this.prisma.learner.findUnique({
        where: { id: learnerId },
        include: {
          classe: {
            include: {
              syllabusClasse: {
                include : {
                  syllabus : {
                    include : {
                      session : {
                        include: {
                          concept : {
                            include: {
                              quizzes : {
                                include :{
                                  questions : {
                                    include : {
                                      propositions : true
                                    }
                                  }
                                }
                              }
                            }
                            
                          }
                        }
                      }
                    }
                  },
                  classe: true
                  }
                }
              }
            },
          },
      });

      if (!learner) {
        throw new HttpException(404, 'Learner not found');
      }

      const syllabi = learner.classe.syllabusClasse.map(syllabusClasse => syllabusClasse.syllabus);

      return syllabi;
    } catch (error) {
      console.error("Error fetching syllabus for learner:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }
  //afficher one syllabus pour un learner
  public async getSyllabusClasseLearnerById(syllabusId: number, classeId:number): Promise<any> {
    try {
      const syllabusClasse = await this.prisma.syllabusClasse.findFirst({
        where: { syllabusId:syllabusId,classeId: classeId },
        include: {
          syllabus : {
            include : {
              session : {
                include: {
                  concept : {
                    include: {
                      quizzes : {
                        include :{
                          questions : {
                            include : {
                              propositions : true
                            }
                          }
                        }
                      }
                    }
                    
                  }
                }
              }
            }
          },
          classe: true,
        },
      });

      if (!syllabusClasse) {
        throw new HttpException(404, 'Syllabus not found');
      }

      return syllabusClasse.syllabus;
    } catch (error) {
      console.error("Error fetching syllabus by ID:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  // async getSyllabusClassesByClasseId(classeId: number): Promise<SyllabusClasse[]> {
  //   try {
  //     const syllabusClasses = await this.prisma.syllabusClasse.findMany({
  //       where: {
  //         classeId: classeId,
  //       },
  //       include: {
  //         syllabus: true,
  //         classe: true,
  //       },
  //     });
  
  //     if (!syllabusClasses.length) {
  //       throw new HttpException(404, 'No syllabi found for the given class');
  //     }
  
  //     return syllabusClasses;
  //   } catch (error) {
  //     console.error("Error fetching syllabi by class ID:", error);
  //     throw new HttpException(500, 'Internal Server Error');
  //   }
  // }
  
}
