import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, BookOpen, HelpCircle, CheckCircle, MessageCircle, FileText } from 'lucide-react';
import { getLesson } from '../api';
import './LessonViewer.css';

export default function LessonViewer() {
  const { kpId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [swbatChecked, setSwbatChecked] = useState({});

  const decodedKpId = decodeURIComponent(kpId);

  useEffect(() => {
    loadLesson();
  }, [kpId]);

  const loadLesson = async () => {
    try {
      const [lessonRes] = await Promise.all([
        getLesson(decodedKpId)
      ]);
      setLesson(lessonRes.data);
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseLessonContent = (content) => {
    if (!content) return { eus: [], eqs: [], swbats: [], misconceptions: [], phases: [] };

    const eus = [];
    const eqs = [];
    const swbats = [];
    const misconceptions = [];
    const phases = [];

    // Parse Enduring Understandings
    const euMatch = content.match(/### Enduring Understandings（持久理解）([\s\S]*?)(?=### Essential Questions|## Stage 2)/);
    if (euMatch) {
      const euItems = euMatch[1].match(/\d+\.\s*\*\*[^*]+\*\*\s*[^\n]+/g) || [];
      euItems.forEach(item => {
        const text = item.replace(/^\d+\.\s*\*\*([^*]+)\*\*\s*/, '$1');
        eus.push(text);
      });
    }

    // Parse Essential Questions
    const eqMatch = content.match(/### Essential Questions（核心问题）([\s\S]*?)(?=### SWBAT|## Stage 2)/);
    if (eqMatch) {
      const eqItems = eqMatch[1].match(/\d+\.\s*[^\n]+/g) || [];
      eqItems.forEach(item => {
        eqs.push(item.replace(/^\d+\.\s*/, '').replace(/^[""]|[""]$/g, ''));
      });
    }

    // Parse SWBAT
    const swbatMatch = content.match(/### SWBAT（学生将能够）([\s\S]*?)(?=### Common Misconceptions|## Stage 2)/);
    if (swbatMatch) {
      const swbatItems = swbatMatch[1].match(/\d+\.\s*\*\*\w+\*\*\s*[^\n]+/g) || [];
      swbatItems.forEach(item => {
        const text = item.replace(/^\d+\.\s*\*\*\w+\*\*\s*/, '');
        swbats.push(text);
      });
    }

    // Parse Misconceptions
    const misMatch = content.match(/### Common Misconceptions（常见误解）([\s\S]*?)(?=## Stage 2|## Stage 3|$)/);
    if (misMatch) {
      const misItems = misMatch[1].match(/[❌✗\-]\s*[^\n]+/g) || [];
      misItems.forEach(item => {
        misconceptions.push(item.replace(/^[❌✗\-]\s*/, ''));
      });
    }

    // Parse Learning Phases
    const phaseRegex = /### Phase (\d+):([^\n]+)[^\n]*\n([\s\S]*?)(?=### Phase \d|## Stage 2|$)/g;
    let phaseMatch;
    while ((phaseMatch = phaseRegex.exec(content)) !== null) {
      phases.push({
        num: phaseMatch[1],
        title: phaseMatch[2].trim(),
        content: phaseMatch[3].trim()
      });
    }

    return { eus, eqs, swbats, misconceptions, phases };
  };

  const toggleSwbat = (idx) => {
    setSwbatChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-not-found">
        <h2>备课未找到</h2>
        <p>"{decodedKpId}" 的备课尚未生成。</p>
        <Link to="/" className="btn btn-primary">返回学习台</Link>
      </div>
    );
  }

  const { eus, eqs, swbats, misconceptions, phases } = parseLessonContent(lesson.content);
  const checkedCount = Object.values(swbatChecked).filter(Boolean).length;

  return (
    <div className="lesson-viewer">
      {/* Breadcrumb */}
      <nav className="breadcrumb animate-in">
        <Link to="/">学习台</Link>
        <ChevronRight size={14} />
        <Link to="/">学习台</Link>
        <ChevronRight size={14} />
        <span>{lesson.title}</span>
      </nav>

      {/* Header */}
      <header className="lesson-header animate-in animate-delay-1">
        <div className="lesson-meta">
          <span className="kp-badge">{decodedKpId}</span>
          <span className={`badge badge-${lesson.difficulty || 'medium'}`}>
            {lesson.difficulty === 'easy' ? '简单' : lesson.difficulty === 'hard' ? '困难' : '中等'}
          </span>
          <span className="time-badge">
            <BookOpen size={14} />
            {lesson.estimated_time || '30'} 分钟
          </span>
        </div>
        <h1>{lesson.title}</h1>
        <p className="lesson-chapter">{lesson.chapter}</p>
      </header>

      <div className="divider"></div>

      {/* Main Content */}
      <div className="lesson-content">
        {/* Enduring Understandings */}
        <section className="lesson-section animate-in animate-delay-1">
          <h2>
            <span className="section-num">I.</span>
            持久理解
          </h2>
          <ol className="eu-list">
            {eus.map((eu, idx) => (
              <li key={idx} className="eu-item">
                <span className="eu-number">{idx + 1}</span>
                <p>{eu}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="section-divider"></div>

        {/* Essential Questions */}
        <section className="lesson-section animate-in animate-delay-2">
          <h2>
            <span className="section-num">II.</span>
            核心问题
          </h2>
          <ul className="eq-list">
            {eqs.map((eq, idx) => (
              <li key={idx} className="eq-item">
                <HelpCircle size={18} className="eq-icon" />
                <p><em>"{eq}"</em></p>
              </li>
            ))}
          </ul>
        </section>

        <div className="section-divider"></div>

        {/* SWBAT */}
        <section className="lesson-section animate-in animate-delay-3">
          <h2>
            <span className="section-num">III.</span>
            学生将能够...
          </h2>
          {checkedCount > 0 && (
            <div className="swbat-progress">
              <span>{checkedCount} / {swbats.length} 已完成</span>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(checkedCount / swbats.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          <ul className="swbat-list">
            {swbats.map((swbat, idx) => (
              <li
                key={idx}
                className={`swbat-item ${swbatChecked[idx] ? 'checked' : ''}`}
                onClick={() => toggleSwbat(idx)}
              >
                <div className="swbat-checkbox">
                  {swbatChecked[idx] ? (
                    <CheckCircle size={22} className="checked-icon" />
                  ) : (
                    <CheckCircle size={22} className="unchecked-icon" />
                  )}
                </div>
                <p>{swbat}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="section-divider"></div>

        {/* Common Misconceptions */}
        {misconceptions.length > 0 && (
          <section className="lesson-section misconceptions-section animate-in animate-delay-4">
            <h2>
              <span className="section-num">⚠</span>
              常见误解
            </h2>
            <ul className="misconceptions-list">
              {misconceptions.map((mis, idx) => (
                <li key={idx} className="misconception-item">
                  <span className="misconception-mark">❌</span>
                  <p>{mis}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Actions */}
        <section className="lesson-actions animate-in">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle size={20} />
            开始苏格拉底式教学
          </button>
          <Link
            to={`/quiz/${encodeURIComponent(decodedKpId)}`}
            className="btn btn-secondary btn-lg"
          >
            <FileText size={20} />
            参加测验
          </Link>
        </section>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="chat-overlay" onClick={() => setChatOpen(false)}>
          <div className="chat-modal card" onClick={e => e.stopPropagation()}>
            <div className="chat-header">
              <h3>苏格拉底式教学</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setChatOpen(false)}>
                关闭
              </button>
            </div>
            <div className="chat-body">
              <p className="chat-placeholder">
                苏格拉底式教学将从此处开始。AI 将根据课程内容引导你通过提问来发现和深化你的理解。
              </p>
            </div>
            <div className="chat-input-area">
              <input type="text" placeholder="提出问题或分享你的想法..." />
              <button className="btn btn-primary">发送</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
