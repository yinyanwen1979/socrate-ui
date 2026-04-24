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
        <h2>Quiz not found</h2>
        <p>The quiz for "{decodedKpId}" hasn't been generated yet.</p>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
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
        <span>Quiz: {decodedKpId}</span>
      </nav>

      {/* Header */}
      <header className="quiz-header animate-in animate-delay-1">
        <div className="quiz-meta">
          <span className="kp-badge">{decodedKpId}</span>
        </div>
        <h1>{quiz.title || 'Knowledge Quiz'}</h1>
        <p className="quiz-subtitle">
          Test your understanding of the concepts covered in this lesson.
        </p>
      </header>

      {/* Score Summary */}
      <div className="score-summary card animate-in animate-delay-2">
        <div className="score-circle">
          <span className="score-percent">{score.percent}%</span>
        </div>
        <div className="score-details">
          <h3>{score.percent >= 80 ? 'Excellent!' : score.percent >= 60 ? 'Good Progress' : 'Keep Learning'}</h3>
          <p>{score.correct} of {score.total} questions correct</p>
        </div>
      </div>

      {/* Multiple Choice */}
      {multipleChoice.length > 0 && (
        <section className="quiz-section animate-in animate-delay-2">
          <h2>
            <HelpCircle size={20} />
            Multiple Choice
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
                        <span className="correct-text">✓ Correct!</span>
                      ) : (
                        <span className="incorrect-text">
                          ✗ Incorrect. The correct answer is {q.correctAnswer}.
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
            True / False
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
                    True
                  </button>
                  <button
                    className="tf-btn"
                    onClick={() => setRevealedQuestions(prev => ({ ...prev, [`tf-${qIdx}`]: true }))}
                  >
                    False
                  </button>
                </div>
                {showAnswers && (
                  <p className="answer-reveal">
                    Answer: <strong>{q.answer}</strong>
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
            Short Answer
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
                  placeholder="Write your answer here..."
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
          {showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}
        </button>
        <Link to={`/lesson/${kpId}`} className="btn btn-primary">
          Review Lesson
        </Link>
      </div>
    </div>
  );
}
