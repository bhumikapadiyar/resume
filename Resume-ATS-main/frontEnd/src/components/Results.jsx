import React, { useState, useEffect } from 'react';
import './Results.css';

function getBarColor(score) {
  if (score >= 80) return 'var(--score-green, #10b981)';
  if (score >= 50) return 'var(--score-yellow, #f59e0b)';
  return 'var(--score-red, #ef4444)';
}

function getScoreBadge(score) {
  if (score >= 85) return { label: 'EXCEPTIONAL FIT', class: 'badge-high' };
  if (score >= 70) return { label: 'STRONG FIT', class: 'badge-medium-high' };
  if (score >= 50) return { label: 'MODERATE FIT', class: 'badge-medium' };
  return { label: 'CRITICAL GAPS', class: 'badge-low' };
}

export default function Results({ analysis, setActiveTab }) {
  const [keywordFilter, setKeywordFilter] = useState('all'); // 'all' | 'matched' | 'missing'
  const [keywordSearch, setKeywordSearch] = useState('');
  const [completedMoves, setCompletedMoves] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [toast, setToast] = useState('');
  const [displayScore, setDisplayScore] = useState(0);

  // Animated score counter
  useEffect(() => {
    if (!analysis || typeof analysis.score !== 'number') return;
    const target = analysis.score;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 25));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [analysis?.score]);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  if (!analysis) {
    return (
      <div className="empty-results">
        <span>◒</span>
        <h2>No report yet</h2>
        <p>Run your first resume analysis to see your score.</p>
        <button className="primary-button" onClick={() => setActiveTab('analyze')} type="button">
          Start an analysis →
        </button>
      </div>
    );
  }

  const matchedKeywords = analysis.keywords?.matched || [];
  const missingKeywords = analysis.keywords?.missing || [];
  const hasKeywords = matchedKeywords.length > 0 || missingKeywords.length > 0;
  const sections = analysis.sections || [];
  const strengths = analysis.strengths || [];
  const improvements = analysis.improvements || [];
  const scoreBadge = getScoreBadge(analysis.score ?? 0);

  const toggleMove = index => {
    setCompletedMoves(prev => {
      const next = { ...prev, [index]: !prev[index] };
      const count = Object.values(next).filter(Boolean).length;
      showToast(next[index] ? `✓ Marked improvement #${index + 1} done!` : `Undo improvement #${index + 1}`);
      return next;
    });
  };

  const copyReportSummary = () => {
    const summaryText = `Resumely ATS Analysis Report
ATS Signal Score: ${analysis.score}/100 (${scoreBadge.label})
Verdict: ${analysis.verdict}
Summary: ${analysis.summary}

Top Strengths:
${strengths.map(s => `• ${s}`).join('\n')}

Recommended Improvements:
${improvements.map(i => `• ${i}`).join('\n')}

Keywords: ${matchedKeywords.length} Matched, ${missingKeywords.length} Missing`;

    navigator.clipboard?.writeText(summaryText);
    showToast('✓ Full report summary copied to clipboard!');
  };

  const copyMissingKeywords = () => {
    if (!missingKeywords.length) return;
    navigator.clipboard?.writeText(missingKeywords.join(', '));
    showToast(`✓ Copied ${missingKeywords.length} missing keywords!`);
  };

  const copyKeyword = kw => {
    navigator.clipboard?.writeText(kw);
    showToast(`✓ Copied "${kw}"`);
  };

  const handlePrint = () => {
    window.print();
  };

  const completedCount = Object.values(completedMoves).filter(Boolean).length;

  const searchLower = keywordSearch.trim().toLowerCase();
  const filteredMatched = searchLower
    ? matchedKeywords.filter(k => k.toLowerCase().includes(searchLower))
    : matchedKeywords;
  const filteredMissing = searchLower
    ? missingKeywords.filter(k => k.toLowerCase().includes(searchLower))
    : missingKeywords;

  return (
    <div className="content results-content">
      {/* Interactive Toast Notification */}
      {toast && <div className="interactive-toast">{toast}</div>}

      <div className="results-heading">
        <div className="results-heading-left">
          <div className="results-eyebrow-row">
            <p className="eyebrow">
              ANALYSIS COMPLETE <span className="live-dot"></span>
            </p>
            <span className={`score-badge ${scoreBadge.class}`}>{scoreBadge.label}</span>
          </div>
          <h1>Your resume, decoded.</h1>
          <p className="intro-copy">
            A practical, ATS-calibrated breakdown of how your application scores against job requirements.
          </p>
        </div>

        <div className="results-heading-actions">
          <span className="source-pill">✦ GEMINI ANALYSIS</span>
          <div className="report-action-buttons">
            <button
              type="button"
              className="action-pill-button"
              onClick={copyReportSummary}
              title="Copy analysis summary to clipboard"
            >
              📋 Copy summary
            </button>
            <button
              type="button"
              className="action-pill-button print-button"
              onClick={handlePrint}
              title="Print or save as PDF"
            >
              🖨 Print / PDF
            </button>
          </div>
        </div>
      </div>

      <div className="score-layout">
        <section className="score-card">
          <div className="score-card-left">
            <div className="score-ring" style={{ '--score': `${(analysis.score || 0) * 3.6}deg`, '--ring-color': getBarColor(analysis.score || 0) }}>
              <div>
                <strong>{analysis.score ?? 0}</strong>
                <small>/100</small>
              </div>
            </div>
            <p className="score-label">ATS SIGNAL SCORE</p>
          </div>

          <div className="score-card-right">
            <div className="score-status-row">
              <span className={`score-badge ${scoreBadge.class}`}>{scoreBadge.label}</span>
              <span className="candidate-fit-pill">AI Calibrated</span>
            </div>
            <h2>{analysis.verdict}</h2>
            <p className="score-summary-text">{analysis.summary}</p>

            <div className="score-quick-stats">
              <span className="quick-stat-item">
                <i className="stat-icon">✓</i> {matchedKeywords.length} Matched Keywords
              </span>
              <span className="quick-stat-item">
                <i className="stat-icon">✓</i> {sections.length} Sections Evaluated
              </span>
              <span className="quick-stat-item">
                <i className="stat-icon">✦</i> Standard ATS Parser
              </span>
            </div>
          </div>
        </section>

        <section className="breakdown-card">
          <div className="card-top">
            <div>
              <span className="card-index">01</span>
              <h2>Signal breakdown</h2>
            </div>
            <span className="required">SCAN COMPLETE</span>
          </div>

          <p className="section-hint">Click any section row for detailed breakdown evaluation.</p>

          <div className="breakdown-list">
            {sections.map((section, index) => {
              const barScore = Math.min(Math.max(section.score || 0, 0), 100);
              const barColor = getBarColor(barScore);
              const isSelected = activeSection === index;
              return (
                <div
                  className={`bar-row ${isSelected ? 'bar-row-selected' : ''}`}
                  key={`${section.name}-${index}`}
                  onClick={() => setActiveSection(isSelected ? null : index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="bar-row-header">
                    <strong>
                      {section.name} <span className="accordion-arrow">{isSelected ? '▾' : '▸'}</span>
                    </strong>
                    <small>{section.note}</small>
                  </div>
                  <span style={{ color: barColor }}>{section.score}%</span>
                  <div className="bar">
                    <i style={{ width: `${barScore}%`, backgroundColor: barColor }}></i>
                  </div>
                  {isSelected && (
                    <div className="section-detail-bubble">
                      <span>Signal Evaluation:</span> {section.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="feedback-grid">
        <section className="feedback-card">
          <div className="feedback-card-header">
            <h3>
              <span className="good-icon">+</span> What’s working
            </h3>
            <span className="count-pill">{strengths.length}</span>
          </div>
          <div className="feedback-scroll-list">
            {strengths.length > 0 ? (
              strengths.map((item, index) => (
                <div className="feedback-item good-item" key={`strength-${index}`}>
                  <span className="item-bullet">✓</span>
                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p className="empty-notice">No specific strengths identified.</p>
            )}
          </div>
        </section>

        <section className="feedback-card">
          <div className="feedback-card-header">
            <div>
              <h3>
                <span className="fix-icon">!</span> Your next moves
              </h3>
              {improvements.length > 0 && (
                <small className="checklist-progress">
                  {completedCount}/{improvements.length} checked off
                </small>
              )}
            </div>
            <span className="count-pill">{improvements.length}</span>
          </div>

          <div className="feedback-scroll-list">
            {improvements.length > 0 ? (
              improvements.map((item, index) => {
                const isChecked = !!completedMoves[index];
                return (
                  <div
                    className={`feedback-item fix-item interactive-todo ${isChecked ? 'item-checked' : ''}`}
                    key={`improvement-${index}`}
                    onClick={() => toggleMove(index)}
                  >
                    <button type="button" className={`checklist-btn ${isChecked ? 'btn-checked' : ''}`}>
                      {isChecked ? '✓' : ''}
                    </button>
                    <p className={isChecked ? 'text-checked' : ''}>{item}</p>
                  </div>
                );
              })
            ) : (
              <p className="empty-notice">No immediate critical improvements needed.</p>
            )}
          </div>
        </section>

        <section className="feedback-card keywords">
          <div className="feedback-card-header">
            <h3>Keyword match</h3>
            <div className="keyword-filter-tabs">
              <button
                type="button"
                className={`filter-tab ${keywordFilter === 'all' ? 'active' : ''}`}
                onClick={() => setKeywordFilter('all')}
              >
                All ({matchedKeywords.length + missingKeywords.length})
              </button>
              <button
                type="button"
                className={`filter-tab tab-matched ${keywordFilter === 'matched' ? 'active' : ''}`}
                onClick={() => setKeywordFilter('matched')}
              >
                Matched ({matchedKeywords.length})
              </button>
              <button
                type="button"
                className={`filter-tab tab-missing ${keywordFilter === 'missing' ? 'active' : ''}`}
                onClick={() => setKeywordFilter('missing')}
              >
                Missing ({missingKeywords.length})
              </button>
            </div>
          </div>

          {/* Interactive Search & Quick Actions */}
          <div className="keyword-search-bar">
            <input
              type="text"
              placeholder="🔍 Filter keywords..."
              value={keywordSearch}
              onChange={e => setKeywordSearch(e.target.value)}
              className="keyword-search-field"
            />
            {missingKeywords.length > 0 && (
              <button
                type="button"
                className="copy-missing-btn"
                onClick={copyMissingKeywords}
                title="Copy all missing keywords to clipboard"
              >
                Copy missing
              </button>
            )}
          </div>

          <div className="keyword-scroll-container">
            {hasKeywords ? (
              <div className="keyword-pills-wrap">
                {filteredMatched.map((keyword, index) => (
                  <span
                    className="keyword matched"
                    key={`matched-${keyword}-${index}`}
                    onClick={() => copyKeyword(keyword)}
                    title="Click to copy keyword"
                    style={{ display: keywordFilter === 'missing' ? 'none' : 'inline-block', cursor: 'pointer' }}
                  >
                    {keyword} ✓
                  </span>
                ))}
                {filteredMissing.map((keyword, index) => (
                  <span
                    className="keyword missing"
                    key={`missing-${keyword}-${index}`}
                    onClick={() => copyKeyword(keyword)}
                    title="Click to copy keyword"
                    style={{ display: keywordFilter === 'matched' ? 'none' : 'inline-block', cursor: 'pointer' }}
                  >
                    {keyword} +
                  </span>
                ))}
                {filteredMatched.length === 0 && filteredMissing.length === 0 && (
                  <p className="empty-notice">No keywords matching "{keywordSearch}"</p>
                )}
              </div>
            ) : (
              <p className="empty-notice">
                Add a target job description to see tailored keyword matching.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="results-footer">
        <button className="text-button" onClick={() => setActiveTab('analyze')} type="button">
          ← Analyze another version
        </button>
      </div>
    </div>
  );
}
