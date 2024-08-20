import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from "@exceptions/HttpException";
import { CreateNiveauDto } from '@/dtos/niveau.dto';
import { Niveau } from '@/interfaces/niveau.interface'; // Assurez-vous de bien définir ce chemin
import PrismaService from './prisma.service';

@Service()
export class NiveauService {
  private prisma = PrismaService.getInstance();
  public niveau = this.prisma.niveau;
  public typeSchool = this.prisma.typeSchools;

  async getNiveauById(id: number): Promise<Niveau | null> {
    const niveau = await this.niveau.findUnique({
      where: {
        id,
      },
    });

    if (!niveau) {
      throw new HttpException(404, 'Niveau not found');
    }

    return niveau;
  }

  async getNiveauxByTypeSchool(typeSchoolId: number): Promise<Niveau[]> {
    try {
      const niveaux = await this.niveau.findMany({
        where: {
          typeSchoolId: typeSchoolId
        },
        include: {
          typeSchool: true
        }
      });

      return niveaux;
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des niveaux par type d'école :", error);
      throw error;
    }
  }

  public async getAllNiveaux(): Promise<Niveau[]> {
    return this.niveau.findMany();
  }

  public async createNiveau(niveauData: CreateNiveauDto): Promise<Niveau> {
    try {
      const typeSchool = await this.typeSchool.findFirst({
        where: {
          id: niveauData.typeSchoolId
        }
      });

      if (!typeSchool) {
        throw new HttpException(404, 'TypeSchool not found');
      }

      const existingNiveau = await this.niveau.findFirst({
        where: {
          name: niveauData.name,
        },
      });

      if (existingNiveau) {
        throw new HttpException(409, 'Niveau already exists');
      }

      return this.niveau.create({
        data: {
          name: niveauData.name,
          typeSchool: {
            connect: {
              id: typeSchool.id
            }
          }
        }
      });
    } catch (error) {
      throw new HttpException(500, 'Error creating niveau: ' + error.message);
    }
  }

  public async updateNiveau(id: number, createNiveauDto: CreateNiveauDto): Promise<Niveau | null> {
    const existingNiveau = await this.getNiveauById(id);

    if (!existingNiveau) {
      throw new HttpException(404, 'Niveau not found');
    }

    return this.niveau.update({
      where: {
        id,
      },
      data: {
        name: createNiveauDto.name,
        typeSchool: {
          connect: {
            id: createNiveauDto.typeSchoolId,
          },
        },
      },
    });
  }

  async deleteNiveau(id: number): Promise<Niveau | null> {
    const existingNiveau = await this.getNiveauById(id);

    if (!existingNiveau) {
      throw new HttpException(404, 'Niveau not found');
    }

    return this.niveau.delete({
      where: {
        id,
      },
    });
  }
}
