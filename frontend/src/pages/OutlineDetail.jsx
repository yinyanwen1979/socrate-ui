import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, Clock, Users, Edit2, Trash2, FileText, HelpCircle, CheckCircle } from 'lucide-react';
import { getOutline, deleteOutline, generateLesson, generateQuiz, updateProgress } from '../api';
import './OutlineDetail.css';

export default function OutlineDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [generatingKP, setGeneratingKP] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadOutline();
  }, [slug]);

  const loadOutline = async () => {
    try {
      const res = await getOutline(slug);
      setOutline(res.data);
      setEditContent(res.data.content);
      // Auto-expand first chapter
      if (res.data.content) {
        const firstChapter = res.data.content.match(/^## ([^\n]+)/m);
        if (firstChapter) {
          setExpandedChapters({ [firstChapter[1]]: true });
        }
      }
    } catch (err) {
      console.error('Failed to load outline:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseContent = (content) => {
    if (!content) return { chapters: [] };

    const chapters = [];
    const chapterRegex = /^## ([^\n]+)([\s\S]*?)(?=^## |\n## |$)/gm;
    let chapterMatch;

    while ((chapterMatch = chapterRegex.exec(content)) !== null) {
      const chapterTitle = chapterMatch[1];
      const chapterContent = chapterMatch[2];

      const topics = [];
      const topicRegex = /### Topic (\d+\.\d+):([^\n]+)[\s\S]*?\*\*Overview\*\*:([^\n]+)[\s\S]*?\*\*Knowledge Points\*\*:([\s\S]*?)(?=### Topic |^## |$)/g;
      let topicMatch;

      while ((topicMatch = topicRegex.exec(chapterContent)) !== null) {
        const topicNum = topicMatch[1];
        const topicTitle = topicMatch[2].trim();
        const overview = topicMatch[3].trim();
        const kpSection = topicMatch[4];

        const kps = [];
        const kpRegex = /- \*\*([^-]+)\**:?\s*([^\n]+)(?:\n\s*-\s*Difficulty:\s*([^\n]+))?(?:\n\s*-\s*Time:\s*([^\n]+))?(?:\n\s*-\s*Prerequisites:\s*(\[[^\]]+\]))?(?:\n\s*-\s*Introduction:\s*([^\n]+))?/g;
        let kpMatch;

        while ((kpMatch = kpRegex.exec(kpSection)) !== null) {
          kps.push({
            id: kpMatch[1].trim(),
            title: kpMatch[2].trim(),
            difficulty: kpMatch[3]?.trim() || 'medium',
            time: kpMatch[4]?.trim() || '30min',
            prerequisites: kpMatch[5] || '[]',
            intro: kpMatch[6]?.trim() || 'Question approach'
          });
        }

        topics.push({ num: topicNum, title: topicTitle, overview, kps });
      }

      // Also check for Review phases
      const isReview = chapterTitle.toLowerCase().includes('review');

      chapters.push({ title: chapterTitle, topics, isReview });
    }

    return { chapters };
  };

  const toggleChapter = (title) => {
    setExpandedChapters(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleTopic = (id) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除此大纲吗？')) return;
    try {
      await deleteOutline(slug);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleGenerateLesson = async (kpId) => {
    setGeneratingKP(kpId);
    try {
      await generateLesson(kpId, slug);
      await updateProgress({ outlineSlug: slug, kpId, status: 'lesson_generated' });
      alert('备课生成成功！');
    } catch (err) {
      console.error('Failed to generate lesson:', err);
      alert('生成备课失败');
    } finally {
      setGeneratingKP(null);
    }
  };

  const handleGenerateQuiz = async (kpId) => {
    setGeneratingKP(kpId);
    try {
      await generateQuiz(kpId);
      await updateProgress({ outlineSlug: slug, kpId, status: 'quiz_generated' });
      alert('测验生成成功！');
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      alert('生成测验失败');
    } finally {
      setGeneratingKP(null);
    }
  };

  const getDifficultyClass = (diff) => {
    if (!diff) return 'badge-medium';
    const d = diff.toLowerCase();
    if (d.includes('easy')) return 'badge-easy';
    if (d.includes('hard')) return 'badge-hard';
    return 'badge-medium';
  };

  if (loading) {
    return (
      <div className="outline-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!outline) {
    return (
      <div className="outline-not-found">
        <h2>大纲未找到</h2>
        <Link to="/" className="btn btn-primary">返回学习台</Link>
      </div>
    );
  }

  const { chapters } = parseContent(outline.content);

  return (
    <div className="outline-detail">
      {/* Breadcrumb */}
      <nav className="breadcrumb animate-in">
        <Link to="/">学习台</Link>
        <ChevronRight size={14} />
        <span>{outline.title}</span>
      </nav>

      {/* Header */}
      <header className="outline-header animate-in animate-delay-1">
        <div className="outline-header-content">
          <h1>{outline.title}</h1>
          <div className="outline-metadata">
            <span className="meta-item">
              <Users size={16} />
              {outline.targetAudience || '中级'}
            </span>
            <span className={`badge ${getDifficultyClass(outline.difficulty)}`}>
              {outline.difficulty || 'intermediate'}
            </span>
            <span className="meta-item">
              <Clock size={16} />
              {outline.estimated_total_hours || 0} 小时
            </span>
          </div>
        </div>
        <div className="outline-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(!editMode)}>
            <Edit2 size={16} />
            {editMode ? '预览' : '编辑'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <div className="divider"></div>

      {/* Main Content */}
      <div className="outline-content">
        <div className="chapters-list">
          {chapters.map((chapter, cIdx) => (
            <div key={cIdx} className={`chapter card animate-in animate-delay-${Math.min(cIdx + 1, 4)}`}>
              <button
                className="chapter-header"
                onClick={() => toggleChapter(chapter.title)}
              >
                <div className="chapter-title-wrap">
                  {chapter.isReview ? (
                    <HelpCircle size={20} className="chapter-icon review" />
                  ) : (
                    <BookOpen size={20} className="chapter-icon" />
                  )}
                  <h2>{chapter.title}</h2>
                </div>
                {expandedChapters[chapter.title]
                  ? <ChevronDown size={20} />
                  : <ChevronRight size={20} />
                }
              </button>

              {expandedChapters[chapter.title] && (
                <div className="chapter-content">
                  {chapter.topics.map((topic, tIdx) => (
                    <div key={tIdx} className="topic-section">
                      <button
                        className="topic-header"
                        onClick={() => toggleTopic(`${cIdx}-${tIdx}`)}
                      >
                        <span className="topic-num">{topic.num}</span>
                        <span className="topic-title">{topic.title}</span>
                        {expandedTopics[`${cIdx}-${tIdx}`]
                          ? <ChevronDown size={16} />
                          : <ChevronRight size={16} />
                        }
                      </button>

                      {expandedTopics[`${cIdx}-${tIdx}`] && (
                        <div className="topic-content">
                          <p className="topic-overview">{topic.overview}</p>

                          <div className="kps-list">
                            <h4>知识点</h4>
                            {topic.kps.map((kp, kIdx) => (
                              <div key={kIdx} className="kp-item">
                                <div className="kp-header">
                                  <span className="kp-id">{kp.id}</span>
                                  <span className={`badge ${getDifficultyClass(kp.difficulty)}`}>
                                    {kp.difficulty}
                                  </span>
                                  <span className="kp-time">{kp.time}</span>
                                </div>
                                <p className="kp-title">{kp.title}</p>
                                <div className="kp-meta">
                                  <span className="kp-prereq">
                                    前置知识：{kp.prerequisites}
                                  </span>
                                </div>
                                <div className="kp-actions">
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleGenerateLesson(kp.id)}
                                    disabled={generatingKP === kp.id}
                                  >
                                    <FileText size={14} />
                                    {generatingKP === kp.id ? '生成中...' : '备课'}
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleGenerateQuiz(kp.id)}
                                    disabled={generatingKP === kp.id}
                                  >
                                    <HelpCircle size={14} />
                                    {generatingKP === kp.id ? '生成中...' : '测验'}
                                  </button>
                                  <Link
                                    to={`/lesson/${encodeURIComponent(kp.id)}`}
                                    className="btn btn-ghost btn-sm"
                                  >
                                    <CheckCircle size={14} />
                                    查看备课
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar - Table of Contents */}
        <aside className="outline-sidebar animate-in animate-delay-2">
          <div className="card toc">
            <h3>目录</h3>
            <nav className="toc-nav">
              {chapters.map((chapter, cIdx) => (
                <div key={cIdx} className="toc-chapter">
                  <button
                    className="toc-chapter-title"
                    onClick={() => toggleChapter(chapter.title)}
                  >
                    {expandedChapters[chapter.title]
                      ? <ChevronDown size={14} />
                      : <ChevronRight size={14} />
                    }
                    {chapter.title}
                  </button>
                  {expandedChapters[chapter.title] && (
                    <div className="toc-topics">
                      {chapter.topics.map((topic, tIdx) => (
                        <button
                          key={tIdx}
                          className="toc-topic"
                          onClick={() => {
                            toggleTopic(`${cIdx}-${tIdx}`);
                            document.querySelector(`.topic-section:nth-child(${tIdx + 1})`)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {topic.num} {topic.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Progress */}
          <div className="card progress-card">
            <h3>学习进度</h3>
            <div className="progress-stats">
              <div className="progress-item">
                <span className="progress-label">已完成</span>
                <span className="progress-value">0 / {chapters.length} 章节</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Mode */}
      {editMode && (
        <div className="edit-overlay">
          <div className="edit-modal card">
            <h2>编辑大纲</h2>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-textarea"
            />
            <div className="edit-actions">
              <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                取消
              </button>
              <button className="btn btn-primary">
                保存更改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
