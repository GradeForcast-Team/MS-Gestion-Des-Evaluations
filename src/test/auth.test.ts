import { AuthService } from '../services/auth.service';
import PrismaService from '../services/prisma.service';
import { HttpException } from '@exceptions/HttpException';
import { hash } from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { EmailService } from '@services/email.service';
import { Container } from 'typedi';
import { compare } from 'bcrypt';
import bcrypt from 'bcrypt';

jest.mock('../services/prisma.service');
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
jest.mock('@services/email.service');
jest.mock('bcrypt', () => ({
    compare: jest.fn(), // Moquer explicitement la méthode `compare`
  }));

  describe('AuthService - loginTeacher', () => {
    let authService: AuthService;
    let prismaMock: any;
    let emailServiceMock: any;
  
    beforeEach(() => {
      // Créer un mock pour PrismaService
      prismaMock = {
        user: {
          findUnique: jest.fn(),
        },
      };
  
      // Créer un mock pour EmailService
      emailServiceMock = {
        sendMailForConnection: jest.fn(),
      };
  
      // Injecter le mock d'EmailService avec typedi
      Container.set(EmailService, emailServiceMock);
  
      // Injecter le mock de PrismaService
      jest.spyOn(PrismaService, 'getInstance').mockReturnValue(prismaMock);
  
      // Créer une nouvelle instance de AuthService
      authService = new AuthService();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
      Container.reset(); // Réinitialiser Container après chaque test
    });
  
    it('should return a user and token data on successful login', async () => {
      const userData = { email: 'test@example.com', password: 'password' };
  
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });
  
      // Simuler le succès de la comparaison du mot de passe
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  
      const result = await authService.loginTeacher(userData);
  
      expect(result.findUser).toEqual({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(result.tokenData).toHaveProperty('token');
    });
  });
  