import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import {Classe} from "@interfaces/classe.interface";
import {CreateClasseDto, ValidateClasseDto} from "@dtos/classe.dto";
import { Server } from 'socket.io';
import PrismaService from './prisma.service';
@Service()
export class ClasseService {
  private prisma = PrismaService.getInstance();
  public classe = this.prisma.classe;
  public teacher = this.prisma.teacher;
  public niveau = this.prisma.niveau;
  public teacherclasse = this.prisma.teacherClasse;
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
  
      // Vérifier si la classe existe et inclure les apprenants
      const classe = await this.classe.findUnique({
        where: { id: classeId },
        include: {
          learners: {
            include: {
              user: true, // Inclure les détails de l'utilisateur associé à chaque apprenant
            },
          },
        },
      });
  
      // Si la classe n'existe pas, retourner un message approprié
      if (!classe) {
        return { message: 'Class not found', statusCode: 404 };
        
      }
  
      // Extraire les apprenants de la classe
      const learners = classe.learners;
  
      // Si aucun apprenant n'est trouvé, retourner un message approprié
      if (!learners || learners.length === 0) {
        throw new HttpException(404, 'No learners found for the given class');
      }
  
      // Retourner les apprenants si tout est correct
      return  learners ;
    
  }
  
}
