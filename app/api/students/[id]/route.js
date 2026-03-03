import sql from '../../../lib/db';

// DELETE /api/students/[id] — remove a student and their grades
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const deleted = await sql`
      DELETE FROM students WHERE id = ${id} RETURNING id, name
    `;

    if (deleted.length === 0) {
      return Response.json({ error: 'Student not found.' }, { status: 404 });
    }

    return Response.json({ success: true, deleted: deleted[0] });
  } catch (err) {
    console.error('DELETE /api/students/[id] error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
