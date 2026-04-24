import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Upload } from 'lucide-react';
import { createOutline } from '../api';
import './NewOutline.css';

export default function NewOutline() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('topic'); // 'topic' or 'content'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await createOutline(topic.trim());
      if (res.data.slug) {
        navigate(`/outline/${res.data.slug}`);
      }
    } catch (err) {
      console.error('Failed to create outline:', err);
      alert('Failed to create outline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-outline-page">
      <header className="new-outline-header animate-in">
        <h1>创建新课程大纲</h1>
        <p>为任意主题生成结构化的学习大纲</p>
      </header>

      {/* Mode Tabs */}
      <div className="mode-tabs animate-in animate-delay-1">
        <button
          className={`mode-tab ${mode === 'topic' ? 'active' : ''}`}
          onClick={() => setMode('topic')}
        >
          <Sparkles size={18} />
          主题输入
        </button>
        <button
          className={`mode-tab ${mode === 'content' ? 'active' : ''}`}
          onClick={() => setMode('content')}
        >
          <FileText size={18} />
          粘贴内容
        </button>
      </div>

      <form onSubmit={handleSubmit} className="new-outline-form animate-in animate-delay-2">
        {mode === 'topic' ? (
          <div className="topic-input-section">
            <label htmlFor="topic">你想学习什么？</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：机器学习基础、Web 开发、数据结构..."
              autoFocus
            />
            <p className="input-hint">
              用几个词描述你的主题。系统将基于课程设计的最佳实践为你生成全面的学习大纲。
            </p>
          </div>
        ) : (
          <div className="content-input-section">
            <label htmlFor="content">粘贴你的内容或笔记</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此粘贴你现有的内容、笔记或原材料。系统会将其结构化为一个适当的学习大纲..."
            />
            <p className="input-hint">
              系统将分析你的内容，并创建包含知识点、学习目标和评估的结构化大纲。
            </p>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <>
                <div className="greek-pattern">
                  <span></span><span></span><span></span>
                  <span></span><span></span><span></span>
                  <span></span><span></span><span></span>
                </div>
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                生成大纲
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Topics */}
      <section className="example-topics animate-in animate-delay-3">
        <h3>热门主题</h3>
        <div className="topic-chips">
          {['机器学习', 'Python 编程', '数据结构', 'Web 开发', 'AI 智能体', '系统设计'].map(t => (
            <button
              key={t}
              className="topic-chip"
              onClick={() => setTopic(t)}
              disabled={loading}
            >
              {t}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
