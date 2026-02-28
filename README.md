# TaskFlow — Aplikacija za upravljanje zadacima
---
## O aplikaciji

TaskFlow je full-stack web aplikacija za upravljanje projektima i zadacima. Omogućava timovima da organizuju rad kroz projekte, Kanban table i zadatke, uz podršku za komentare, vizualizaciju podataka i kontrolu pristupa na osnovu korisničkih uloga.

### Funkcionalnosti

- Registracija i prijava korisnika
- Kreiranje i upravljanje projektima
- Kanban tabla sa drag-and-drop podrškom
- Dodavanje članova na projekte
- Komentarisanje zadataka
- Tri nivoa korisničkih prava (Admin, Project manager, User)

---

## Autori

Stefan Zeković 
Aleksandar Kovačević 
Sara Da Rold 

---

## Tehnologije

**Frontend:** React.js, Tailwind CSS, Chart.js, react-beautiful-dnd, React Router, Axios  
**Backend:** Node.js, Express.js, Sequelize ORM, MySQL  
**Autentifikacija:** JWT (JSON Web Token), bcrypt  
**Bezbednost:** Helmet.js, xss-clean, hpp, express-rate-limit, CORS  
**API dokumentacija:** Swagger / OpenAPI 3.0  
**Infrastruktura:** Docker, Docker Compose, GitHub Actions

---

## Pokretanje aplikacije

### Preduslovi
Potrebno je imati instalirano:
- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/)

### Pokretanje sa Dockerom (preporučeno)

**Korak 1** — Kloniraj repozitorijum:
```bash
git clone https://github.com/tvoj-username/task-management-app.git
cd task-management-app
```

**Korak 2** — Pokreni aplikaciju:
```bash
docker compose up --build
```

**Korak 3** — Aplikacija je dostupna na sledećim adresama:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Swagger dokumentacija: http://localhost:5000/api/docs

---

### Pokretanje bez Dockera

#### Backend
```bash
cd backend
npm install
npm run migrate
npm run seed
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Environment varijable

Kreirati `.env` fajl unutar `backend/` direktorijuma sa sledećim varijablama:

```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=task_management

JWT_SECRET=vas_tajni_kljuc

FRONTEND_URL=http://localhost:3000
```

Kada se aplikacija pokreće kroz Docker, `DB_HOST` treba postaviti na `db` (naziv servisa u docker-compose.yml).

---

## Test nalozi

Za testiranje aplikacije možete koristiti sledeće naloge:

| Email | Lozinka | Uloga |
|---|---|---|
| admin@taskapp.com | Admin123 | Administrator |
| manager@taskapp.com | Manager123 | Project Manager |
| user@taskapp.com | User12345 | Korisnik |

---

## Struktura projekta
```
task-management-app/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── Dockerfile
└── docker-compose.yml
```

---

## API Dokumentacija

Kompletna API dokumentacija generisana je pomoću Swagger alata i dostupna je na:
```
http://localhost:5000/api/docs
```

---

## Bezbednost

Aplikacija je zaštićena od XSS napada kroz Helmet.js security headere i xss-clean middleware. 
SQL injection je sprečen korišćenjem Sequelize ORM-a sa parametrizovanim upitima. 
CORS je konfigurisan tako da dozvoljava zahteve isključivo sa frontend origine definisane u environment varijablama. 
Brute force napadi na auth endpointe ograničeni su na 10 zahteva na 15 minuta pomoću express-rate-limit. 
IDOR je sprečen proverama vlasništva nad resursom u svakom kontroleru pre nego što se podatak vrati ili izmeni. 
Lozinke su heširane bcrypt algoritmom, a JWT tokeni ističu nakon 7 dana.

---

## CI/CD

GitHub Actions pipeline definisan u `.github/workflows/ci.yml` pokreće se na svaki push i pull request ka `main` i `develop` granama. 
Pokreće backend test suite uz stvarnu MySQL instancu, zatim frontend testove, a u slučaju uspeha gradi Docker image-ove i objavljuje ih na Docker Hub. 
U podešavanjima repozitorijuma potrebno je definisati dva secreta: `DOCKER_USERNAME` i `DOCKER_PASSWORD`.
