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
        session: true,
        methodes_pedagogiques: {
          select: {
            name: true,
          },
        },
        supports_pedagogiques: {
          select: {
            name: true,
          },
        },
        mode_evaluation: {
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
      .text(`Semestre: ${syllabus.semestre || 'Non spécifié'}`)
      .text(`Année: ${syllabus.year || 'Non spécifié'}`)
      .text(`Nombre d'heures: ${syllabus.nbhr || 'Non spécifié'}`)
      .text(`Crédit Coeff: ${syllabus.creditCoef || 'Non spécifié'}`)
      .moveDown(0.5);

    // Section separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Course description
    doc.moveDown()
      .font('Helvetica-Bold').fontSize(14).text('Description du cours:')
      .font('Helvetica').fontSize(12).text(syllabus.description_cours).moveDown(0.5);

    // General objective
    if (syllabus.objectif_general) {
      doc.font('Helvetica-Bold').fontSize(14).text('Objectif général:')
        .font('Helvetica').fontSize(12).text(syllabus.objectif_general).moveDown(0.5);
    }

    // Specific objectives
    if (syllabus.objectif_specifique) {
      doc.font('Helvetica-Bold').fontSize(14).text('Objectif spécifique:')
        .font('Helvetica').fontSize(12).text(syllabus.objectif_specifique).moveDown(0.5);
    }

    // Pedagogical methods
    if (syllabus.methodes_pedagogiques && syllabus.methodes_pedagogiques.name) {
      doc.font('Helvetica-Bold').fontSize(14).text('Méthodes pédagogiques:')
        .font('Helvetica').fontSize(12).text(`- ${syllabus.methodes_pedagogiques.name}`).moveDown(0.5);
    }

    // Pedagogical supports
    if (syllabus.supports_pedagogiques && syllabus.supports_pedagogiques.name) {
      doc.font('Helvetica-Bold').fontSize(14).text('Supports pédagogiques:')
        .font('Helvetica').fontSize(12).text(`- ${syllabus.supports_pedagogiques.name}`).moveDown(0.5);
    }

    // Evaluation mode
    if (syllabus.mode_evaluation && syllabus.mode_evaluation.name) {
      doc.font('Helvetica-Bold').fontSize(14).text('Mode d\'évaluation:')
        .font('Helvetica').fontSize(12).text(syllabus.mode_evaluation.name).moveDown(0.5);
    }

    // Sessions
    if (syllabus.session.length > 0) {
      doc.font('Helvetica-Bold').fontSize(14).text('Sessions:');
      syllabus.session.forEach(session => {
        doc.font('Helvetica-Bold').fontSize(12).text(`- ${session.name}:`);
        doc.font('Helvetica').fontSize(12).text(`  Début: ${session.startDate}`)
          .text(`  Fin: ${session.endDate}`).moveDown(0.5);
      });
    }

    doc.end();
    writeStream.on('finish', () => console.log('PDF généré avec succès.'));
    return filePath;
  }

  public async createOptimalSyllabus(id: number, syllabusData: CreateSyllabusDto) {
    // Calculer la somme des heures de session
    const totalSessionHours = syllabusData.session.reduce((acc: number, session: any) => {
      return acc + session.nbhr;
    }, 0);

    // Vérifier si la somme des heures de session est supérieure au nombre total d'heures du syllabus
    if (totalSessionHours > syllabusData.nbhr) {
      throw new Error("La somme des heures de session dépasse le nombre total d'heures du syllabus.");
    }
    const syllabusLink = uuid();

    const createdSyllabus = await this.prisma.syllabus.create({
      data: {
        teacherId: id,
        link: syllabusLink,
        ...syllabusData,
        session: {
          create: syllabusData.session.map(session => ({
            ...session,
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
              })),
            },
          })),
        },
      },
      include: {
        session: {
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
    return { createdSyllabus, link: `${process.env.FRONT_URI}/${syllabusLink}` };
  }

  public async updateOptimalSyllabus(id: number, syllabusData: Syllabus) {
    // Calculer la somme des heures de session
    const totalSessionHours = syllabusData.session.reduce((acc: number, session: any) => {
      return acc + session.nbhr;
    }, 0);

    // Vérifier si la somme des heures de session est supérieure au nombre total d'heures du syllabus
    if (totalSessionHours > syllabusData.nbhr) {
      throw new Error("La somme des heures de session dépasse le nombre total d'heures du syllabus.");
    }

    // Identifier le syllabus à mettre à jour
    const existingSyllabus = await this.prisma.syllabus.findUnique({
      where: { id: id },
      include: {
        session: {
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

    if (!existingSyllabus) {
      throw new Error("Le syllabus à mettre à jour n'existe pas.");
    }

    // Mettre à jour le syllabus
    const updatedSyllabus = await this.prisma.syllabus.update({
      where: { id: id },
      data: {
        nbhr: syllabusData.nbhr, // Mettre à jour le nombre total d'heures du syllabus
        session: {
          update: syllabusData.session.map(session => ({
            where: { id: session.id }, // Assurez-vous que chaque session a un identifiant unique
            data: {
              ...session,
              quizzes: {
                update: session.quizzes.map(quiz => ({
                  where: { id: quiz.id }, // Assurez-vous que chaque quiz a un identifiant unique
                  data: {
                    questions: {
                      update: quiz.questions.map(question => ({
                        where: { id: question.id }, // Assurez-vous que chaque question a un identifiant unique
                        data: {
                          propositions: {
                            update: question.propositions.map(proposition => ({
                              where: { id: proposition.id }, // Assurez-vous que chaque proposition a un identifiant unique
                              data: {
                                numbQuestion: proposition.numbQuestion, // Mettre à jour le numéro de question
                              },
                            })),
                          },
                          answer: {
                            update: question.answer.map(answer => ({
                              where: { id: answer.id }, // Assurez-vous que chaque réponse a un identifiant unique
                              data: {},
                            })),
                          },
                        },
                      })),
                    },
                  },
                })),
              },
            },
          })),
        },
      },
      include: {
        session: {
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

    return updatedSyllabus;
  }



  public async geAllSyllabusForTeacher(id: number): Promise<Syllabus[]> {
    const syllabus = await this.prisma.syllabus.findMany({
      where: {
        teacherId: id,
      },
      include: {
        session: {
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
    if (!syllabus) {
      throw new HttpException(404, 'Syllabus not found');
    }
    return syllabus;
  }

  public async getSyllabusForTeacher(syllabusId: number, teacherId: number): Promise<Syllabus> {
    console.log(syllabusId);
    const syllabus = await this.prisma.syllabus.findFirst({
      where: {
        id: syllabusId,
        teacherId: teacherId,
      },
      include: {
        session: true,
      },
    });

    if (!syllabus) {
      throw new HttpException(404, 'Syllabus not found');
    }
    return syllabus;
  }

  public async getSyllabusByLink(link: string) {
    const syllabus = await this.prisma.syllabus.findUnique({
      where: { link },
      include: {
        session: {
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

    if (!syllabus) {
      throw new Error('Syllabus not found');
    }

    return syllabus;
  }

  public async updateSyllabusGeneral(syllabusId: number, teacherId: number, syllabus: CreateSyllabusDto): Promise<Syllabus> {
    const existingSyllabus = await this.prisma.syllabus.findFirst({
      where: {
        id: syllabusId,
        teacherId: teacherId,
      },
    });

    if (!existingSyllabus) {
      throw new HttpException(404, 'Syllabus not found for the given teacher');
    }
    const updatedSyllabus = await this.prisma.syllabus.update({
      where: {
        id: syllabusId,
      },
      data: {
        name: syllabus.name,
        nbhr: syllabus.nbhr,
        semestre: syllabus.semestre,
        creditCoef: syllabus.creditCoef,
        year: syllabus.year,
        description_cours: syllabus.description_cours,
        objectif_general: syllabus.objectif_general,
        objectif_specifique: syllabus.objectif_specifique,
        methodeId: syllabus.methodeId,
        supportId: syllabus.supportId,
        modeId: syllabus.modeId,
      },
    });

    return updatedSyllabus;
  }

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
}
