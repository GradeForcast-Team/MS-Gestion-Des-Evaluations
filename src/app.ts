import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import {AuthController} from "@controllers/auth.controller";
import dotenv from 'dotenv';
import * as process from "process";
dotenv.config();
export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public auth = new AuthController();
  public http: any;
  public io: any;
  // public passport = require('passport');
  constructor(routes: Routes[]) {
    this.app = express();
    this.env = process.env.NODE_ENV;
    this.port = process.env.PORT;
    this.http = require('http').createServer(this.app);
    this.io = require('socket.io')(this.http, {
      cors: {
        origin: '*',
      },
    });

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.initializeUploadsFolder();
  }

  private initializeUploadsFolder() {
    this.app.use(express.static('src/public'));
  }

  public listen() {
    this.http.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  public getSocketInstance() {
    return this.io;
  }


  private initializeMiddlewares() {
    this.app.use(morgan('dev', { stream }));
    this.app.use(cors({ origin: '*', credentials: true }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/api', route.router);
    });
  }

  // private initializeSwagger() {
  //   const options = {
  //     swaggerDefinition: {
  //       info: {
  //         title: 'REST API',
  //         version: '1.0.0',
  //         description: 'Example docs',
  //       },
  //     },
  //     apis: ['swagger.yaml'],
  //   };
  //
  //   const specs = swaggerJSDoc(options);
  //   this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  // }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}

