import { PrismaClient} from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import {Container, Service} from 'typedi';
import { CreateTeacherDto, CreateUserDto } from '@dtos/users.dto';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { v4 as uuid } from 'uuid';
import { HttpException } from "@exceptions/HttpException";
import {Address} from "@interfaces/adresse.interface";
import {CreateAddressDto} from "@dtos/address.dto";
import { logger } from '@/utils/logger';
import * as multer from 'multer';
import Any = jasmine.Any;
import {Teacher} from "@interfaces/teachers.interface";
import {EmailService} from "@services/email.service";
import { UpdateTeacherDto } from '@/dtos/teacher.dto';
const speakeasy = require('speakeasy');

@Service()
export class AuthService {
  public users = new PrismaClient().user;
  public teacher = new PrismaClient().teacher;
  public  address = new PrismaClient().address;
  public prisma = new PrismaClient();
  public emailServiceInstance = Container.get(EmailService);

  public async registerTeacher(userData: CreateUserDto, image: any): Promise<{createUserData: User, createTeacherData: Teacher}> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.users.findUnique({where: {email: userData.email}});
      if (existingUser) {
        throw new HttpException(409, `This email ${userData.email} already exists`);
      }

      // Hacher le mot de passe
      const hashedPassword = await hash(userData.password, 10);
      const validateAccountTokenExpires = new Date(Date.now() + 3600000);
      // Créer l'utilisateur
      let createUserData = null;
      let createTeacherData =null;
      let createAdressData = null;
      await this.users.create({
        data: {
          ... userData,
          roleId: 1,
          password: hashedPassword,
          validate_account_token: uuid(),
          validate_account_expires: new Date(Date.now() + 3600000),
          photo: image ? image.path : null
        },
      }).then((createdUser: User) => {
        createUserData = createdUser;
      });;

      // Créer le professeur lié à l'utilisateur
      createTeacherData = await this.teacher.create({
        data: {
          userId: createUserData.id
        },
      }).then(async  (result) =>{
        const link = `www.google.com`;
        this.emailServiceInstance.sendMailForConnection(userData)
      });

      // Envoyer l'e-mail de confirmation


      return { createUserData , createTeacherData};
    } catch (error) {
      logger.info("le error", error)
      throw error;
    }
  }

  public async loginTeacher(userData: CreateUserDto){
    try {
      // Recherche de l'utilisateur par email avec les données de l'enseignant
      const findUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
        include: { teacher: true }  // Inclure les données de l'enseignant
      });

      // Vérification de l'utilisateur
      if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

      // Vérification du mot de passe
      const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
      if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');

      // Création du token JWT
      const tokenData = this.createToken(findUser);

      return { findUser, tokenData };
    } catch (error) {
      throw error;
    }
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = 'c56288e7b9b2dae9f3f9b02904ee0f8a057ab03cc48d647d1cc38933116f8a8b';
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  public async updateSpecificInfoTeacher(teacherId: number, teacherData: UpdateTeacherDto) {
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherId },
      include: {
        user: {
          include: {
            addresseId: true,
          },
        },
        specialisationTeacher: true,
        teacherSchools: true,
      },
    });

    if (!existingTeacher) {
      throw new Error('Teacher not found');
    }

    const updatedTeacher = await this.prisma.teacher.update({
      where: { userId: teacherId },
      data: {
        user: {
          update: {
            name: teacherData.name,
            surname: teacherData.surname,
            birthday: teacherData.birthday,
            phone: teacherData.phone,
            photo: teacherData.photo,
            sexe: teacherData.sexe,
            description: teacherData.description,
            addresseId: existingTeacher.user.addresseId ? {
              update: {
                country: teacherData.country,
                city: teacherData.city,
                state: teacherData.state,
                postal_code: teacherData.postal_code,
              },
            } : teacherData.country && teacherData.city && teacherData.state && teacherData.postal_code ? {
              create: {
                country: teacherData.country,
                city: teacherData.city,
                state: teacherData.state,
                postal_code: teacherData.postal_code,
              },
            } : undefined,
          },
        },
        StartDateTeaching: teacherData.StartDateTeaching,
        pool: teacherData.pool,
        specialisationTeacher: teacherData.specialisations ? {
          deleteMany: {}, // Supprime toutes les relations existantes
          create: teacherData.specialisations.split(',').map(id => ({
            specialisation: {
              connect: { id: parseInt(id, 10) }
            }
          })),
        } : undefined,
        teacherSchools: teacherData.schools ? {
          deleteMany: {}, // Supprime toutes les relations existantes
          create: teacherData.schools.split(',').map(id => ({
            school: {
              connect: { id: parseInt(id, 10) }
            }
          })),
        } : undefined,
      },
    });

    return updatedTeacher;
}



}
