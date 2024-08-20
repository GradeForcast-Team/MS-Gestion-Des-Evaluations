import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { Role } from '@/interfaces/role.interface';
import { CreateRoleDto } from '@dtos/role.dto';
import PrismaService from './prisma.service';

@Service()
export class RolesService {
  private prisma = PrismaService.getInstance();
  public role = this.prisma.role;

  async getRoleById(id: number): Promise<Role | null> {
    const role = await this.role.findUnique({
      where: {
        id,
      },
    });

    if (!role) {
      throw new HttpException(404, 'Role not found');
    }

    return role;
  }
  public async getAllroles(): Promise<Role[] | null> {
    const role = this.role.findMany();
    return role;
  }
  public async createrole(roleData: CreateRoleDto): Promise<Role> {
    const existingrole = await this.role.findFirst({
      where: {
        name: roleData.name,
      },
    });

    if (existingrole) {
      throw new HttpException(409, 'Role already exists');
    }

    return this.role.create({
      data: {
        name: roleData.name,
      },
    });
  }
  public async updaterole(id: number, name: string): Promise<Role | null> {
    const existingrole = await this.getRoleById(id);

    if (!existingrole) {
      throw new HttpException(404, "Role not found'");
    }

    return this.role.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  async deleterole(id: number): Promise<Role | null> {
    const existingrole = await this.getRoleById(id);

    if (!existingrole) {
      throw new HttpException(404, "Role not found'");
    }

    return this.role.delete({
      where: {
        id,
      },
    });
  }
}
