import './globals.css';
import GradeApp from './GradeApp';

export default function Home() {
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
        <p>Click a card to view grades &nbsp;·&nbsp; ✏️ edit &nbsp;·&nbsp; 🗑️ remove</p>
      </header>

      {/* ── Client App (fetches from DB via API) ── */}
      <GradeApp />
    </>
  );
}
