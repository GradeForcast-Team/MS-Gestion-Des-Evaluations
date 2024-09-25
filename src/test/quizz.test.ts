import { QuizzService } from '../services/quizz.service';
import PrismaService from '../services/prisma.service';
import { HttpException } from '@exceptions/HttpException';

jest.mock('../services/prisma.service');

describe('QuizzService - createQuiz', () => {
  let quizzService: QuizzService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      quiz: {
        create: jest.fn(),
      },
      concept: {
        findFirst: jest.fn(),
      },
    };

    jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);
    quizzService = new QuizzService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the concept does not exist', async () => {
    prismaMock.concept.findFirst.mockResolvedValue(null);

    const quizData = {
      name: 'Sample Quiz',
      questions: [],
    };

    await expect(quizzService.createQuiz(1, quizData)).rejects.toThrow(
      new HttpException(409, 'Concept not exists')
    );
    expect(prismaMock.concept.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should create a quiz successfully when concept exists', async () => {
    prismaMock.concept.findFirst.mockResolvedValue({ id: 1, name: 'Sample Concept' });
  
    const quizData = {
      name: 'Sample Quiz',
      questions: [
        {
          libelle: 'What is Jest?',
          propositions: [
            { valeur: 'A testing framework', numbQuestion: 1 },  // Include numbQuestion
            { valeur: 'A library', numbQuestion: 2 },            // Include numbQuestion
          ],
          answer: [{ valeur: 2 }],
        },
      ],
    };
  
    prismaMock.quiz.create.mockResolvedValue({
      id: 1,
      ...quizData,
      conceptId: 1,
    });
  
    const result = await quizzService.createQuiz(1, quizData);
  
    expect(result).toEqual({
      id: 1,
      ...quizData,
      conceptId: 1,
    });
    expect(prismaMock.quiz.create).toHaveBeenCalledWith({
      data: expect.any(Object),
      include: {
        questions: {
          include: {
            propositions: true,
            answer: true,
          },
        },
      },
    });
  });
  
  
});

describe('QuizzService - getQuizzById', () => {
    let quizzService: QuizzService;
    let prismaMock: any;
  
    beforeEach(() => {
      prismaMock = {
        quiz: {
          findFirst: jest.fn(),
        },
        concept: {
          findFirst: jest.fn(),
        },
      };
  
      jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);
      quizzService = new QuizzService();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should throw an error if the concept does not exist', async () => {
      prismaMock.concept.findFirst.mockResolvedValue(null);
  
      await expect(quizzService.getQuizzById(1, 1)).rejects.toThrow(
        new HttpException(409, 'Concept not exists')
      );
      expect(prismaMock.concept.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  
    it('should throw an error if the quiz is not found', async () => {
      prismaMock.concept.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.quiz.findFirst.mockResolvedValue(null);
  
      await expect(quizzService.getQuizzById(1, 1)).rejects.toThrow(
        new HttpException(404, 'Quizz not found')
      );
      expect(prismaMock.quiz.findFirst).toHaveBeenCalledWith({
        where: { id: 1, conceptId: 1 },
        include: expect.any(Object),
      });
    });
  
    it('should return a quiz successfully', async () => {
      prismaMock.concept.findFirst.mockResolvedValue({ id: 1 });
      const quiz = {
        id: 1,
        name: 'Sample Quiz',
        conceptId: 1,
        questions: [],
      };
      prismaMock.quiz.findFirst.mockResolvedValue(quiz);
  
      const result = await quizzService.getQuizzById(1, 1);
  
      expect(result).toEqual(quiz);
      expect(prismaMock.quiz.findFirst).toHaveBeenCalledWith({
        where: { id: 1, conceptId: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('QuizzService - updateQuiz', () => {
    let quizzService: QuizzService;
    let prismaMock: any;
  
    beforeEach(() => {
      prismaMock = {
        quiz: {
          findFirst: jest.fn(),
          update: jest.fn(),
        },
        concept: {
          findFirst: jest.fn(),
        },
      };
  
      jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);
      quizzService = new QuizzService();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should throw an error if the concept does not exist', async () => {
        // Simuler que le concept n'existe pas
        prismaMock.concept.findFirst.mockResolvedValue(null);
      
        // Créer des données de quiz valides pour respecter le type CreateQuizDto
        const validQuizData = {
          name: 'Sample Quiz', // Propriété obligatoire
          questions: [
            {
              libelle: 'Sample Question', // Propriété obligatoire
              propositions: [
                { valeur: 'Option 1', numbQuestion: 1 },
                { valeur: 'Option 2', numbQuestion: 2 },
              ],
              answer: [{ valeur: 2 }],
            },
          ],
        };
      
        // Attendre l'exception "Concept not exists"
        await expect(quizzService.updateQuiz(1, 1, validQuizData)).rejects.toThrow(
          new HttpException(409, 'Concept not exists')
        );
      });
      
  
    it('should throw an error if the quiz does not exist', async () => {
        prismaMock.concept.findFirst.mockResolvedValue({ id: 1 }); // Simuler que le concept existe
        prismaMock.quiz.findFirst.mockResolvedValue(null); // Simuler que le quiz n'existe pas
      
        const validQuizData = {
          name: 'Updated Quiz', // Propriété obligatoire 'name'
          questions: [
            {
              libelle: 'What is Jest?',
              propositions: [
                { valeur: 'A testing framework', numbQuestion: 1 },
                { valeur: 'A library', numbQuestion: 2 },
              ],
              answer: [{ valeur: 1 }],
            },
          ],
        };
      
        await expect(quizzService.updateQuiz(1, 1, validQuizData)).rejects.toThrow(
          new HttpException(409, 'Quiz not exists')
        );
        expect(prismaMock.quiz.findFirst).toHaveBeenCalledWith({ where: { id: 1, conceptId: 1 } });
      });
      
  
    it('should update a quiz successfully', async () => {
      prismaMock.concept.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.quiz.findFirst.mockResolvedValue({ id: 1, name: 'Old Quiz' });
  
      const updatedQuizData = {
        name: 'Updated Quiz',
        questions: [],
      };
  
      prismaMock.quiz.update.mockResolvedValue({
        id: 1,
        ...updatedQuizData,
      });
  
      const result = await quizzService.updateQuiz(1, 1, updatedQuizData);
  
      expect(result).toEqual({
        id: 1,
        ...updatedQuizData,
      });
      expect(prismaMock.quiz.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.any(Object),
        include: expect.any(Object),
      });
    });
  });
  describe('QuizzService - deleteQuizz', () => {
    let quizzService: QuizzService;
    let prismaMock: any;
  
    beforeEach(() => {
      prismaMock = {
        quiz: {
          findFirst: jest.fn(),
          delete: jest.fn(),
        },
      };
  
      jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);
      quizzService = new QuizzService();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should throw an error if the quiz does not exist', async () => {
      prismaMock.quiz.findFirst.mockResolvedValue(null);
  
      await expect(quizzService.deleteQuizz(1)).rejects.toThrow(
        new HttpException(409, 'Quizz not exists')
      );
    });
  
    it('should delete a quiz successfully', async () => {
      prismaMock.quiz.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.quiz.delete.mockResolvedValue({ id: 1 });
  
      const result = await quizzService.deleteQuizz(1);
  
      expect(result).toEqual({ id: 1 });
      expect(prismaMock.quiz.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
    
