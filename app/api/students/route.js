import sql from '../../lib/db';

export async function GET() {
  try {
    // Fetch all students
    const students = await sql`
      SELECT id, name, student_code
      FROM students
      ORDER BY id ASC
    `;

    // For each student, fetch their grades
    const result = await Promise.all(
      students.map(async (student) => {
        const grades = await sql`
          SELECT subject, icon, score
          FROM grades
          WHERE student_id = ${student.id}
          ORDER BY id ASC
        `;
        return {
          ...student,
          grades,
        };
      })
    );

    return Response.json(result);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch students from database.' },
      { status: 500 }
    );
  }
}
