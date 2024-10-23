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
  private syllabusClasse = this.prisma.syllabusClasse;
  private classe = this.prisma.classe;
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
      // Requête pour récupérer les détails du quiz avec les classes assignées
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
                      syllabusClasse: {  // Ajout de la relation avec les classes
                        include: {
                          classe: {
                            include: {
                              ecole: true, // Inclusion de l'école associée
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
  
      // Préparer les classes assignées
      const assignedClasses = quiz.concept.session.syllabus.syllabusClasse.map(sc => ({
        classeId: sc.classe.id,
        classeName: sc.classe.name,
        ecoleId: sc.classe.ecole?.id ?? null,
        ecoleName: sc.classe.ecole?.name ?? null,
      }));
  
      // Retourner les détails du quiz avec les classes assignées
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
        assignedClasses, // Ajout des classes assignées
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
      session: {
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
      syllabusClasse: {  // Inclusion de la relation avec les classes
        select: {
          classe: {
            select: {
              id: true,            // ID de la classe
              name: true,          // Nom de la classe
              ecole: {             // Inclusion de l'école liée
                select: {
                  id: true,        // ID de l'école
                  name: true,      // Nom de l'école
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

  // Extraire les quiz et lier chaque quiz aux classes et écoles associées
  const allQuizzes = syllabusWithQuizzes.flatMap(syllabus =>
    syllabus.session.flatMap(session =>
      session.concept.flatMap(concept =>
        concept.quizzes.map(quiz => ({
          quizId: quiz.id,
          quizName: quiz.name,
          questions: quiz.questions,
          classes: syllabus.syllabusClasse.map(classeRelation => ({
            classeId: classeRelation.classe.id,
            classeName: classeRelation.classe.name,
            ecoleId: classeRelation.classe.ecole?.id ?? null,
            ecoleName: classeRelation.classe.ecole?.name ?? null,
          })),
        }))
      )
    )
  );

  return allQuizzes;
}

public async assignQuizToClassesForSchool(
  conceptId: number,
  quizId: number,
  classIds: number[],
  schoolId: number
): Promise<void> {
  // Vérifier si le concept existe
  const existingConcept = await this.concept.findUnique({
    where: { id: conceptId },
  });

  if (!existingConcept) {
    throw new HttpException(404, `Concept with ID ${conceptId} not found`);
  }

  // Vérifier si le quiz est associé au concept
  const existingQuiz = await this.quizz.findFirst({
    where: { id: quizId, conceptId },
  });

  if (!existingQuiz) {
    throw new HttpException(
      404,
      `Quiz with ID ${quizId} not found for Concept ${conceptId}`
    );
  }

  // Récupérer la session associée au concept
  const session = await this.prisma.session.findUnique({
    where: { id: existingConcept.sessionId },
    include: { syllabus: true },
  });

  if (!session || !session.syllabus) {
    throw new HttpException(
      404,
      'Syllabus not found for the session linked to the concept.'
    );
  }

  // Récupérer les classes sélectionnées pour l'école donnée
  const validClasses = await this.classe.findMany({
    where: {
      id: { in: classIds },
      ecoleId: schoolId, // Vérifier que les classes appartiennent à l'école spécifiée
    },
    include: { ecole: true },
  });

  if (validClasses.length === 0) {
    throw new HttpException(
      404,
      `No valid classes found for School with ID ${schoolId}`
    );
  }

  // Préparer les relations à insérer dans syllabusClasse
  const syllabusClasseData = validClasses.map((classe) => ({
    syllabusId: session.syllabus.id, // Utiliser l'ID du syllabus récupéré
    classeId: classe.id,
    linkSyllabusClasse: `quiz_${quizId}_classe_${classe.id}`, // Générer un lien unique
  }));

  // Créer ou mettre à jour les relations entre le quiz et les classes
  await this.syllabusClasse.createMany({
    data: syllabusClasseData,
    skipDuplicates: true, // Ignorer les doublons
  });

  console.log(
    `Quiz with ID ${quizId} assigned to ${validClasses.length} classes for School with ID ${schoolId}.`
  );
}

public async assignQuizToClasses(
  conceptName: string, // Nom du concept
  quizId: number,
  classIds: number[],
  schoolId: number
): Promise<void> {
  const failedAssignments: { classeId: number; ecoleId: number }[] = [];
  const syllabusClasseData: Array<{
    syllabusId: number;
    classeId: number;
    linkSyllabusClasse: string;
  }> = [];

  // 1. Récupérer les classes valides de l'école donnée
  const validClasses = await this.prisma.classe.findMany({
    where: {
      id: { in: classIds },
      ecoleId: schoolId,
    },
  });

  if (validClasses.length === 0) {
    throw new HttpException(
      404,
      `No valid classes found for School with ID ${schoolId}`
    );
  }

  // 2. Traiter chaque classe individuellement
  for (const classe of validClasses) {
    try {
      // Vérifier si le syllabus associé à la classe contient le concept demandé
      const syllabusClasse = await this.prisma.syllabusClasse.findFirst({
        where: {
          classeId: classe.id,
          syllabus: {
            session: {
              some: {
                concept: {
                  some: { name: conceptName }, // Utilisation du filtre relationnel correct
                },
              },
            },
          },
        },
        include: { syllabus: true },
      });

      if (!syllabusClasse) {
        failedAssignments.push({ classeId: classe.id, ecoleId: schoolId });
        continue; // Passer à la classe suivante
      }

      // Vérifier si le quiz est déjà assigné à cette classe
      const alreadyAssigned = await this.prisma.syllabusClasse.findFirst({
        where: {
          syllabusId: syllabusClasse.syllabusId,
          classeId: classe.id,
          linkSyllabusClasse: `quiz_${quizId}_classe_${classe.id}`,
        },
      });

      if (alreadyAssigned) {
        console.log(
          `Quiz with ID ${quizId} is already assigned to Class ${classe.id}. Skipping.`
        );
        continue;
      }

      // Ajouter l'assignation si elle est valide
      syllabusClasseData.push({
        syllabusId: syllabusClasse.syllabusId,
        classeId: classe.id,
        linkSyllabusClasse: `quiz_${quizId}_classe_${classe.id}`,
      });
    } catch (error) {
      console.error(`Error processing class ${classe.id}:`, error);
      failedAssignments.push({ classeId: classe.id, ecoleId: schoolId });
    }
  }

  // 3. Créer les assignations pour les classes valides
  if (syllabusClasseData.length > 0) {
    await this.prisma.syllabusClasse.createMany({
      data: syllabusClasseData,
      skipDuplicates: true,
    });

    console.log(
      `Quiz with ID ${quizId} assigned to ${syllabusClasseData.length} classes for School with ID ${schoolId}.`
    );
  }

  // 4. Afficher les classes non traitées
  if (failedAssignments.length > 0) {
    console.log(
      `The quiz could not be assigned to the following classes: ${failedAssignments
        .map((c) => `Class ${c.classeId} of School ${c.ecoleId}`)
        .join(', ')}.`
    );
  }
}







public async getClassesAndConceptsForTeacher(teacherId) {
  try {
    const teacherClasses = await this.prisma.teacherClasse.findMany({
      where: { teacherId },
      select: {
        classe: {
          select: {
            id: true,
            name: true,
            syllabusClasse: {
              select: {
                syllabus: {
                  select: {
                    session: {
                      select: {
                        concept: {
                          select: {
                            id: true,
                            name: true,
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

    // Traiter les données pour structurer la réponse
    const classesWithConcepts = teacherClasses.map((teacherClasse) => {
      const classe = teacherClasse.classe;

      // Extraire les concepts de toutes les sessions
      const concepts = classe.syllabusClasse.flatMap((syllabusClasse) =>
        syllabusClasse.syllabus?.session.flatMap((session) =>
          session.concept.map((concept) => ({
            conceptId: concept.id,
            conceptName: concept.name,
          }))
        ) || []
      );

      return {
        classeId: classe.id,
        classeName: classe.name,
        concepts,
      };
    });

    return classesWithConcepts;
  } catch (error) {
    console.error('Erreur lors de la récupération des classes et concepts:', error);
    throw error;
  }
}
  
  
}
