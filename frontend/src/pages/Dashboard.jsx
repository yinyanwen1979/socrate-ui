import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Target, TrendingUp, PlusCircle, ChevronRight, FileText, Clock } from 'lucide-react';
import { getOutlines, getProgress } from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const [outlines, setOutlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [outlinesRes] = await Promise.all([
        getOutlines(),
        getProgress()
      ]);
      setOutlines(outlinesRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalKPs = outlines.reduce((acc, o) => {
    const matches = o.title?.match(/KP-/g) || [];
    return acc + matches.length;
  }, 0) || 42;

  const progressPercent = outlines.length > 0
    ? Math.round(outlines.reduce((acc, o) => acc + (o.progress?.percent || 0), 0) / outlines.length)
    : 0;

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="hero animate-in">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <h1 className="hero-title">Socrate</h1>
          <p className="hero-tagline">Wisdom Through Questions</p>
          <p className="hero-description">
            An AI-powered teaching system that helps you learn through Socratic dialogue,
            structured lesson plans, and intelligent progress tracking.
          </p>
          <div className="hero-actions">
            <Link to="/new" className="btn btn-primary btn-lg">
              <PlusCircle size={20} />
              New Outline
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="stats-row animate-in animate-delay-1">
        <div className="stat-card">
          <BookOpen className="stat-icon" size={24} />
          <div className="stat-value">{outlines.length}</div>
          <div className="stat-label">Total Outlines</div>
        </div>
        <div className="stat-card">
          <Target className="stat-icon" size={24} />
          <div className="stat-value">{totalKPs}</div>
          <div className="stat-label">Knowledge Points</div>
        </div>
        <div className="stat-card">
          <FileText className="stat-icon" size={24} />
          <div className="stat-value">0</div>
          <div className="stat-label">Lessons Generated</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" size={24} />
          <div className="stat-value">{progressPercent}%</div>
          <div className="stat-label">Progress</div>
        </div>
      </section>

      {/* Recent Outlines */}
      <section className="section animate-in animate-delay-2">
        <div className="section-header">
          <h2>Recent Outlines</h2>
          <Link to="/new" className="btn btn-secondary btn-sm">
            <PlusCircle size={16} />
            New
          </Link>
        </div>

        {outlines.length === 0 ? (
          <div className="empty-state card">
            <BookOpen size={48} />
            <h3>No outlines yet</h3>
            <p>Create your first outline to get started with Socratic learning.</p>
            <Link to="/new" className="btn btn-primary">
              <PlusCircle size={18} />
              Create Outline
            </Link>
          </div>
        ) : (
          <div className="outlines-grid">
            {outlines.slice(0, 3).map((outline, idx) => (
              <Link
                key={outline.slug}
                to={`/outline/${outline.slug}`}
                className="outline-card card"
              >
                <div className="outline-card-header">
                  <h3 className="outline-title">{outline.title}</h3>
                  <span className={`badge badge-${outline.difficulty || 'medium'}`}>
                    {outline.difficulty || 'medium'}
                  </span>
                </div>
                <div className="outline-meta">
                  <span className="meta-item">
                    <BookOpen size={14} />
                    {outline.chapterCount || 2} Chapters
                  </span>
                  <span className="meta-item">
                    <Clock size={14} />
                    {formatDate(outline.lastModified)}
                  </span>
                </div>
                {outline.progress?.percent > 0 && (
                  <div className="outline-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${outline.progress.percent}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{outline.progress.percent}% complete</span>
                  </div>
                )}
                <div className="outline-card-footer">
                  <span className="continue-link">
                    Continue <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="section animate-in animate-delay-3">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/progress" className="quick-action card">
            <TrendingUp size={32} className="qa-icon" />
            <h3>View Progress</h3>
            <p>Track your learning journey</p>
          </Link>
          <Link to="/new" className="quick-action card">
            <Sparkles size={32} className="qa-icon" />
            <h3>Generate Quiz</h3>
            <p>Test your knowledge</p>
          </Link>
          <button
            className="quick-action card"
            onClick={() => {
              const topic = outlines[0]?.title || 'AI Agent';
              window.location.href = `/check/${encodeURIComponent(topic)}`;
            }}
          >
            <Target size={32} className="qa-icon" />
            <h3>Check Quality</h3>
            <p>Analyze your outline</p>
          </button>
        </div>
      </section>
    </div>
  );
}
