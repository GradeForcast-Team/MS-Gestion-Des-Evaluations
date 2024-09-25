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
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import PrismaService from './prisma.service';
@Service()
export class AuthService {
  private prisma = PrismaService.getInstance(); 
  public users = this.prisma.user;
  public teacher = this.prisma.teacher;
  public  address = this.prisma.address;
  public emailServiceInstance = Container.get(EmailService);

  // public async registerTeacher(userData: CreateUserDto, image: any): Promise<{createUserData: User, createTeacherData: Teacher}> {
  //   try {
  //     // Vérifier si l'utilisateur existe déjà
  //     const existingUser = await this.users.findUnique({where: {email: userData.email}});
  //     if (existingUser) {
  //       throw new HttpException(409, `This email ${userData.email} already exists`);
  //     }

  //     // Hacher le mot de passe
  //     const hashedPassword = await hash(userData.password, 10);
  //     const validateAccountTokenExpires = new Date(Date.now() + 3600000);
  //     // Créer l'utilisateur
  //     let createUserData = null;
  //     let createTeacherData =null;
  //     let createAdressData = null;
  //     await this.users.create({
  //       data: {
  //         ... userData,
  //         roleId: 1,
  //         password: hashedPassword,
  //         validate_account_token: uuid(),
  //         validate_account_expires: new Date(Date.now() + 3600000),
  //         photo: image ? image.path : null
  //       },
  //     }).then((createdUser: User) => {
  //       createUserData = createdUser;
  //     });;

  //     // Créer le professeur lié à l'utilisateur
  //     createTeacherData = await this.teacher.create({
  //       data: {
  //         userId: createUserData.id
  //       },
  //     }).then(async  (result) =>{
  //       const link = `www.google.com`;
  //       this.emailServiceInstance.sendMailForConnection(userData)
  //     });

  //     // Envoyer l'e-mail de confirmation


  //     return { createUserData , createTeacherData};
  //   } catch (error) {
  //     logger.info("le error", error)
  //     throw error;
  //   }
  // }

  public async registerTeacher(userData: CreateUserDto, image: any): Promise<{ createUserData: User, createTeacherData: any }> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.users.findUnique({ where: { email: userData.email } });
      if (existingUser) {
        throw new HttpException(409, `This email ${userData.email} already exists`);
      }
  
      // Hacher le mot de passe
      const hashedPassword = await hash(userData.password, 10);
      const validateAccountTokenExpires = new Date(Date.now() + 3600000);
  
      // Créer l'utilisateur
      const createUserData = await this.users.create({
        data: {
          ...userData,
          roleId: 1, // roleId pour l'enseignant
          password: hashedPassword,
          validate_account_token: uuid(),
          validate_account_expires: validateAccountTokenExpires,
          photo: image ? image.path : null,
        },
      });
  
      // Créer le professeur lié à l'utilisateur
      const createTeacherData = await this.teacher.create({
        data: {
          userId: createUserData.id,
          StartDateTeaching: null, // Valeur par défaut ou issue de userData
          pool: null, // Valeur appropriée ici
          est_membre: false, // Valeur par défaut
          typeTeacherId: 1, // Un type par défaut
        },
      });
  
      // Envoyer l'e-mail de confirmation
      await this.emailServiceInstance.sendMailForConnection(userData);
  
      // Retourner l'utilisateur et le professeur séparément
      return { createUserData, createTeacherData };
    } catch (error) {
      logger.info("le error", error);
      throw error;
    }
  }
  
  
  

  public async loginTeacher(userData: any){
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

public async uploadLearnerExcel(file: Express.Multer.File, classeId: number): Promise<{ message: string }> {
  try {
    // Récupérer l'ID de l'école à partir de l'ID de la classe
    const classe = await this.prisma.classe.findUnique({
      where: { id: classeId },
      select: { ecoleId: true }
    });

    if (!classe) {
      throw new Error('Classe non trouvée');
    }

    const idSchool = classe.ecoleId;

    // Extraire les données du fichier
    const data = this.extractDataFromFile(file);

    // Collecter tous les emails pour vérification en lot
    const emails = data.map(row => row.email);
    const existingUsers = await this.prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true }
    });

    const existingEmails = new Set(existingUsers.map(user => user.email));

    // Préparation des opérations en parallèle
    const operations = data.map(async (row) => {
      const { email, name, surname, phone, birthday } = row;

      if (existingEmails.has(email)) return null;

      const tempPassword = uuid().substring(0, 8);
      const hashedPassword = await hash(tempPassword, 10);

      // Validation de la date d'anniversaire
      const parsedBirthday = birthday ? new Date(birthday) : null;
      if (parsedBirthday) parsedBirthday.setUTCHours(0, 0, 0, 0);
      if (parsedBirthday && isNaN(parsedBirthday.getTime())) {
        console.error(`Invalid birthday for email: ${email}`);
        return null; // Ignorer cet enregistrement
      }

      // Création de l'utilisateur et de l'apprenant
      const createUserData = await this.prisma.user.create({
        data: {
          name,
          surname,
          email,
          phone: phone ? phone.toString() : null,
          birthday: parsedBirthday,
          password: hashedPassword,
          roleId: 2,
          validate_account_token: uuid(),
          validate_account_expires: new Date(Date.now() + 3600000), // 1 heure
        },
      });

      const createLearnerData = await this.prisma.learner.create({
        data: {
          userId: createUserData.id,
          classeId,
          id_school: idSchool,
        },
      });

      // Envoi de l'email de bienvenue
      await this.emailServiceInstance.sendWelcomeEmail(createUserData, tempPassword);

      return { createUserData, createLearnerData };
    });

    // Exécuter toutes les opérations en parallèle
    const results = await Promise.all(operations);
    const learners = results.filter(result => result !== null);

    // Supprimer le fichier après traitement
    fs.unlinkSync(file.path);

    return { message: `${learners.length} learners created and notified successfully` };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file');
  }
}

private extractDataFromFile(file: Express.Multer.File): any[] {
  const fileExtension = file.originalname.split('.').pop().toLowerCase();

  if (['xlsx', 'xls', 'csv'].includes(fileExtension)) {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet, fileExtension === 'csv' ? { raw: false, defval: null } : {});
  } else {
    throw new Error('Invalid file format');
  }
}



}
