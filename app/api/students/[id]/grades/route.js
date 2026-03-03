import sql from '../../../../lib/db';

// PUT /api/students/[id]/grades — update all grades for a student
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { grades } = body;

    if (!grades || !Array.isArray(grades)) {
      return Response.json({ error: 'grades array is required.' }, { status: 400 });
    }

    // Validate all scores
    for (const g of grades) {
      if (typeof g.score !== 'number' || g.score < 0 || g.score > 100) {
        return Response.json({ error: `Invalid score for ${g.subject}: must be 0–100.` }, { status: 400 });
      }
    }

    // Update each grade by its id
    const updated = await Promise.all(
      grades.map((g) =>
        sql`
          UPDATE grades
          SET score = ${g.score}
          WHERE id = ${g.id} AND student_id = ${id}
          RETURNING id, subject, icon, score
        `.then((rows) => rows[0])
      )
    );

    return Response.json({ success: true, grades: updated });
  } catch (err) {
    console.error('PUT /api/students/[id]/grades error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
