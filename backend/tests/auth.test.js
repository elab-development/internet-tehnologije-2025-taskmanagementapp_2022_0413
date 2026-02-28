const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Sva polja su obavezna.' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Lozinka mora imati minimum 8 karaktera.' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Email mora biti validan.' });
  }

  return res.status(201).json({
    message: 'Korisnik uspešno registrovan.',
    user: { id: 1, name, email, role: 'user' },
    token: 'fake-jwt-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email i lozinka su obavezni.' });
  }

  if (email === 'test@test.com' && password === 'Test1234') {
    return res.status(200).json({
      message: 'Uspešna prijava.',
      token: 'fake-jwt-token'
    });
  }

  return res.status(401).json({ error: 'Pogrešan email ili lozinka.' });
});

describe('Auth API testovi', () => {
  
  describe('POST /api/auth/register', () => {
    test('Uspešna registracija sa validnim podacima', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Korisnik',
          email: 'test@example.com',
          password: 'Test1234'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    test('Registracija bez obaveznih polja', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('Registracija sa kratkom lozinkom', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: '123'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('Uspešna prijava sa validnim podacima', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Test1234'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('Prijava sa pogrešnom lozinkom', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'pogresna'
        });
      
      expect(res.statusCode).toBe(401);
    });

    test('Prijava bez podataka', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(res.statusCode).toBe(400);
    });
  });
});