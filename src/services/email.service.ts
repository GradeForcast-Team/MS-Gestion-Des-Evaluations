import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import { User } from '@/interfaces/users.interface';
const Handlebars = require('handlebars');
dotenv.config();

const sourceReset = fs.readFileSync(`${__dirname}/template-mail/connexion.hbs`, 'utf8');
const templateConnexion = Handlebars.compile(sourceReset);

@Service() // Ajout du décorateur Service
export class EmailService {
  // Correction ici

  private transporter: nodemailer.Transporter;

  constructor() {
    //   this.transporter = nodemailer.createTransport({
    //     host: process.env.LHOG_HOST,
    //     port: process.env.LHOG_PORT,
    //     secure: false,
    //     auth: {
    //       user: process.env.MAIL_SOURCE, // Adresse e-mail de l'expéditeur
    //       pass: process.env.MAIL_KEY // Mot de passe de l'expéditeur
    //     }
    //   });
    // }

    this.transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      host: process.env.LHOG_HOST,
      port: Number(process.env.LHOG_PORT),
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.MAIL_SOURCE,
        pass: process.env.MAIL_KEY,
      },
    });
  }

  public sendMailForConnection(data: any) {
    // Correction ici
    const emailContent = templateConnexion(data);

    // Définition des options de l'e-mail
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.MAIL_SOURCE,
      to: data.email,
      subject: 'Création compte NoteForecast',
      html: emailContent,
    };

    return this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erreur lors de l'envoi de l'e-mail :", error);
      } else {
        console.log('E-mail envoyé :', info.response);
      }
    });
  }

  // Méthode pour envoyer un email de bienvenue
  public async sendWelcomeEmail(user: User, password: string) {
    const mailOptions = {
      from: '"Your App Name" <your-email@example.com>',
      to: user.email,
      subject: 'Welcome to Our Platform',
      text: `Dear ${user.name} ${user.surname},

Welcome to Our Platform. Your account has been created successfully.

Your login details are:
Email: ${user.email}
Password: ${password}

Please login and change your password.

Best regards,
The Team`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${user.email}`);
    } catch (error) {
      console.error(`Error sending email to ${user.email}:`, error);
    }
  }
}
