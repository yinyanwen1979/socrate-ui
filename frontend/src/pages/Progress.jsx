import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, Target, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { getOutlines, getProgress } from '../api';
import './Progress.css';

export default function Progress() {
  const [outlines, setOutlines] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [outlinesRes, progressRes] = await Promise.all([
        getOutlines(),
        getProgress()
      ]);
      setOutlines(outlinesRes.data || []);
      setProgress(progressRes.data || {});
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOutlineProgress = (outline) => {
    const outlineProgress = progress.outlines?.[outline.slug] || {};
    const totalKP = 5; // Approximate
    const completed = Object.keys(outlineProgress).filter(k => k !== 'percent').length;
    return {
      completed,
      total: totalKP,
      percent: Math.round((completed / totalKP) * 100)
    };
  };

  const getIncompleteKPs = () => {
    const kps = [];
    outlines.forEach(outline => {
      const outlineProgress = progress.outlines?.[outline.slug] || {};
      // Mock incomplete KPs based on outline structure
      kps.push({
        outlineSlug: outline.slug,
        outlineTitle: outline.title,
        kpId: 'KP-1.1.1',
        kpTitle: 'Agent vs Assistant 区别',
        status: outlineProgress['KP-1.1.1'] || 'not_started'
      });
    });
    return kps.filter(kp => kp.status !== 'completed' && kp.status !== 'lesson_generated');
  };

  if (loading) {
    return (
      <div className="progress-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const incompleteKPs = getIncompleteKPs();
  const totalKPs = outlines.length * 5;
  const completedKPs = totalKPs - incompleteKPs.length;

  return (
    <div className="progress-page">
      <header className="progress-header animate-in">
        <h1>Learning Progress</h1>
        <p>Track your journey through the Socrate curriculum</p>
      </header>

      {/* Overview Stats */}
      <section className="stats-row animate-in animate-delay-1">
        <div className="stat-card">
          <BookOpen className="stat-icon" size={24} />
          <div className="stat-value">{outlines.length}</div>
          <div className="stat-label">Active Outlines</div>
        </div>
        <div className="stat-card">
          <Target className="stat-icon" size={24} />
          <div className="stat-value">{totalKPs}</div>
          <div className="stat-label">Total Knowledge Points</div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" size={24} />
          <div className="stat-value">{completedKPs}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" size={24} />
          <div className="stat-value">
            {totalKPs > 0 ? Math.round((completedKPs / totalKPs) * 100) : 0}%
          </div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </section>

      {/* Dependency Graph */}
      <section className="section animate-in animate-delay-2">
        <h2>Knowledge Dependency Map</h2>
        <div className="dependency-graph card">
          <svg viewBox="0 0 600 300" className="dep-svg">
            {/* Chapter 1 */}
            <rect x="30" y="30" width="120" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--accent-gold)" strokeWidth="2"/>
            <text x="90" y="60" textAnchor="middle" fill="var(--ink-primary)" fontSize="12" fontFamily="var(--font-display)">Chapter 1</text>

            {/* KP nodes */}
            <rect x="180" y="20" width="100" height="35" rx="4" fill="var(--accent-sage-light)" stroke="var(--accent-sage)" strokeWidth="2"/>
            <text x="230" y="42" textAnchor="middle" fill="var(--ink-primary)" fontSize="10" fontFamily="var(--font-mono)">KP-1.1.1</text>

            <rect x="180" y="65" width="100" height="35" rx="4" fill="var(--accent-gold-light)" stroke="var(--accent-gold)" strokeWidth="2"/>
            <text x="230" y="87" textAnchor="middle" fill="var(--ink-primary)" fontSize="10" fontFamily="var(--font-mono)">KP-1.1.2</text>

            <rect x="180" y="110" width="100" height="35" rx="4" fill="var(--accent-gold-light)" stroke="var(--accent-gold)" strokeWidth="2"/>
            <text x="230" y="132" textAnchor="middle" fill="var(--ink-primary)" fontSize="10" fontFamily="var(--font-mono)">KP-1.1.3</text>

            {/* Arrows */}
            <path d="M280 37 L180 37" stroke="var(--border)" strokeWidth="2" markerEnd="url(#arrow)"/>
            <path d="M280 82 L180 82" stroke="var(--border)" strokeWidth="2" markerEnd="url(#arrow)"/>

            {/* Chapter 2 */}
            <rect x="30" y="180" width="120" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--accent-gold)" strokeWidth="2"/>
            <text x="90" y="210" textAnchor="middle" fill="var(--ink-primary)" fontSize="12" fontFamily="var(--font-display)">Chapter 2</text>

            <rect x="180" y="175" width="100" height="35" rx="4" fill="var(--accent-gold-light)" stroke="var(--accent-gold)" strokeWidth="2"/>
            <text x="230" y="197" textAnchor="middle" fill="var(--ink-primary)" fontSize="10" fontFamily="var(--font-mono)">KP-2.1.1</text>

            <rect x="180" y="220" width="100" height="35" rx="4" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2"/>
            <text x="230" y="242" textAnchor="middle" fill="var(--ink-muted)" fontSize="10" fontFamily="var(--font-mono)">KP-2.1.2</text>

            {/* Connecting line */}
            <path d="M90 80 L90 180" stroke="var(--accent-gold)" strokeWidth="2" strokeDasharray="5,5"/>
            <path d="M280 192 L180 192" stroke="var(--border)" strokeWidth="2" markerEnd="url(#arrow)"/>

            {/* Arrow marker definition */}
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="var(--ink-muted)"/>
              </marker>
            </defs>

            {/* Legend */}
            <g transform="translate(350, 20)">
              <rect x="0" y="0" width="15" height="15" fill="var(--accent-sage-light)" stroke="var(--accent-sage)"/>
              <text x="25" y="12" fill="var(--ink-secondary)" fontSize="11">Completed</text>

              <rect x="0" y="25" width="15" height="15" fill="var(--accent-gold-light)" stroke="var(--accent-gold)"/>
              <text x="25" y="37" fill="var(--ink-secondary)" fontSize="11">In Progress</text>

              <rect x="0" y="50" width="15" height="15" fill="var(--bg-secondary)" stroke="var(--border)"/>
              <text x="25" y="62" fill="var(--ink-secondary)" fontSize="11">Not Started</text>
            </g>
          </svg>
        </div>
      </section>

      {/* Chapter Progress */}
      <section className="section animate-in animate-delay-3">
        <h2>Chapter Progress</h2>
        <div className="chapter-progress-list">
          {outlines.map((outline) => {
            const { completed, total, percent } = calculateOutlineProgress(outline);
            return (
              <div key={outline.slug} className="chapter-progress-item card">
                <div className="cp-header">
                  <Link to={`/outline/${outline.slug}`} className="cp-title">
                    {outline.title}
                  </Link>
                  <span className="cp-percent">{percent}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="cp-stats">
                  <span>{completed} of {total} KPs completed</span>
                  <Link to={`/outline/${outline.slug}`} className="btn btn-ghost btn-sm">
                    Continue
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gap Analysis */}
      <section className="section animate-in animate-delay-4">
        <h2>
          <AlertCircle size={20} />
          Gap Analysis
        </h2>
        <p className="section-desc">
          Knowledge points that need attention. Focus on these to complete your learning journey.
        </p>

        {incompleteKPs.length === 0 ? (
          <div className="empty-state card">
            <CheckCircle size={48} />
            <h3>All caught up!</h3>
            <p>You've completed all available knowledge points.</p>
          </div>
        ) : (
          <div className="gap-list">
            {incompleteKPs.map((kp, idx) => (
              <div key={idx} className="gap-item card">
                <div className="gap-priority">
                  <span className="priority-badge">#{idx + 1}</span>
                </div>
                <div className="gap-content">
                  <span className="gap-kp-id">{kp.kpId}</span>
                  <h4>{kp.kpTitle}</h4>
                  <p className="gap-outline">{kp.outlineTitle}</p>
                </div>
                <div className="gap-actions">
                  <Link
                    to={`/lesson/${encodeURIComponent(kp.kpId)}`}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={14} />
                    Generate Lesson
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
