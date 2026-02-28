const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());

const tasks = [
  { id: 1, title: 'Test zadatak', status: 'planirano', priority: 'srednji', list_id: 1 },
  { id: 2, title: 'Drugi zadatak', status: 'u toku', priority: 'visok', list_id: 1 }
];

const fakeAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token nije pronađen.' });
  }
  req.user = { id: 1, role: 'admin' };
  next();
};

app.get('/api/tasks', fakeAuth, (req, res) => {
  res.json(tasks);
});

app.get('/api/tasks/:id', fakeAuth, (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Zadatak nije pronađen.' });
  res.json(task);
});

app.post('/api/tasks', fakeAuth, (req, res) => {
  const { title, list_id } = req.body;
  if (!title || !list_id) {
    return res.status(400).json({ error: 'Naziv i lista su obavezni.' });
  }
  const newTask = { id: 3, title, list_id, status: 'planirano', priority: 'srednji' };
  res.status(201).json({ message: 'Zadatak kreiran.', task: newTask });
});

app.delete('/api/tasks/:id', fakeAuth, (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Zadatak nije pronađen.' });
  res.json({ message: 'Zadatak obrisan.' });
});

describe('Tasks API testovi', () => {

  describe('GET /api/tasks', () => {
    test('Dohvatanje svih zadataka sa tokenom', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    test('Dohvatanje zadataka bez tokena', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('Dohvatanje postojećeg zadatka', async () => {
      const res = await request(app)
        .get('/api/tasks/1')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Test zadatak');
    });

    test('Dohvatanje nepostojećeg zadatka', async () => {
      const res = await request(app)
        .get('/api/tasks/999')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/tasks', () => {
    test('Kreiranje zadatka sa validnim podacima', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer fake-token')
        .send({ title: 'Novi zadatak', list_id: 1 });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.task.title).toBe('Novi zadatak');
    });

    test('Kreiranje zadatka bez naziva', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer fake-token')
        .send({ list_id: 1 });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('Brisanje postojećeg zadatka', async () => {
      const res = await request(app)
        .delete('/api/tasks/1')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(200);
    });

    test('Brisanje nepostojećeg zadatka', async () => {
      const res = await request(app)
        .delete('/api/tasks/999')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toBe(404);
    });
  });
});