import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import {HttpException} from "@exceptions/HttpException";
import { CreateStatusDto } from '@/dtos/status.dto';
import PrismaService from './prisma.service';

@Service()
export class StatusService {
  private prisma = PrismaService.getInstance();
  public status = this.prisma.statut;
  public role = this.prisma.role;
  async getstatusById(id: number): Promise<Status | null> {
    const status = await this.status.findUnique({
      where: {
        id,
      },
    });

    if (!status) {
      throw new HttpException(404, 'status not found');
    }

    return status;
  }

  async getStatutsByRole(roleId: number): Promise<Status[]> {
    try {

      const statuts = await this.status.findMany({
        where: {
          roleId: roleId
        },
        include: {
          role: true
        }
      });

      return statuts;
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des statuts par rôle :", error);
      throw error;
    }
  }

  public async getAllStatuss(): Promise<Status[]> {
    console.log( this.status.findMany())
    return this.status.findMany();
  }

  public async createStatus(statusData: CreateStatusDto): Promise<Status> {
    try {
      // Recherchez le rôle par son nom ou son ID
      const role = await this.role.findFirst({
        where: {
          id: statusData.roleId // ou name: statusData.roleName
        }
      });

      if (!role) {
        throw new HttpException(404, 'Role not found');
      }

      const existingstatus = await this.status.findFirst({
        where: {
          name: statusData.name,
        },
      });

      if (existingstatus) {
        throw new HttpException(409, 'status already exists');
      }
      // Créez le statut en associant le rôle trouvé
      return this.status.create({
        data: {
          name: statusData.name,
          role: {
            connect: {
              id: role.id
            }
          }
        }
      });
    } catch (error) {
      throw new HttpException(500, 'Error creating status: ' + error.message);
    }
  }

  public async updatestatus(id: number, createStatusDto: CreateStatusDto): Promise<Status | null> {
    const existingstatus = await this.getstatusById(id);

    if (!existingstatus) {
      throw new HttpException(404, 'status not found\'');
    }

    return this.status.update({
      where: {
        id,
      },
      data: {
        name: createStatusDto.name,
        role: {
          connect: {
            id: createStatusDto.roleId,
          },
        },
      },
    });
  }

  async deletestatus(id: number): Promise<Status | null> {
    const existingstatus = await this.getstatusById(id);

    if (!existingstatus) {
      throw new HttpException(404, 'status not found\'');
    }

    return this.status.delete({
      where: {
        id,
      },
    });
  }

}
