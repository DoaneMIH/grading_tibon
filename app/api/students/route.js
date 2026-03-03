import sql from '../../lib/db';

// GET /api/students — fetch all students with grades
export async function GET() {
  try {
    const students = await sql`
      SELECT id, name, student_code FROM students ORDER BY id ASC
    `;

    const result = await Promise.all(
      students.map(async (s) => {
        const grades = await sql`
          SELECT id, subject, icon, score
          FROM grades
          WHERE student_id = ${s.id}
          ORDER BY id ASC
        `;
        return { ...s, grades };
      })
    );

    return Response.json(result);
  } catch (err) {
    console.error('GET /api/students error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/students — add a new student with grades
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, student_code, grades } = body;

    if (!name || !student_code || !grades || grades.length === 0) {
      return Response.json({ error: 'name, student_code, and grades are required.' }, { status: 400 });
    }

    // Check duplicate student_code
    const existing = await sql`
      SELECT id FROM students WHERE student_code = ${student_code}
    `;
    if (existing.length > 0) {
      return Response.json({ error: 'Student ID already exists.' }, { status: 409 });
    }

    // Insert student
    const [student] = await sql`
      INSERT INTO students (name, student_code)
      VALUES (${name}, ${student_code})
      RETURNING id, name, student_code
    `;

    // Insert grades
    const insertedGrades = await Promise.all(
      grades.map((g) =>
        sql`
          INSERT INTO grades (student_id, subject, icon, score)
          VALUES (${student.id}, ${g.subject}, ${g.icon}, ${g.score})
          RETURNING id, subject, icon, score
        `.then((rows) => rows[0])
      )
    );

    return Response.json({ ...student, grades: insertedGrades }, { status: 201 });
  } catch (err) {
    console.error('POST /api/students error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
