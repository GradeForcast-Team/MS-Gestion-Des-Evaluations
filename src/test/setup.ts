import { App } from '../app'; // Importer votre application
import supertest from 'supertest';

let server: any;
let request: any;

beforeAll(() => {
  const app = new App([]);
  server = app.http.listen(5000, () => {
    console.log('Test server running on port 5000');
  });
  request = supertest(server);
});

afterAll(() => {
  server.close();
});

export { request };
