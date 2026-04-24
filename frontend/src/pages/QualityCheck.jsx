import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, FileText, Lightbulb } from 'lucide-react';
import { runQualityCheck } from '../api';
import './QualityCheck.css';

export default function QualityCheck() {
  const { topic } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (topic) {
      loadReport();
    }
  }, [topic]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runQualityCheck(decodeURIComponent(topic));
      setReport(res.data);
    } catch (err) {
      console.error('Failed to run quality check:', err);
      setError('Failed to run quality check. Make sure the outline exists.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <XCircle size={18} className="severity-critical" />;
      case 'high':
        return <AlertTriangle size={18} className="severity-high" />;
      case 'medium':
        return <AlertCircle size={18} className="severity-medium" />;
      default:
        return <CheckCircle size={18} className="severity-low" />;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'issue-critical';
      case 'high': return 'issue-high';
      case 'medium': return 'issue-medium';
      default: return 'issue-low';
    }
  };

  if (loading) {
    return (
      <div className="check-loading">
        <div className="spinner"></div>
        <p>正在分析你的大纲...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="check-error">
        <XCircle size={48} />
        <h2>质量检查失败</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">返回学习台</Link>
      </div>
    );
  }

  const coverage = report?.coverage || [];
  const issues = report?.issues || [];
  const recommendations = report?.recommendations || [];

  return (
    <div className="quality-check">
      <header className="check-header animate-in">
        <h1>质量检查报告</h1>
        <p className="check-topic">主题：{decodeURIComponent(topic)}</p>
      </header>

      {/* Coverage Table */}
      <section className="section animate-in animate-delay-1">
        <h2>覆盖率分析</h2>
        <div className="coverage-table-wrapper">
          <table className="coverage-table">
            <thead>
              <tr>
                <th>知识点</th>
                <th>备课</th>
                <th>测验</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {coverage.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">大纲中未找到知识点</td>
                </tr>
              ) : (
                coverage.map((item, idx) => (
                  <tr key={idx}>
                    <td className="kp-cell">
                      <span className="kp-id">{item.kp}</span>
                    </td>
                    <td className="status-cell">
                      {item.lesson === 'generated' ? (
                        <CheckCircle size={18} className="status-generated" />
                      ) : (
                        <XCircle size={18} className="status-missing" />
                      )}
                      <span className={item.lesson === 'generated' ? 'text-success' : 'text-muted'}>
                        {item.lesson === 'generated' ? '已生成' : '未生成'}
                      </span>
                    </td>
                    <td className="status-cell">
                      {item.quiz === 'generated' ? (
                        <CheckCircle size={18} className="status-generated" />
                      ) : (
                        <XCircle size={18} className="status-missing" />
                      )}
                      <span className={item.quiz === 'generated' ? 'text-success' : 'text-muted'}>
                        {item.quiz === 'generated' ? '已生成' : '未生成'}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Issues */}
      {issues.length > 0 && (
        <section className="section animate-in animate-delay-2">
          <h2>发现的问题</h2>
          <div className="issues-list">
            {issues.map((issue, idx) => (
              <div key={idx} className={`issue-card card ${getSeverityClass(issue.severity)}`}>
                <div className="issue-header">
                  {getSeverityIcon(issue.severity)}
                  <span className="issue-severity">{issue.severity}</span>
                  <span className="issue-type">{issue.type}</span>
                </div>
                <p className="issue-message">{issue.message}</p>
                {issue.location && (
                  <p className="issue-location">
                    <FileText size={14} />
                    {issue.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      <section className="section animate-in animate-delay-3">
        <h2>
          <Lightbulb size={20} />
          建议
        </h2>
        {recommendations.length === 0 ? (
          <div className="card recommendations-empty">
            <CheckCircle size={32} />
            <p>目前没有具体的建议。</p>
          </div>
        ) : (
          <ul className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="recommendation-item card">
                <span className="rec-num">{idx + 1}</span>
                <p>{rec}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Actions */}
      <div className="check-actions animate-in">
        <button className="btn btn-secondary" onClick={loadReport}>
          Re-run Check
        </button>
        <Link to="/" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
