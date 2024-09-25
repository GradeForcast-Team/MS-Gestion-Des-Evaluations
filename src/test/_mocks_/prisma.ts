// __mocks__/prisma.ts
const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    teacher: {
      create: jest.fn(),
    },
  };
  
  export const PrismaClient = jest.fn(() => prisma);
  export default prisma;
  