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
        <h1>Create New Outline</h1>
        <p>Generate a structured learning outline for any topic</p>
      </header>

      {/* Mode Tabs */}
      <div className="mode-tabs animate-in animate-delay-1">
        <button
          className={`mode-tab ${mode === 'topic' ? 'active' : ''}`}
          onClick={() => setMode('topic')}
        >
          <Sparkles size={18} />
          Topic Input
        </button>
        <button
          className={`mode-tab ${mode === 'content' ? 'active' : ''}`}
          onClick={() => setMode('content')}
        >
          <FileText size={18} />
          Paste Content
        </button>
      </div>

      <form onSubmit={handleSubmit} className="new-outline-form animate-in animate-delay-2">
        {mode === 'topic' ? (
          <div className="topic-input-section">
            <label htmlFor="topic">What would you like to learn about?</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning Fundamentals, Web Development, Data Structures..."
              autoFocus
            />
            <p className="input-hint">
              Describe your topic in a few words. The system will generate a comprehensive
              learning outline based on best practices in curriculum design.
            </p>
          </div>
        ) : (
          <div className="content-input-section">
            <label htmlFor="content">Paste your content or notes</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your existing content, notes, or raw material here. The system will structure it into a proper learning outline..."
            />
            <p className="input-hint">
              The system will analyze your content and create a structured outline with
              knowledge points, learning objectives, and assessments.
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Outline
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Topics */}
      <section className="example-topics animate-in animate-delay-3">
        <h3>Popular Topics</h3>
        <div className="topic-chips">
          {['Machine Learning', 'Python Programming', 'Data Structures', 'Web Development', 'AI Agents', 'System Design'].map(t => (
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
