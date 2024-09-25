import { request } from './setup'; // Importer l'instance SuperTest configurée

describe('Auth End-to-End Tests', () => {
  it('should register a new user', async () => {
    const res = await request.post('/api/auth/registerTeacher').send({
      name: 'TAGNE',
      surname: 'Elohim',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    // Simuler la création d'un utilisateur pour le test de login
    const registerRes = await request.post('/api/auth/registerTeacher').send({
      name:"tagne",
      surname:"elohim",
      email: 'test@example.com',
      password: 'Password123!',
    });

    const loginRes = await request.post('/api/auth/loginTeacher').send({
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });
});
