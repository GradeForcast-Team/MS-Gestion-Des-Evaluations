import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {Classe} from "@interfaces/classe.interface";
import {CreateClasseDto, ValidateClasseDto} from "@dtos/classe.dto";
import { Server } from 'socket.io';
@Service()
export class ClasseService {
  public classe = new PrismaClient().classe;
  public teacher = new PrismaClient().teacher;
  public niveau = new PrismaClient().niveau;
  public teacherclasse = new PrismaClient().teacherClasse;
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }
  async getClasseById(id: number): Promise<Classe | null> {
    const Classe = await this.classe.findUnique({
      where: {
        id,
      },
    });

    if (!Classe) {
      throw new HttpException(404, 'Classe not found');
    }

    // @ts-ignore
    return Classe;
  }
  public async getAllClasse() {
    return this.classe.findMany({
      include: {
        ecole: true,
        niveau: true,
        learners: true,
        teachers: true,
      },
    });
  }
  public async createclasse(classeData: CreateClasseDto) {
    console.log(classeData)
        const existingClasse = await this.classe.findFirst({
      where: {
        name: classeData.name,
        ecoleId: classeData.ecoleId,
      },
    });

    if (existingClasse) {
      throw new HttpException(409, 'Classe already exists');
    }

      // Vérifier si le niveau existe
      const niveau = await this.niveau.findUnique({
        where: {
          id: classeData.niveauId
        }
      });

      if (!niveau) {
        throw new HttpException(404, 'Niveau not found');
      }

    const connectTeachers = classeData.teachers?.map(teacherId => ({ id: teacherId }));
    const connectLearners = classeData.learners?.map(learnerId => ({ id: learnerId }));

    // @ts-ignore
    const newClasse = this.classe.create({
      data: {
        name: classeData.name,
        ecoleId: classeData.ecoleId || null,
        niveauId: classeData.niveauId,
        learners: {
          connect: connectLearners || [],
        },
      },
    });
    this.io.emit('classeUpdate', newClasse);
    return newClasse;
  }

  public async createClasseWithTeacher(classeData: CreateClasseDto, teacherId: number) {
    console.log(classeData);
  
    // Vérifier si la classe existe déjà
    const existingClasse = await this.classe.findFirst({
      where: {
        name: classeData.name,
        ecoleId: classeData.ecoleId,
      },
    });
  
    if (existingClasse) {
      throw new HttpException(409, 'Classe already exists');
    }
  
    // Vérifier si le niveau existe
    const niveau = await this.niveau.findUnique({
      where: {
        id: classeData.niveauId,
      },
    });
  
    if (!niveau) {
      throw new HttpException(404, 'Niveau not found');
    }
  
    // Préparer les apprenants
    const connectLearners = classeData.learners?.map(learnerId => ({ id: learnerId }));
  
    // Créer la nouvelle classe
    const newClasse = await this.classe.create({
      data: {
        name: classeData.name,
        ecoleId: classeData.ecoleId || null,
        niveauId: classeData.niveauId,
        learners: {
          connect: connectLearners || [],
        },
      },
    });
  
    // Créer la relation TeacherClasse
    await this.teacherclasse.create({
      data: {
        teacherId: teacherId,
        classeId: newClasse.id,
      },
    });
  
    this.io.emit('classeUpdate', newClasse);
    return newClasse;
  }

  // async createClasse(classeData: CreateClasseDto) {
  //   const existingClasse = await this.classe.findFirst({
  //     where: {
  //       name: classeData.name,
  //       ecoleId: classeData.ecoleId,
  //     },
  //   });

  //   if (existingClasse) {
  //     throw new HttpException(409, 'Classe already exists');
  //   }

  //   const niveau = await this.niveau.findUnique({
  //     where: { id: classeData.niveauId },
  //   });

  //   if (!niveau) {
  //     throw new HttpException(404, 'Niveau not found');
  //   }

  //   const newClasse = await this.classe.create({
  //     data: {
  //       name: classeData.name,
  //       ecoleId: classeData.ecoleId || null,
  //       niveauId: classeData.niveauId,
  //       learners: {
  //         connect: classeData.learners?.map(learnerId => ({ id: learnerId })) || [],
  //       },
  //       teachers: {
  //         connect: classeData.teachers?.map(teacherId => ({ id: teacherId })) || [],
  //       }
  //     },
  //   });

  //   this.io.emit('classeUpdate', newClasse);
  //   return newClasse;
  // }

  async updateClasse(id: number, classeData: ValidateClasseDto) {
    const existingClasse = await this.getClasseById(id);

    if (!existingClasse) {
      throw new HttpException(404, 'Classe not found');
    }

    const updatedClasse = await this.classe.update({
      where: { id },
      data: classeData,
    });

    this.io.emit('classeUpdate', updatedClasse);
    return updatedClasse;
  }

  async deleteClasse(id: number) {
    const existingClasse = await this.getClasseById(id);

    if (!existingClasse) {
      throw new HttpException(404, 'Classe not found');
    }

    const deletedClasse = await this.classe.delete({
      where: { id },
    });

    this.io.emit('classeUpdate', deletedClasse);
    return deletedClasse;
  }

  async getClassesByTeacher(teacherId: number) {
    console.log("teacher", teacherId)
    const classes = await this.classe.findMany({
      where: {
        teachers: {
          some: {
            teacherId: teacherId,
          },
        },
      },
      include: {
        teachers: true,
        learners: true,
        ecole: true,
        niveau: true,
      },
    });

    if (!classes.length) {
      throw new HttpException(404, 'No classes found for the given teacher');
    }

    return classes;
  }

  public async getSyllabiByTeacherAndClass(teacherId: number, classeId: number): Promise<any[]> {
    try {
      const teacherClasse = await this.teacherclasse.findMany({
        where: {
          teacherId: teacherId,
          classeId: classeId,
        },
        include: {
          classe: {
            include: {
              syllabusClasse: {
                include: {
                  syllabus: {
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
                                    },
                                  },
                                },
                              },
                            },
                          },
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

      if (!teacherClasse.length) {
        throw new HttpException(404, 'No syllabi found for the given teacher and class');
      }

      const syllabi = teacherClasse.flatMap(tc => tc.classe.syllabusClasse.map(sc => sc.syllabus));

      return syllabi;
    } catch (error) {
      console.error("Error fetching syllabi by teacher and class:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  public async getLearnersByClasseId(classeId: number) {
    try {
      // Vérifier si la classe existe
      const classeExists = await this.classe.findUnique({
        where: { id: classeId },
        include: {
          learners: {
            include: {
              user: true, // Inclure les détails de l'utilisateur associé à chaque apprenant
            },
          },
        },
      });

      if (!classeExists) {
        throw new HttpException(404, 'Class not found');
      }

      // Extraire les apprenants de la classe
      const learners = classeExists.learners;

      if (!learners.length) {
        throw new HttpException(404, 'No learners found for the given class');
      }

      return learners;
    } catch (error) {
      console.error("Error fetching learners by class ID:", error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }
  
}
