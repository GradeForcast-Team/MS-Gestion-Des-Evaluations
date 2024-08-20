import { PrismaClient } from '@prisma/client';

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {} // Rendre le constructeur privé pour empêcher l'instanciation directe

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient();
    }
    return PrismaService.instance;
  }
}

export default PrismaService;
