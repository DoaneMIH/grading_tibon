'use client';

import { useState } from 'react';

function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2);
}

export default function Accordion({ students }) {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(idx) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  return (
    <div className="container">
      {students.map((student, idx) => {
        const avg = student.grades.reduce((s, g) => s + g.score, 0) / student.grades.length;
        const avgFixed = avg.toFixed(1);
        const isRisk = avg < 75;
        const isExcellent = avg >= 90;
        const statusClass = isRisk ? 'risk' : isExcellent ? 'excellent' : 'good';
        const statusLabel = isRisk ? 'At Risk' : isExcellent ? 'Excellent' : 'Passing';
        const isOpen = openIndex === idx;

        return (
          <div key={student.id} className={`card${isOpen ? ' open' : ''}`}>
            <div className="card-header" onClick={() => toggle(idx)}>
              <div className="avatar">{initials(student.name)}</div>
              <div className="student-info">
                <div className="student-name">{student.name}</div>
                <div className="student-sub">{student.student_code}</div>
              </div>
              <div className="chevron">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 5L7 9L11 5"
                    stroke="#6b7280"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="grades-wrapper">
              <div className="grades-inner">
                <div className="grades-body">
                  {student.grades.map((g) => (
                    <div className="subject-row" key={g.subject}>
                      <span className="subject-name">
                        <span className="subject-icon">{g.icon}</span>
                        {g.subject}
                      </span>
                      <span className="grade-pill">{g.score}</span>
                    </div>
                  ))}

                  <div className={`average-row ${statusClass}`}>
                    <span className="avg-label">Average</span>
                    <div className="avg-right">
                      <span className="avg-score">{avgFixed}</span>
                      <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
