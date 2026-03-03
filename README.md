# 📚 Student Grade Report
### By Doane Ibarra — Academic Year 2025–2026

Full-stack Next.js app with Neon PostgreSQL database. Add students, edit grades, and remove students — all changes are saved to the real database.

---

## 🗂️ Project Structure

```
student-grades/
├── app/
│   ├── api/
│   │   └── students/
│   │       ├── route.js              ← GET all students, POST new student
│   │       └── [id]/
│   │           ├── route.js          ← DELETE student
│   │           └── grades/route.js   ← PUT update grades
│   ├── lib/db.js                     ← Neon database client
│   ├── globals.css                   ← All styles
│   ├── layout.js                     ← Root HTML layout
│   ├── page.js                       ← Server component (nav + header)
│   └── GradeApp.js                   ← Client component (full interactive app)
├── scripts/
│   └── setup-db.js                   ← One-time DB setup & seed
├── .env.example
├── .gitignore
├── next.config.js
└── package.json
```

---

## ⚙️ Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your Neon connection string
cp .env.example .env.local
# Edit .env.local and paste your DATABASE_URL

# 3. Create tables and seed data (run once)
npm run db:setup

# 4. Start dev server
npm run dev
```

Open http://localhost:3000 ✅

---

## 🚀 Deploy to Vercel

```bash
# Push to GitHub first
git init && git add . && git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/student-grades.git
git push -u origin main
```

1. Go to vercel.com → **Add New Project** → import repo
2. Add environment variable: `DATABASE_URL` = your Neon connection string
3. Click **Deploy**
4. Seed production DB: `DATABASE_URL="..." node scripts/setup-db.js`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/students | Get all students with grades |
| POST   | /api/students | Add a new student |
| DELETE | /api/students/:id | Remove a student |
| PUT    | /api/students/:id/grades | Update grades for a student |

---

## 🧱 Database Schema

```sql
CREATE TABLE students (
  id           SERIAL PRIMARY KEY,
  name         TEXT   NOT NULL,
  student_code TEXT   UNIQUE NOT NULL
);

CREATE TABLE grades (
  id         SERIAL  PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    TEXT    NOT NULL,
  icon       TEXT    NOT NULL DEFAULT '',
  score      INTEGER NOT NULL CHECK (score >= 0 AND score <= 100)
);
```

---

## 📊 Grade Logic

| Average | Status    | Color  |
|---------|-----------|--------|
| ≥ 90    | Excellent | 🟢 Green |
| 75–89   | Passing   | 🔵 Blue  |
| < 75    | At Risk   | 🔴 Red   |
