'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ── constants ── */
const SUBJECTS = [
  { subject: 'Mathematics', icon: '📐' },
  { subject: 'English',     icon: '📖' },
  { subject: 'Science',     icon: '🔬' },
  { subject: 'History',     icon: '🏛️' },
  { subject: 'Programming', icon: '💻' },
];

/* ── helpers ── */
function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function calcAvg(grades) {
  return grades.reduce((s, g) => s + Number(g.score), 0) / grades.length;
}
function statusInfo(avg) {
  if (avg >= 90) return { cls: 'excellent', label: 'Excellent' };
  if (avg >= 75) return { cls: 'good',      label: 'Passing'   };
  return              { cls: 'risk',       label: 'At Risk'   };
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
function useToast() {
  const [toast, setToast] = useState({ msg: '', type: 'ok', visible: false });
  const timer = useRef(null);

  function show(msg, type = 'ok') {
    clearTimeout(timer.current);
    setToast({ msg, type, visible: true });
    timer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }

  return { toast, show };
}

/* ════════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */
export default function GradeApp() {
  const [students, setStudents]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [dbError,  setDbError]    = useState(null);
  const [openIdx,  setOpenIdx]    = useState(null);

  // modal states
  const [addOpen,  setAddOpen]    = useState(false);
  const [editOpen, setEditOpen]   = useState(false);
  const [delOpen,  setDelOpen]    = useState(false);
  const [activeStudent, setActiveStudent] = useState(null); // used by edit & delete

  const { toast, show: showToast } = useToast();

  /* ── fetch all students ── */
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load students.');
      setStudents(data);
      setDbError(null);
    } catch (err) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  /* ── stats ── */
  const avgs      = students.map(s => calcAvg(s.grades));
  const excellent = avgs.filter(a => a >= 90).length;
  const atRisk    = avgs.filter(a => a < 75).length;

  /* ── toggle accordion ── */
  function toggleCard(i) {
    setOpenIdx(prev => prev === i ? null : i);
  }

  /* ══════════════════════
     ADD STUDENT
  ══════════════════════ */
  function AddModal() {
    const [name,   setName]   = useState('');
    const [code,   setCode]   = useState('');
    const [scores, setScores] = useState(SUBJECTS.map(() => ''));
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    function validate() {
      const e = {};
      if (!name.trim())  e.name = true;
      if (!code.trim())  e.code = true;
      scores.forEach((v, i) => {
        const n = Number(v);
        if (v === '' || isNaN(n) || n < 0 || n > 100) e[`s${i}`] = true;
      });
      setErrors(e);
      return Object.keys(e).length === 0;
    }

    async function handleSave() {
      if (!validate()) { showToast('Please fix the highlighted fields.', 'bad'); return; }
      setSaving(true);
      try {
        const grades = SUBJECTS.map((s, i) => ({ ...s, score: Number(scores[i]) }));
        const res  = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), student_code: code.trim(), grades }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add student.');
        setStudents(prev => [...prev, data]);
        setOpenIdx(students.length); // open new card
        setAddOpen(false);
        showToast(`${name.trim()} added successfully!`);
      } catch (err) {
        showToast(err.message, 'bad');
      } finally {
        setSaving(false);
      }
    }

    return (
      <div className={`modal-overlay${addOpen ? ' active' : ''}`} onClick={e => e.target === e.currentTarget && setAddOpen(false)}>
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title">➕&nbsp; Add New Student</span>
            <button className="modal-close" onClick={() => setAddOpen(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className={`form-input${errors.name ? ' err' : ''}`}
                type="text" placeholder="e.g. Maria Santos" maxLength={60}
                value={name} onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input
                className={`form-input${errors.code ? ' err' : ''}`}
                type="text" placeholder="e.g. STU-006" maxLength={20}
                value={code} onChange={e => setCode(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '14px' }}>
                Subject Grades &nbsp;<span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(0–100)</span>
              </label>
              {SUBJECTS.map((s, i) => (
                <div className="grade-edit-row" key={s.subject}>
                  <span className="grade-edit-label">
                    <span className="grade-edit-icon">{s.icon}</span>{s.subject}
                  </span>
                  <input
                    className={`grade-input${errors[`s${i}`] ? ' err' : ''}`}
                    type="number" min="0" max="100" placeholder="–"
                    value={scores[i]}
                    onChange={e => setScores(prev => { const c = [...prev]; c[i] = e.target.value; return c; })}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : 'Add Student'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════
     EDIT GRADES
  ══════════════════════ */
  function EditModal() {
    const s = activeStudent;
    const [scores, setScores] = useState(s ? s.grades.map(g => String(g.score)) : []);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    function validate() {
      const e = {};
      scores.forEach((v, i) => {
        const n = Number(v);
        if (v === '' || isNaN(n) || n < 0 || n > 100) e[i] = true;
      });
      setErrors(e);
      return Object.keys(e).length === 0;
    }

    async function handleSave() {
      if (!s) return;
      if (!validate()) { showToast('Grades must be between 0 and 100.', 'bad'); return; }
      setSaving(true);
      try {
        const grades = s.grades.map((g, i) => ({ id: g.id, subject: g.subject, icon: g.icon, score: Number(scores[i]) }));
        const res  = await fetch(`/api/students/${s.id}/grades`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grades }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update grades.');
        // patch local state
        setStudents(prev => prev.map(st =>
          st.id === s.id ? { ...st, grades: data.grades } : st
        ));
        setEditOpen(false);
        showToast('Grades updated successfully!');
      } catch (err) {
        showToast(err.message, 'bad');
      } finally {
        setSaving(false);
      }
    }

    if (!s) return null;

    return (
      <div className={`modal-overlay${editOpen ? ' active' : ''}`} onClick={e => e.target === e.currentTarget && setEditOpen(false)}>
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title">✏️&nbsp; Edit — {s.name}</span>
            <button className="modal-close" onClick={() => setEditOpen(false)}>×</button>
          </div>
          <div className="modal-body">
            {s.grades.map((g, i) => (
              <div className="grade-edit-row" key={g.subject}>
                <span className="grade-edit-label">
                  <span className="grade-edit-icon">{g.icon}</span>{g.subject}
                </span>
                <input
                  className={`grade-input${errors[i] ? ' err' : ''}`}
                  type="number" min="0" max="100"
                  value={scores[i]}
                  onChange={e => setScores(prev => { const c = [...prev]; c[i] = e.target.value; return c; })}
                />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════
     DELETE STUDENT
  ══════════════════════ */
  function DeleteModal() {
    const s = activeStudent;
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
      if (!s) return;
      setDeleting(true);
      try {
        const res  = await fetch(`/api/students/${s.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete student.');
        setStudents(prev => prev.filter(st => st.id !== s.id));
        setOpenIdx(null);
        setDelOpen(false);
        showToast(`${s.name} has been removed.`);
      } catch (err) {
        showToast(err.message, 'bad');
      } finally {
        setDeleting(false);
      }
    }

    if (!s) return null;

    return (
      <div className={`modal-overlay${delOpen ? ' active' : ''}`} onClick={e => e.target === e.currentTarget && setDelOpen(false)}>
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title">🗑️&nbsp; Remove Student</span>
            <button className="modal-close" onClick={() => setDelOpen(false)}>×</button>
          </div>
          <div className="modal-body">
            <p className="confirm-text">
              Are you sure you want to remove <strong>{s.name}</strong>?<br />
              This will permanently delete their grades from the database.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setDelOpen(false)} disabled={deleting}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><span className="spinner" /> Removing…</> : 'Yes, Remove'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════
     RENDER
  ══════════════════════ */
  return (
    <>
      {/* Add button in nav — rendered via portal-like injection with CSS fixed */}
      <div style={{ position: 'fixed', top: 0, right: 32, height: 64, display: 'flex', alignItems: 'center', zIndex: 201 }}>
        <button className="btn-add-nav" onClick={() => setAddOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <span>Add Student</span>
        </button>
      </div>

      {/* Stats Bar */}
      {!loading && !dbError && students.length > 0 && (
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-val">{students.length}</div>
            <div className="stat-lbl">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{ color: 'var(--good)' }}>{excellent}</div>
            <div className="stat-lbl">Excellent</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{ color: 'var(--risk)' }}>{atRisk}</div>
            <div className="stat-lbl">At Risk</div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="state-box">
          <div className="icon">⏳</div>
          <h2>Loading students…</h2>
          <p>Fetching data from the database.</p>
        </div>
      )}

      {/* DB Error */}
      {!loading && dbError && (
        <div className="state-box">
          <div className="icon">⚠️</div>
          <h2>Database not connected</h2>
          <p>Could not connect to the database. Make sure your <strong>.env.local</strong> has a valid Neon connection string, then run the setup script.</p>
          <code>npm run db:setup</code>
        </div>
      )}

      {/* Empty */}
      {!loading && !dbError && students.length === 0 && (
        <div className="state-box">
          <div className="icon">📭</div>
          <h2>No students yet</h2>
          <p>Click "Add Student" in the top-right to get started, or run the seed script.</p>
          <code>npm run db:setup</code>
        </div>
      )}

      {/* Accordion */}
      {!loading && !dbError && students.length > 0 && (
        <div className="container">
          {students.map((s, i) => {
            const avg = calcAvg(s.grades);
            const { cls, label } = statusInfo(avg);
            const isOpen = openIdx === i;

            return (
              <div key={s.id} className={`card${isOpen ? ' open' : ''}`}>
                <div className="card-header" onClick={() => toggleCard(i)}>
                  <div className="avatar">{initials(s.name)}</div>
                  <div className="student-info">
                    <div className="student-name">{s.name}</div>
                    <div className="student-sub">{s.student_code}</div>
                  </div>

                  {/* Edit & Delete buttons */}
                  <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="btn-icon"
                      title="Edit grades"
                      onClick={() => { setActiveStudent(s); setEditOpen(true); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Remove student"
                      onClick={() => { setActiveStudent(s); setDelOpen(true); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4h10M5 4V3h4v1M6 6.5v4M8 6.5v4M3 4l.7 7.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 4"
                          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="chevron">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5L7 9L11 5" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div className="grades-wrapper">
                  <div className="grades-inner">
                    <div className="grades-body">
                      {s.grades.map(g => (
                        <div className="subject-row" key={g.subject}>
                          <span className="subject-name">
                            <span className="subject-icon">{g.icon}</span>
                            {g.subject}
                          </span>
                          <span className="grade-pill">{g.score}</span>
                        </div>
                      ))}
                      <div className={`average-row ${cls}`}>
                        <span className="avg-label">Average</span>
                        <div className="avg-right">
                          <span className="avg-score">{avg.toFixed(1)}</span>
                          <span className={`status-badge ${cls}`}>{label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddModal />
      <EditModal />
      <DeleteModal />

      {/* Toast */}
      <div className={`toast${toast.visible ? ' show' : ''} ${toast.type}`}>
        {toast.type === 'ok' ? '✅' : '❌'}&nbsp; {toast.msg}
      </div>
    </>
  );
}
