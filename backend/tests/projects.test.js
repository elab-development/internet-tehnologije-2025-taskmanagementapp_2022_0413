const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());

const projects = [
  { id: 1, name: 'Test projekat', status: 'aktivan', created_by: 1 },
  { id: 2, name: 'Drugi projekat', status: 'arhiviran', created_by: 1 }
];

const fakeAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token nije pronađen.' });
  }
  req.user = { id: 1, role: 'admin' };
  next();
};

app.get('/api/projects', fakeAuth, (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', fakeAuth, (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Projekat nije pronađen.' });
  res.json(project);
});

app.post('/api/projects', fakeAuth, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Naziv projekta je obavezan.' });
  }
  const newProject = { id: 3, name, status: 'aktivan', created_by: 1 };
  res.status(201).json({ message: 'Projekat uspešno kreiran.', project: newProject });
});

app.put('/api/projects/:id', fakeAuth, (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Projekat nije pronađen.' });
  res.json({ message: 'Projekat ažuriran.', project: { ...project, ...req.body } });
});

app.delete('/api/projects/:id', fakeAuth, (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Projekat nije pronađen.' });
  res.json({ message: 'Projekat obrisan.' });
});

describe('Projects API testovi', () => {

  describe('GET /api/projects', () => {
    test('Dohvatanje svih projekata sa tokenom', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('Dohvatanje projekata bez tokena', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    test('Dohvatanje postojećeg projekta', async () => {
      const res = await request(app)
        .get('/api/projects/1')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Test projekat');
    });

    test('Dohvatanje nepostojećeg projekta', async () => {
      const res = await request(app)
        .get('/api/projects/999')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/projects', () => {
    test('Kreiranje projekta sa validnim podacima', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer fake-token')
        .send({ name: 'Novi projekat' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.project.name).toBe('Novi projekat');
    });

    test('Kreiranje projekta bez naziva', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer fake-token')
        .send({});
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/projects/:id', () => {
    test('Ažuriranje postojećeg projekta', async () => {
      const res = await request(app)
        .put('/api/projects/1')
        .set('Authorization', 'Bearer fake-token')
        .send({ name: 'Izmenjeni projekat' });
      
      expect(res.statusCode).toBe(200);
    });

    test('Ažuriranje nepostojećeg projekta', async () => {
      const res = await request(app)
        .put('/api/projects/999')
        .set('Authorization', 'Bearer fake-token')
        .send({ name: 'Test' });
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    test('Brisanje postojećeg projekta', async () => {
      const res = await request(app)
        .delete('/api/projects/1')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(200);
    });

    test('Brisanje nepostojećeg projekta', async () => {
      const res = await request(app)
        .delete('/api/projects/999')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(404);
    });
  });
});