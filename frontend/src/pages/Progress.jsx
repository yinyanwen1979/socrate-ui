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
      console.error('加载进度失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOutlineProgress = (outline) => {
    const outlineProgress = progress.outlines?.[outline.slug] || {};
    const totalKP = 5;
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
        <h1>学习进度</h1>
        <p>追踪你的苏格拉底式学习之旅</p>
      </header>

      {/* Overview Stats */}
      <section className="stats-row animate-in animate-delay-1">
        <div className="stat-card">
          <BookOpen className="stat-icon" size={24} />
          <div className="stat-value">{outlines.length}</div>
          <div className="stat-label">活跃大纲</div>
        </div>
        <div className="stat-card">
          <Target className="stat-icon" size={24} />
          <div className="stat-value">{totalKPs}</div>
          <div className="stat-label">知识点总数</div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" size={24} />
          <div className="stat-value">{completedKPs}</div>
          <div className="stat-label">已完成</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" size={24} />
          <div className="stat-value">
            {totalKPs > 0 ? Math.round((completedKPs / totalKPs) * 100) : 0}%
          </div>
          <div className="stat-label">完成率</div>
        </div>
      </section>

      {/* Dependency Graph */}
      <section className="section animate-in animate-delay-2">
        <h2>知识点依赖关系图</h2>
        <div className="dependency-graph card">
          <svg viewBox="0 0 680 320" className="dep-svg">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill="#8A8A9A"/>
              </marker>
              <marker id="arrow-gold" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill="#C9A84C"/>
              </marker>
            </defs>

            {/* Chapter 1 box */}
            <rect x="20" y="20" width="140" height="160" rx="6" fill="#F5F0E8" stroke="#C9A84C" strokeWidth="2"/>
            <text x="90" y="48" textAnchor="middle" fill="#1A1A2E" fontSize="13" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600">第一章</text>
            <text x="90" y="65" textAnchor="middle" fill="#8A8A9A" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">Chapter 1</text>

            {/* Chapter 1 KPI nodes */}
            <rect x="40" y="80" width="100" height="32" rx="4" fill="#C5D9C7" stroke="#7A9E7E" strokeWidth="2"/>
            <text x="90" y="101" textAnchor="middle" fill="#1A1A2E" fontSize="10" fontFamily="'JetBrains Mono', monospace">KP-1.1.1 ✓</text>

            <rect x="40" y="120" width="100" height="32" rx="4" fill="#E8D5A3" stroke="#C9A84C" strokeWidth="2"/>
            <text x="90" y="141" textAnchor="middle" fill="#1A1A2E" fontSize="10" fontFamily="'JetBrains Mono', monospace">KP-1.1.2</text>

            {/* Chapter 2 box */}
            <rect x="20" y="200" width="140" height="100" rx="6" fill="#F5F0E8" stroke="#C9A84C" strokeWidth="2"/>
            <text x="90" y="228" textAnchor="middle" fill="#1A1A2E" fontSize="13" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600">第二章</text>
            <text x="90" y="245" textAnchor="middle" fill="#8A8A9A" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">Chapter 2</text>

            <rect x="40" y="255" width="100" height="32" rx="4" fill="#F5F0E8" stroke="#E5E0D5" strokeWidth="2"/>
            <text x="90" y="276" textAnchor="middle" fill="#8A8A9A" fontSize="10" fontFamily="'JetBrains Mono', monospace">KP-2.1.1</text>

            {/* Arrow: Chapter 1 down to KP node */}
            <path d="M90 70 L90 80" stroke="#C9A84C" strokeWidth="2" markerEnd="url(#arrow-gold)"/>

            {/* Horizontal arrows from chapter box to KPs */}
            <path d="M160 96 L140 96" stroke="#C9A84C" strokeWidth="2" markerEnd="url(#arrow-gold)"/>
            <path d="M160 136 L140 136" stroke="#C9A84C" strokeWidth="2" markerEnd="url(#arrow-gold)"/>

            {/* Connecting line between chapters */}
            <path d="M90 180 L90 200" stroke="#C9A84C" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow-gold)"/>

            {/* Arrow from Ch1 box to Ch2 KP */}
            <path d="M160 271 L140 271" stroke="#C9A84C" strokeWidth="2" markerEnd="url(#arrow-gold)"/>

            {/* Status labels on right of KPI nodes */}
            <text x="155" y="96" fill="#7A9E7E" fontSize="9" fontFamily="'Crimson Pro', Georgia, serif">已完成</text>
            <text x="155" y="136" fill="#C9A84C" fontSize="9" fontFamily="'Crimson Pro', Georgia, serif">进行中</text>
            <text x="155" y="271" fill="#8A8A9A" fontSize="9" fontFamily="'Crimson Pro', Georgia, serif">未开始</text>

            {/* Flow description - right side */}
            <text x="300" y="30" fill="#1A1A2E" fontSize="12" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600">学习流程</text>

            {/* Flow step 1 */}
            <rect x="300" y="45" width="160" height="40" rx="4" fill="#FFFFFF" stroke="#C9A84C" strokeWidth="1"/>
            <text x="380" y="62" textAnchor="middle" fill="#1A1A2E" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">理解基础概念</text>
            <text x="380" y="76" textAnchor="middle" fill="#8A8A9A" fontSize="9" fontFamily="'Crimson Pro', Georgia, serif">KP-1.1.1</text>

            <path d="M460 65 L475 65" stroke="#C9A84C" strokeWidth="2" markerEnd="url(#arrow-gold)"/>

            {/* Flow step 2 */}
            <rect x="300" y="100" width="160" height="40" rx="4" fill="#FFFFFF" stroke="#E5E0D5" strokeWidth="1"/>
            <text x="380" y="117" textAnchor="middle" fill="#1A1A2E" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">掌握核心组件</text>
            <text x="380" y="131" textAnchor="middle" fill="#8A8A9A" fontSize="9" fontFamily="'Crimson Pro', Georgia, serif">KP-1.1.2 → 1.1.3</text>

            <path d="M460 120 L475 120" stroke="#E5E0D5" strokeWidth="2" markerEnd="url(#arrow)"/>

            {/* Flow step 3 */}
            <rect x="300" y="155" width="160" height="40" rx="4" fill="#FFFFFF" stroke="#E5E0D5" strokeWidth="1"/>
            <text x="380" y="172" textAnchor="middle" fill="#1A1A2E" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">多智能体协作</text>
            <text x="380" y="186" textAnchor="middle" fill="#8A8A9A" fontSize="9" fontFamily="'Crimson Pro', Georgia, serif">KP-2.1.1 → 2.1.2</text>

            {/* Legend */}
            <text x="300" y="220" fill="#1A1A2E" fontSize="11" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600">图例</text>
            <line x1="300" y1="235" x2="330" y2="235" stroke="#7A9E7E" strokeWidth="2"/>
            <circle cx="315" cy="235" r="5" fill="#C5D9C7" stroke="#7A9E7E" strokeWidth="1"/>
            <text x="340" y="239" fill="#4A4A5A" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">已完成</text>

            <line x1="300" y1="255" x2="330" y2="255" stroke="#C9A84C" strokeWidth="2"/>
            <circle cx="315" cy="255" r="5" fill="#E8D5A3" stroke="#C9A84C" strokeWidth="1"/>
            <text x="340" y="259" fill="#4A4A5A" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">进行中</text>

            <line x1="300" y1="275" x2="330" y2="275" stroke="#E5E0D5" strokeWidth="2"/>
            <circle cx="315" cy="275" r="5" fill="#F5F0E8" stroke="#E5E0D5" strokeWidth="1"/>
            <text x="340" y="279" fill="#4A4A5A" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">未开始</text>

            <line x1="300" y1="295" x2="330" y2="295" stroke="#C9A84C" strokeWidth="2" strokeDasharray="4,4"/>
            <text x="340" y="299" fill="#4A4A5A" fontSize="10" fontFamily="'Crimson Pro', Georgia, serif">章节依赖</text>
          </svg>
        </div>
      </section>

      {/* Chapter Progress */}
      <section className="section animate-in animate-delay-3">
        <h2>章节进度</h2>
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
                  <span>{completed} / {total} 知识点已完成</span>
                  <Link to={`/outline/${outline.slug}`} className="btn btn-ghost btn-sm">
                    继续学习
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
          薄弱点分析
        </h2>
        <p className="section-desc">
          以下知识点需要加强。专注这些内容，完成你的学习之旅。
        </p>

        {incompleteKPs.length === 0 ? (
          <div className="empty-state card">
            <CheckCircle size={48} />
            <h3>全部完成！</h3>
            <p>你已经完成了所有可用的知识点。</p>
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
                    生成备课
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
