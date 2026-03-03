// scripts/setup-db.js
// Run once: npm run db:setup
// Creates tables and seeds 5 students with 5 grades each into Neon.

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const STUDENTS = [
  { name: 'Sophia Reyes',  code: 'STU-001' },
  { name: 'Liam Nakamura', code: 'STU-002' },
  { name: 'Amara Okonkwo', code: 'STU-003' },
  { name: 'Ethan Varga',   code: 'STU-004' },
  { name: 'Isla Brennan',  code: 'STU-005' },
];

const SUBJECTS = [
  { subject: 'Mathematics', icon: '📐' },
  { subject: 'English',     icon: '📖' },
  { subject: 'Science',     icon: '🔬' },
  { subject: 'History',     icon: '🏛️' },
  { subject: 'Programming', icon: '💻' },
];

const SCORES = [
  [94, 88, 91, 85, 97], // Sophia
  [72, 68, 74, 70, 65], // Liam
  [89, 93, 87, 90, 84], // Amara
  [60, 58, 63, 71, 55], // Ethan
  [96, 98, 92, 95, 99], // Isla
];

async function setup() {
  console.log('🔧 Setting up Neon database...\n');

  // Create students table
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id           SERIAL PRIMARY KEY,
      name         TEXT   NOT NULL,
      student_code TEXT   UNIQUE NOT NULL
    )
  `;
  console.log('✅ Table "students" ready');

  // Create grades table
  await sql`
    CREATE TABLE IF NOT EXISTS grades (
      id         SERIAL  PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject    TEXT    NOT NULL,
      icon       TEXT    NOT NULL DEFAULT '',
      score      INTEGER NOT NULL CHECK (score >= 0 AND score <= 100)
    )
  `;
  console.log('✅ Table "grades" ready\n');

  // Seed data
  for (let i = 0; i < STUDENTS.length; i++) {
    const { name, code } = STUDENTS[i];

    const rows = await sql`
      INSERT INTO students (name, student_code)
      VALUES (${name}, ${code})
      ON CONFLICT (student_code) DO NOTHING
      RETURNING id
    `;

    if (rows.length === 0) {
      console.log(`⏭️  Skipped "${name}" — already exists`);
      continue;
    }

    const studentId = rows[0].id;

    for (let j = 0; j < SUBJECTS.length; j++) {
      await sql`
        INSERT INTO grades (student_id, subject, icon, score)
        VALUES (${studentId}, ${SUBJECTS[j].subject}, ${SUBJECTS[j].icon}, ${SCORES[i][j]})
      `;
    }

    console.log(`✅ Added "${name}" (${code}) with ${SUBJECTS.length} grades`);
  }

  console.log('\n🎉 Done! Run: npm run dev');
  process.exit(0);
}

setup().catch(err => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
