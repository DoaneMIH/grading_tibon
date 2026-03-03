# 📚 Student Grade Report
### By Doane Ibarra — Academic Year 2025–2026

A full-stack Next.js web app that displays student grades from a live PostgreSQL database, deployed on Vercel.

---

## 🗂️ Project Structure

```
student-grades/
├── app/
│   ├── api/students/route.js   ← API endpoint (GET /api/students)
│   ├── lib/db.js               ← Neon database client
│   ├── globals.css             ← All styles
│   ├── layout.js               ← Root HTML layout
│   ├── page.js                 ← Main page (server component)
│   └── Accordion.js            ← Interactive accordion (client component)
├── scripts/
│   └── setup-db.js             ← One-time DB setup & seed script
├── .env.example                ← Template for your secret env variables
├── .gitignore                  ← Keeps secrets out of GitHub
├── next.config.js
└── package.json
```

---

## ⚙️ Local Setup (Step by Step)

### 1. Install Node.js
Download from https://nodejs.org (LTS version recommended)

### 2. Install dependencies
```bash
npm install
```

### 3. Create your Neon database (free)
1. Go to https://neon.tech and sign up
2. Click **Create Project** → name it `student-grades` → click Create
3. Click **Connect** on your project dashboard
4. Copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 4. Create your .env.local file
In the project root, create a file called `.env.local`:
```
DATABASE_URL=postgresql://your-connection-string-here
```
> ⚠️ Never commit this file. It's already in .gitignore.

### 5. Set up the database (run once)
```bash
npm run db:setup
```
This creates your `students` and `grades` tables and inserts all 5 students.

### 6. Start the dev server
```bash
npm run dev
```
Open http://localhost:3000 — you should see the full app! ✅

---

## 🚀 Deploy to Vercel (Step by Step)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/student-grades.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to https://vercel.com and log in with GitHub
2. Click **Add New → Project**
3. Find your `student-grades` repo and click **Import**
4. Leave all settings as default
5. Before clicking Deploy, scroll to **Environment Variables** and add:
   - **Name:** `DATABASE_URL`
   - **Value:** your Neon connection string
6. Click **Deploy** 🚀

### Step 3 — Seed the production database
After deploying, your production Neon DB is empty. Run the setup script once pointing to your production DB:
```bash
DATABASE_URL="your-neon-connection-string" node scripts/setup-db.js
```

Your site is now live! 🎉

---

## 🔁 How It All Works

```
Browser
  ↓ visits your Vercel URL
Next.js (page.js — server side)
  ↓ reads DATABASE_URL env variable
Neon PostgreSQL Database
  ↓ returns students + grades
Next.js renders the page
  ↓
Accordion.js (client side)
  handles click → expand/collapse animations
```

---

## 🧱 Database Schema

```sql
-- Students table
CREATE TABLE students (
  id           SERIAL PRIMARY KEY,
  name         TEXT   NOT NULL,
  student_code TEXT   UNIQUE NOT NULL
);

-- Grades table
CREATE TABLE grades (
  id         SERIAL  PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    TEXT    NOT NULL,
  icon       TEXT    NOT NULL,
  score      INTEGER NOT NULL
);
```

---

## 📊 Grade Logic

| Average Score | Status    | Color  |
|---------------|-----------|--------|
| 90 and above  | Excellent | 🟢 Green |
| 75 – 89       | Passing   | 🔵 Blue  |
| Below 75      | At Risk   | 🔴 Red   |
