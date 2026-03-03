import './globals.css';
import Accordion from './Accordion';

// This runs on the server — safely reads your database
async function getStudents() {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    const students = await sql`SELECT id, name, student_code FROM students ORDER BY id ASC`;

    const result = await Promise.all(
      students.map(async (student) => {
        const grades = await sql`
          SELECT subject, icon, score FROM grades
          WHERE student_id = ${student.id}
          ORDER BY id ASC
        `;
        return { ...student, grades };
      })
    );

    return { data: result, error: null };
  } catch (err) {
    console.error('DB Error:', err.message);
    return { data: null, error: err.message };
  }
}

export default async function Home() {
  const { data: students, error } = await getStudents();

  return (
    <>
      {/* ── Navigation ── */}
      <nav>
        <div className="nav-left">
          <div className="nav-avatar">DI</div>
          <div>
            <div className="nav-name">Doane Ibarra</div>
            <div className="nav-sub">Student · Academic Year 2025–2026</div>
          </div>
        </div>
        <div className="nav-right">
          <span className="nav-badge">Grade Report</span>
        </div>
      </nav>

      {/* ── Header ── */}
      <header>
        <div className="badge">Academic Year 2025–2026</div>
        <h1>Student Grade Report</h1>
        <p>Click on a student card to view subject grades</p>
      </header>

      {/* ── Error state ── */}
      {error && (
        <div className="state-box">
          <div className="icon">⚠️</div>
          <h2>Database not connected</h2>
          <p>
            Could not connect to the database. Make sure you have set up your{' '}
            <strong>.env.local</strong> file with a valid Neon connection string,
            then run the setup script.
          </p>
          <code>npm run db:setup</code>
        </div>
      )}

      {/* ── Empty state ── */}
      {!error && students?.length === 0 && (
        <div className="state-box">
          <div className="icon">📭</div>
          <h2>No students found</h2>
          <p>Your database is connected but has no data yet. Run the setup script to seed it.</p>
          <code>npm run db:setup</code>
        </div>
      )}

      {/* ── Accordion ── */}
      {!error && students?.length > 0 && <Accordion students={students} />}
    </>
  );
}
