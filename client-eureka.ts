import { Eureka } from 'eureka-js-client';

const client = new Eureka({
  instance: {
    app: 'EVALUATION-SERVICE',
    instanceId: 'evaluation-service-' + Math.floor(Math.random() * 1000),
    hostName: 'localhost',
    ipAddr: '127.0.0.1',
    port: {
      '$': process.env.PORT ? parseInt(process.env.PORT) : 5000,
      '@enabled': true,
    },
    vipAddress: 'EVALUATION-SERVICE',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
    healthCheckUrl: `http://localhost:${process.env.PORT || 3002}/actuator/health`, // URL de vérification de santé
    statusPageUrl: `http://localhost:${process.env.PORT || 3002}/actuator/info`, // URL de la page d'info du service
    homePageUrl: `http://localhost:${process.env.PORT || 3002}/`, // URL de la page d'accueil du service
  },
  eureka: {
    host: process.env.EUREKA_HOST || 'localhost',
    port: process.env.EUREKA_PORT ? parseInt(process.env.EUREKA_PORT) : 8761,
    servicePath: '/eureka/apps/',
    maxRetries: 10,
    requestRetryDelay: 5000,
  },
});

export default client;
