import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, HelpCircle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { getQuiz } from '../api';
import './QuizViewer.css';

export default function QuizViewer() {
  const { kpId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});

  const decodedKpId = decodeURIComponent(kpId);

  useEffect(() => {
    loadQuiz();
  }, [kpId]);

  const loadQuiz = async () => {
    try {
      const res = await getQuiz(decodedKpId);
      setQuiz(res.data);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseQuizContent = (content) => {
    if (!content) return { multipleChoice: [], shortAnswer: [], trueFalse: [] };

    const multipleChoice = [];
    const shortAnswer = [];
    const trueFalse = [];

    // Parse Multiple Choice
    const mcSection = content.match(/### Multiple Choice([\s\S]*?)(?=### Short Answer|### True\/False|# Quiz|$)/);
    if (mcSection) {
      const questions = mcSection[1].split(/(?=\d+\.\s+\*\*)/g).filter(q => q.trim());
      questions.forEach(q => {
        const lines = q.trim().split('\n');
        if (lines.length > 0) {
          const questionMatch = lines[0].match(/^\d+\.\s+\*\*([^*]+)\*\*/);
          if (questionMatch) {
            const question = questionMatch[1];
            const options = [];
            let correctAnswer = '';

            lines.slice(1).forEach(line => {
              const optMatch = line.match(/^\s*([A-D])\)\s+(.+)/);
              if (optMatch) {
                options.push({ label: optMatch[1], text: optMatch[2] });
              }
              const correctMatch = line.match(/\*\*([A-D])\*\*/);
              if (correctMatch) {
                correctAnswer = correctMatch[1];
              }
            });

            if (question) {
              multipleChoice.push({ question, options, correctAnswer });
            }
          }
        }
      });
    }

    // Parse True/False
    const tfSection = content.match(/### True\/False([\s\S]*?)(?=###|# Quiz|$)/);
    if (tfSection) {
      const questions = tfSection[1].split(/(?=\d+\.\s+)/g).filter(q => q.trim());
      questions.forEach(q => {
        const lines = q.trim().split('\n');
        if (lines.length > 0) {
          const questionMatch = lines[0].match(/^\d+\.\s+(.+)/);
          const answerMatch = q.match(/Answer:\s*(True|False)/i);
          if (questionMatch) {
            trueFalse.push({
              question: questionMatch[1].replace(/\*\*/g, ''),
              answer: answerMatch ? answerMatch[1].toLowerCase() : ''
            });
          }
        }
      });
    }

    return { multipleChoice, shortAnswer, trueFalse };
  };

  const handleMCAnswer = (qIdx, optionLabel) => {
    setSelectedAnswers(prev => ({ ...prev, [`mc-${qIdx}`]: optionLabel }));
    setRevealedQuestions(prev => ({ ...prev, [`mc-${qIdx}`]: true }));
  };

  const getScore = () => {
    if (!quiz) return { correct: 0, total: 0, percent: 0 };

    const { multipleChoice, trueFalse } = parseQuizContent(quiz.content);
    let correct = 0;
    let total = 0;

    multipleChoice.forEach((q, idx) => {
      total++;
      if (selectedAnswers[`mc-${idx}`] === q.correctAnswer) {
        correct++;
      }
    });

    trueFalse.forEach((q, idx) => {
      total++;
    });

    return {
      correct,
      total,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-not-found">
        <h2>测验未找到</h2>
        <p>"{decodedKpId}" 的测验尚未生成。</p>
        <Link to="/" className="btn btn-primary">返回学习台</Link>
      </div>
    );
  }

  const { multipleChoice, shortAnswer, trueFalse } = parseQuizContent(quiz.content);
  const score = getScore();

  return (
    <div className="quiz-viewer">
      {/* Breadcrumb */}
      <nav className="breadcrumb animate-in">
        <Link to="/">Dashboard</Link>
        <ChevronRight size={14} />
        <Link to="/">Dashboard</Link>
        <ChevronRight size={14} />
        <span>测验：{decodedKpId}</span>
      </nav>

      {/* Header */}
      <header className="quiz-header animate-in animate-delay-1">
        <div className="quiz-meta">
          <span className="kp-badge">{decodedKpId}</span>
        </div>
        <h1>{quiz.title || '知识测验'}</h1>
        <p className="quiz-subtitle">
          检验你对本课涵盖概念的理解。
        </p>
      </header>

      {/* Score Summary */}
      <div className="score-summary card animate-in animate-delay-2">
        <div className="score-circle">
          <span className="score-percent">{score.percent}%</span>
        </div>
        <div className="score-details">
          <h3>{score.percent >= 80 ? '优秀！' : score.percent >= 60 ? '不错的进步' : '继续学习'}</h3>
          <p>{score.correct} / {score.total} 题正确</p>
        </div>
      </div>

      {/* Multiple Choice */}
      {multipleChoice.length > 0 && (
        <section className="quiz-section animate-in animate-delay-2">
          <h2>
            <HelpCircle size={20} />
            选择题
          </h2>
          <div className="questions-list">
            {multipleChoice.map((q, qIdx) => {
              const isRevealed = revealedQuestions[`mc-${qIdx}`];
              const userAnswer = selectedAnswers[`mc-${qIdx}`];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={qIdx} className={`question-card ${isRevealed ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
                  <p className="question-text">
                    <span className="question-num">{qIdx + 1}.</span>
                    {q.question}
                  </p>
                  <div className="options-list">
                    {q.options.map(opt => {
                      const isSelected = userAnswer === opt.label;
                      const isCorrectOption = opt.label === q.correctAnswer;
                      const showCorrect = showAnswers && isCorrectOption;
                      const showIncorrect = isRevealed && isSelected && !isCorrect;

                      return (
                        <button
                          key={opt.label}
                          className={`option-btn ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct-answer' : ''} ${showIncorrect ? 'wrong-answer' : ''}`}
                          onClick={() => handleMCAnswer(qIdx, opt.label)}
                          disabled={isRevealed}
                        >
                          <span className="option-label">{opt.label}</span>
                          <span className="option-text">{opt.text}</span>
                          {showCorrect && <CheckCircle size={18} className="option-icon" />}
                          {showIncorrect && <XCircle size={18} className="option-icon" />}
                        </button>
                      );
                    })}
                  </div>
                  {isRevealed && !showAnswers && (
                    <p className="feedback-text">
                      {isCorrect ? (
                        <span className="correct-text">✓ 正确！</span>
                      ) : (
                        <span className="incorrect-text">
                          ✗ 错误。正确答案是 {q.correctAnswer}。
                        </span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* True/False */}
      {trueFalse.length > 0 && (
        <section className="quiz-section animate-in animate-delay-3">
          <h2>
            <CheckCircle size={20} />
            判断题
          </h2>
          <div className="questions-list">
            {trueFalse.map((q, qIdx) => (
              <div key={qIdx} className="question-card tf-question">
                <p className="question-text">
                  <span className="question-num">{qIdx + 1}.</span>
                  {q.question}
                </p>
                <div className="tf-buttons">
                  <button
                    className="tf-btn"
                    onClick={() => setRevealedQuestions(prev => ({ ...prev, [`tf-${qIdx}`]: true }))}
                  >
                    正确
                  </button>
                  <button
                    className="tf-btn"
                    onClick={() => setRevealedQuestions(prev => ({ ...prev, [`tf-${qIdx}`]: true }))}
                  >
                    错误
                  </button>
                </div>
                {showAnswers && (
                  <p className="answer-reveal">
                    答案：<strong>{q.answer}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Short Answer */}
      {shortAnswer.length > 0 && (
        <section className="quiz-section animate-in animate-delay-4">
          <h2>
            <HelpCircle size={20} />
            简答题
          </h2>
          <div className="questions-list">
            {shortAnswer.map((q, qIdx) => (
              <div key={qIdx} className="question-card">
                <p className="question-text">
                  <span className="question-num">{qIdx + 1}.</span>
                  {q}
                </p>
                <textarea
                  className="short-answer-input"
                  placeholder="在此输入你的答案..."
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="quiz-actions">
        <button
          className="btn btn-secondary"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
          {showAnswers ? '隐藏答案' : '显示答案'}
        </button>
        <Link to={`/lesson/${kpId}`} className="btn btn-primary">
          复习备课
        </Link>
      </div>
    </div>
  );
}
