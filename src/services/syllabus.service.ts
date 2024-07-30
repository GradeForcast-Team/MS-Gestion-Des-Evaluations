import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { Syllabus } from '@interfaces/syllabus.interface';
import * as console from 'console';
import { CreateSyllabusDto } from '@dtos/syllabus.dto';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { v4 as uuid } from 'uuid';
import generateSyllabusHTML from "@services/TemplateSyllabus";
import puppeteer from 'puppeteer';
import {create, CreateOptions, CreateResult} from "html-pdf";
import path from "path";
import dotenv from 'dotenv';
import * as process from "process";
dotenv.config();

@Service()
export class SyllabusService {
  private prisma = new PrismaClient()

  public async generateSyllabusPDF(syllabusId: number, teacherId: number) {
    const syllabus = await this.prisma.syllabus.findFirst({
      where: {
        id: syllabusId,
        teacherId: teacherId,
      },
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
        pedagogicalMethod: {
          select: {
            name: true,
          },
        },
        educationalSupport: {
          select: {
            name: true,
          },
        },
        evaluationMode: {
          select: {
            name: true,
          }
        }
      },
    });
  
    if (!syllabus) {
      throw new Error('Syllabus not found');
    }
  
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
          },
        },
      },
    });
  
    if (!teacher) {
      throw new Error('Teacher not found');
    }
  
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `${syllabus.name}${syllabusId}.pdf`;
    const filePath = path.join(__dirname, `../../public/pdf/${fileName}`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
  
    // Header
    doc.image(path.join(__dirname, `../../public/images/logoG.jpg`), 50, 45, { width: 50 })
      .fillColor('#3B82F6')
      .fontSize(20)
      .text(`Syllabus du cours: ${syllabus.name}`, 110, 57)
      .moveDown();
  
    // Teacher info
    doc.fillColor('#000000')
      .fontSize(12)
      .text(`Enseignant: ${teacher.user.name} ${teacher.user.surname}`, { align: 'left' })
      .text(`Nombre d'heures: ${syllabus.nbhr || 'Non spécifié'}`)
      .text(`Crédit Coeff: ${syllabus.creditCoef || 'Non spécifié'}`)
      .moveDown(0.5);
  
    // Section separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  
    // Course description
    doc.moveDown()
      .font('Helvetica-Bold').fontSize(14).text('Description du cours:')
      .font('Helvetica').fontSize(12).text(syllabus.courseDescription).moveDown(0.5);
  
    // General objective
    if (syllabus.generalObjective) {
      doc.font('Helvetica-Bold').fontSize(14).text('Objectif général:')
        .font('Helvetica').fontSize(12).text(syllabus.generalObjective).moveDown(0.5);
    }
  
    // Specific objectives
    if (syllabus.specificObjective) {
      doc.font('Helvetica-Bold').fontSize(14).text('Objectif spécifique:')
        .font('Helvetica').fontSize(12).text(syllabus.specificObjective).moveDown(0.5);
    }
  
    // Pedagogical methods
    if (syllabus.pedagogicalMethod && syllabus.pedagogicalMethod.name) {
      doc.font('Helvetica-Bold').fontSize(14).text('Méthodes pédagogiques:')
        .font('Helvetica').fontSize(12).text(`- ${syllabus.pedagogicalMethod.name}`).moveDown(0.5);
    }
  
    // Pedagogical supports
    if (syllabus.educationalSupport && syllabus.educationalSupport.name) {
      doc.font('Helvetica-Bold').fontSize(14).text('Supports pédagogiques:')
        .font('Helvetica').fontSize(12).text(`- ${syllabus.educationalSupport.name}`).moveDown(0.5);
    }
  
    // Evaluation mode
    if (syllabus.evaluationMode && syllabus.evaluationMode.name) {
      doc.font('Helvetica-Bold').fontSize(14).text('Mode d\'évaluation:')
        .font('Helvetica').fontSize(12).text(syllabus.evaluationMode.name).moveDown(0.5);
    }
  
    // Sessions
    if (syllabus.session.length > 0) {
      doc.font('Helvetica-Bold').fontSize(14).text('Sessions:');
      syllabus.session.forEach(session => {
        doc.font('Helvetica-Bold').fontSize(12).text(`- ${session.name}:`);
        doc.font('Helvetica').fontSize(12).text(`  Début: ${session.startDate}`)
          .text(`  Fin: ${session.endDate}`).moveDown(0.5);
        
        // Concepts
        if (session.concept.length > 0) {
          doc.font('Helvetica-Bold').fontSize(12).text('  Concepts:');
          session.concept.forEach(concept => {
            doc.font('Helvetica').fontSize(12).text(`    - ${concept.name}`).moveDown(0.5);
            
            // Quizzes
            if (concept.quizzes.length > 0) {
              doc.font('Helvetica-Bold').fontSize(12).text('    Quizzes:');
              concept.quizzes.forEach(quiz => {
                doc.font('Helvetica').fontSize(12).text(`      - ${quiz.name}`).moveDown(0.5);
                
                // Questions
                if (quiz.questions.length > 0) {
                  doc.font('Helvetica-Bold').fontSize(12).text('      Questions:');
                  quiz.questions.forEach(question => {
                    doc.font('Helvetica').fontSize(12).text(`        - ${question.libelle}`).moveDown(0.5);
                  });
                }
              });
            }
          });
        }
      });
    }
  
    doc.end();
    writeStream.on('finish', () => console.log('PDF généré avec succès.'));
    return filePath;
  }
  

  public async createOptimalSyllabus(id: number, syllabusData: CreateSyllabusDto) {
    // Calculer la somme des heures de session
    const totalSessionHours = syllabusData.sessions.reduce((acc: number, session: any) => {
      return acc + session.nbhr;
    }, 0);
  
    // Vérifier si la somme des heures de session est supérieure au nombre total d'heures du syllabus
    if (totalSessionHours > syllabusData.nbhr) {
      throw new Error("La somme des heures de session dépasse le nombre total d'heures du syllabus.");
    }
    
  
    // Vérifications préalables dans la base de données
    const academicYear = await this.prisma.academicYear.findUnique({ where: { id: syllabusData.academicYearId } });
    if (!academicYear) {
      throw new Error("L'année académique spécifiée n'existe pas.");
    }
  
    const pedagogicalMethod = syllabusData.methodeId ? await this.prisma.pedagogicalMethod.findUnique({ where: { id: syllabusData.methodeId } }) : null;
    if (syllabusData.methodeId && !pedagogicalMethod) {
      throw new Error("La méthode pédagogique spécifiée n'existe pas.");
    }
  
    const educationalSupport = syllabusData.supportId ? await this.prisma.supportsPedagogiques.findUnique({ where: { id: syllabusData.supportId } }) : null;
    if (syllabusData.supportId && !educationalSupport) {
      throw new Error("Le support pédagogique spécifié n'existe pas.");
    }
  
    const evaluationMode = syllabusData.modeId ? await this.prisma.evaluationMode.findUnique({ where: { id: syllabusData.modeId } }) : null;
    if (syllabusData.modeId && !evaluationMode) {
      throw new Error("Le mode d'évaluation spécifié n'existe pas.");
    }
  
    const periode = await this.prisma.periode.findUnique({ where: { id: syllabusData.periodId } });
    if (!periode) {
      throw new Error("La période spécifiée n'existe pas.");
    }
  
    const data: any = {
      teacher: { connect: { id: id } },
      name: syllabusData.name,
      nbhr: syllabusData.nbhr,
      creditCoef: syllabusData.creditCoef,
      courseDescription: syllabusData.courseDescription,
      generalObjective: syllabusData.generalObjective ?? undefined,
      specificObjective: syllabusData.specificObjective ?? undefined,
      academicYear: { connect: { id: syllabusData.academicYearId } },
      periode: { connect: { id: syllabusData.periodId } },
      session: {
        create: syllabusData.sessions.map(sessions => ({
          name: sessions.name,
          startDate: sessions.startDate,
          endDate: sessions.endDate,
          concept: {
            create: sessions.concepts.map(concepts => ({
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
        })),
      },
    };
  
    // Inclure les champs facultatifs si présents
    if (syllabusData.methodeId) {
      data.pedagogicalMethod = { connect: { id: syllabusData.methodeId } };
    }
    if (syllabusData.supportId) {
      data.educationalSupport = { connect: { id: syllabusData.supportId } };
    }
    if (syllabusData.modeId) {
      data.evaluationMode = { connect: { id: syllabusData.modeId } };
    }
  
    const createdSyllabus = await this.prisma.syllabus.create({
      data,
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
  
    return createdSyllabus;
  }
  
  
  
  public async updateSyllabus(id: number, syllabusId: number, syllabusData: CreateSyllabusDto) {
    // Calculer la somme des heures de session
    const totalSessionHours = syllabusData.sessions.reduce((acc: number, session: any) => {
      return acc + session.nbhr;
    }, 0);
  
    // Vérifier si la somme des heures de session est supérieure au nombre total d'heures du syllabus
    if (totalSessionHours > syllabusData.nbhr) {
      throw new Error("La somme des heures de session dépasse le nombre total d'heures du syllabus.");
    }
  
    // Vérifications préalables dans la base de données
    const academicYear = await this.prisma.academicYear.findUnique({ where: { id: syllabusData.academicYearId } });
    if (!academicYear) {
      throw new Error("L'année académique spécifiée n'existe pas.");
    }
  
    const pedagogicalMethod = syllabusData.methodeId ? await this.prisma.pedagogicalMethod.findUnique({ where: { id: syllabusData.methodeId } }) : null;
    if (syllabusData.methodeId && !pedagogicalMethod) {
      throw new Error("La méthode pédagogique spécifiée n'existe pas.");
    }
  
    const educationalSupport = syllabusData.supportId ? await this.prisma.supportsPedagogiques.findUnique({ where: { id: syllabusData.supportId } }) : null;
    if (syllabusData.supportId && !educationalSupport) {
      throw new Error("Le support pédagogique spécifié n'existe pas.");
    }
  
    const evaluationMode = syllabusData.modeId ? await this.prisma.evaluationMode.findUnique({ where: { id: syllabusData.modeId } }) : null;
    if (syllabusData.modeId && !evaluationMode) {
      throw new Error("Le mode d'évaluation spécifié n'existe pas.");
    }
  
    const periode = await this.prisma.periode.findUnique({ where: { id: syllabusData.periodId } });
    if (!periode) {
      throw new Error("La période spécifiée n'existe pas.");
    }
  
    const data: any = {
      teacher: { connect: { id: id } },
      name: syllabusData.name,
      nbhr: syllabusData.nbhr,
      creditCoef: syllabusData.creditCoef,
      courseDescription: syllabusData.courseDescription,
      generalObjective: syllabusData.generalObjective ?? undefined,
      specificObjective: syllabusData.specificObjective ?? undefined,
      academicYear: { connect: { id: syllabusData.academicYearId } },
      periode: { connect: { id: syllabusData.periodId } },
    };
  
    // Inclure les champs facultatifs si présents
    if (syllabusData.methodeId) {
      data.pedagogicalMethod = { connect: { id: syllabusData.methodeId } };
    }
    if (syllabusData.supportId) {
      data.educationalSupport = { connect: { id: syllabusData.supportId } };
    }
    if (syllabusData.modeId) {
      data.evaluationMode = { connect: { id: syllabusData.modeId } };
    }
  
    const updatedSyllabus = await this.prisma.$transaction(async (prisma) => {
      // Supprimer les sessions existantes
      await prisma.session.deleteMany({
        where: { syllabusId: syllabusId },
      });
  
      // Mettre à jour le syllabus
      const updatedSyllabus = await prisma.syllabus.update({
        where: { id: syllabusId },
        data,
      });
  
      // Créer les nouvelles sessions
      for (const session of syllabusData.sessions) {
        await prisma.session.create({
          data: {
            name: session.name,
            startDate: session.startDate,
            endDate: session.endDate,
            syllabus: { connect: { id: syllabusId } },
            concept: {
              create: session.concepts.map(concept => ({
                name: concept.name,
                quizzes: {
                  create: concept.quizzes.map(quiz => ({
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
                  })),
                },
              })),
            },
          },
        });
      }
  
      return updatedSyllabus;
    });
  
    return updatedSyllabus;
  }
  
  
  

  public async geAllSyllabusForTeacher(teacherId: number): Promise<Syllabus[]> {
    const syllabus = await this.prisma.syllabus.findMany({
      where: {
        teacher: {
          id: teacherId,
        },
      },
      include: {
        academicYear: true,
        periode: true,
        pedagogicalMethod: true,
        educationalSupport: true,
        evaluationMode: true,
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

    return syllabus;
  }

  public async getSyllabusForTeacher(syllabusId: number, teacherId: number): Promise<Syllabus> {
    console.log(syllabusId);
    const syllabus = await this.prisma.syllabus.findFirst({
      where: {
        id: syllabusId,
        teacher: {
          id: teacherId,
        },
      },
      include: {
        academicYear: true,
        periode: true,
        pedagogicalMethod: true,
        educationalSupport: true,
        evaluationMode: true,
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

    if (!syllabus) {
      throw new Error('Syllabus not found or does not belong to the teacher.');
    }

    return syllabus;
  }

  // public async getSyllabusByLink(link: string) {
  //   const syllabus = await this.prisma.syllabus.findUnique({
  //     where: { link },
  //     include: {
  //       session: {
  //         include: {
  //           quizzes: {
  //             include: {
  //               questions: {
  //                 include: {
  //                   propositions: true,
  //                   answer: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!syllabus) {
  //     throw new Error('Syllabus not found');
  //   }

  //   return syllabus;
  // }

  // public async updateSyllabusGeneral(syllabusId: number, teacherId: number, syllabus: CreateSyllabusDto): Promise<Syllabus> {
  //   const existingSyllabus = await this.prisma.syllabus.findFirst({
  //     where: {
  //       id: syllabusId,
  //       teacherId: teacherId,
  //     },
  //   });

  //   if (!existingSyllabus) {
  //     throw new HttpException(404, 'Syllabus not found for the given teacher');
  //   }
  //   const updatedSyllabus = await this.prisma.syllabus.update({
  //     where: {
  //       id: syllabusId,
  //     },
  //     data: {
  //       name: syllabus.name,
  //       nbhr: syllabus.nbhr,
  //       semestre: syllabus.semestre,
  //       creditCoef: syllabus.creditCoef,
  //       year: syllabus.year,
  //       description_cours: syllabus.courseDescription,
  //       generalObjective: syllabus.generalObjective,
  //       specificObjective: syllabus.specificObjective,
  //       methodeId: syllabus.methodeId,
  //       supportId: syllabus.supportId,
  //       modeId: syllabus.modeId,
  //       academicYearId: syllabus.academicYearId,
  //       periodeId: syllabus.periodId,
  //     },
  //   });

  //   return updatedSyllabus;
  // }

  async deleteSyllabus(syllabusId: number, teacherId: number): Promise<Syllabus | null> {
    const existingSyllabus = await this.prisma.syllabus.findFirst({
      where: {
        id: syllabusId,
        teacherId: teacherId,
      },
    });

    if (!existingSyllabus) {
      throw new HttpException(404, 'Syllabus not found for the given teacher');
    }

    return this.prisma.syllabus.delete({
      where: {
        id: syllabusId,
      },
    });
  }
  
//les syllabus d'un professeur avec les classes
public async getSyllabusWithClassesForTeacher(teacherId: number): Promise<any[]> {
  try {
    const syllabi = await this.prisma.syllabus.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        syllabusClasse: {
          include: {
            classe: {
              include: {
                niveau: true, // Inclure les informations sur le niveau de chaque classe
              },
            },
          },
        },
      },
    });

    const formattedSyllabi = syllabi.map(syllabus => {
      const classes = syllabus.syllabusClasse.map(sc => ({
        ...sc.classe,
        niveau: {
          id: sc.classe.niveau.id,
          name: sc.classe.niveau.name,
        },
        linkSyllabusClasse: sc.linkSyllabusClasse,
      }));
      const status = classes.length ? 'assigned' : 'not assigned';
      return {
        ...syllabus,
        classes: classes.length ? classes : [{ status: 'not assigned' }],
        status: status,
      };
    });

    return formattedSyllabi;
  } catch (error) {
    console.error("Error fetching syllabi with classes for teacher:", error);
    throw new HttpException(500, 'Internal Server Error');
  }
}
}
