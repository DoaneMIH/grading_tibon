// scripts/setup-db.js
// Run once with: npm run db:setup
// This creates your tables and inserts all student data into Neon.

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const students = [
  { name: 'Sophia Reyes',  code: 'STU-001' },
  { name: 'Liam Nakamura', code: 'STU-002' },
  { name: 'Amara Okonkwo', code: 'STU-003' },
  { name: 'Ethan Varga',   code: 'STU-004' },
  { name: 'Isla Brennan',  code: 'STU-005' },
];

const subjects = [
  { subject: 'Mathematics', icon: '📐' },
  { subject: 'English',     icon: '📖' },
  { subject: 'Science',     icon: '🔬' },
  { subject: 'History',     icon: '🏛️' },
  { subject: 'Programming', icon: '💻' },
];

const scores = [
  [94, 88, 91, 85, 97], // Sophia
  [72, 68, 74, 70, 65], // Liam
  [89, 93, 87, 90, 84], // Amara
  [60, 58, 63, 71, 55], // Ethan
  [96, 98, 92, 95, 99], // Isla
];

async function setup() {
  console.log('🔧 Setting up database...\n');

  // 1. Drop existing tables (to ensure clean schema)
  await sql`DROP TABLE IF EXISTS grades CASCADE`;
  await sql`DROP TABLE IF EXISTS students CASCADE`;

  // 2. Create students table
  await sql`
    CREATE TABLE students (
      id           SERIAL PRIMARY KEY,
      name         TEXT    NOT NULL,
      student_code TEXT    UNIQUE NOT NULL
    )
  `;
  console.log('✅ Table "students" ready');

  // 3. Create grades table
  await sql`
    CREATE TABLE grades (
      id         SERIAL  PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject    TEXT    NOT NULL,
      icon       TEXT    NOT NULL,
      score      INTEGER NOT NULL
    )
  `;
  console.log('✅ Table "grades" ready');

  // 3. Seed students and grades
  for (let i = 0; i < students.length; i++) {
    const { name, code } = students[i];

    // Insert student (skip if already exists)
    const rows = await sql`
      INSERT INTO students (name, student_code)
      VALUES (${name}, ${code})
      ON CONFLICT (student_code) DO NOTHING
      RETURNING id
    `;

    if (rows.length === 0) {
      console.log(`⏭️  Skipped "${name}" (already exists)`);
      continue;
    }

    const studentId = rows[0].id;

    // Insert grades for this student
    for (let j = 0; j < subjects.length; j++) {
      const { subject, icon } = subjects[j];
      const score = scores[i][j];

      await sql`
        INSERT INTO grades (student_id, subject, icon, score)
        VALUES (${studentId}, ${subject}, ${icon}, ${score})
      `;
    }

    console.log(`✅ Inserted "${name}" with ${subjects.length} grades`);
  }

  console.log('\n🎉 Database setup complete! You can now run: npm run dev');
  process.exit(0);
}

setup().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
