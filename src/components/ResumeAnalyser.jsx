import React, { useState, useEffect } from 'react';
import { analyzeResume, matchJobDescription } from '../utils/analyzer';

export default function ResumeAnalyser({ resume }) {
  const [atsResult, setAtsResult] = useState({ score: 0, breakdown: {}, recommendations: [] });
  const [jdText, setJdText] = useState('');
  const [matchResult, setMatchResult] = useState(null);

  // Recalculate ATS score whenever the resume content changes
  useEffect(() => {
    const analysis = analyzeResume(resume);
    setAtsResult(analysis);
    
    // Recalculate JD match if a JD is already inputted
    if (jdText.trim()) {
      const match = matchJobDescription(resume, jdText);
      setMatchResult(match);
    }
  }, [resume, jdText]);

  const handleMatchCheck = () => {
    if (!jdText.trim()) return;
    const match = matchJobDescription(resume, jdText);
    setMatchResult(match);
  };

  // Circular progress stroke offset calculations (circumference = 2 * pi * r = 2 * 3.14 * 50 = 314)
  const getCircleOffset = (val) => {
    const limit = Math.max(0, Math.min(100, val));
    return 314 - (limit / 100) * 314;
  };

  return (
    <div className="analyser-container container">
      {/* LEFT COLUMN: ATS SCORE & AUDIT */}
      <div className="score-panel">
        <div className="glass glow" style={{ padding: '2rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>ATS Audit Report</h2>
          
          <div className="score-circle-wrapper">
            <svg className="score-svg" viewBox="0 0 120 120">
              <circle className="score-svg-bg" cx="60" cy="60" r="50" />
              <circle 
                className="score-svg-bar" 
                cx="60" 
                cy="60" 
                r="50" 
                strokeDasharray="314"
                strokeDashoffset={getCircleOffset(atsResult.score)}
                style={{ stroke: atsResult.score >= 80 ? 'var(--accent-success)' : atsResult.score >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}
              />
            </svg>
            <div className="score-value">{atsResult.score}</div>
            <div className="score-label">Overall ATS Score</div>
            <div className="score-status">
              {atsResult.score >= 80 ? 'Excellent Formatting & Impact' : atsResult.score >= 50 ? 'Needs Alignment Optimization' : 'Incomplete Sections Found'}
            </div>
          </div>

          <div className="factor-list">
            <div className="factor-item">
              <span className="factor-name">Section Completeness</span>
              <div className="factor-score-bar-group">
                <div className="factor-score-bar">
                  <div className="factor-score-fill" style={{ width: `${(atsResult.breakdown.completeness / 25) * 100}%`, background: 'var(--accent)' }} />
                </div>
                <span className="factor-score-value">{atsResult.breakdown.completeness}/25</span>
              </div>
            </div>

            <div className="factor-item">
              <span className="factor-name">High-Impact Verbs</span>
              <div className="factor-score-bar-group">
                <div className="factor-score-bar">
                  <div className="factor-score-fill" style={{ width: `${(atsResult.breakdown.actionVerbs / 25) * 100}%`, background: 'var(--accent)' }} />
                </div>
                <span className="factor-score-value">{atsResult.breakdown.actionVerbs}/25</span>
              </div>
            </div>

            <div className="factor-item">
              <span className="factor-name">Quantifiable Metrics</span>
              <div className="factor-score-bar-group">
                <div className="factor-score-bar">
                  <div className="factor-score-fill" style={{ width: `${(atsResult.breakdown.quantifiable / 25) * 100}%`, background: 'var(--accent)' }} />
                </div>
                <span className="factor-score-value">{atsResult.breakdown.quantifiable}/25</span>
              </div>
            </div>

            <div className="factor-item">
              <span className="factor-name">Formatting Standards</span>
              <div className="factor-score-bar-group">
                <div className="factor-score-bar">
                  <div className="factor-score-fill" style={{ width: `${(atsResult.breakdown.formatting / 25) * 100}%`, background: 'var(--accent)' }} />
                </div>
                <span className="factor-score-value">{atsResult.breakdown.formatting}/25</span>
              </div>
            </div>
          </div>
        </div>

        {/* ATS RECS PANEL */}
        <div className="glass glow" style={{ padding: '1.5rem', flexGrow: 1 }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 600 }}>Actionable Improvements</h3>
          {atsResult.recommendations.length > 0 ? (
            <div className="recommendations-list">
              {atsResult.recommendations.map((rec, i) => (
                <div key={i} className="rec-item">
                  <span className="rec-icon">⚡</span>
                  <span className="rec-text">{rec}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--accent-success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🎉</span>
              Your resume layout is fully complete, well formatted, and ATS audit compliant!
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: JOB DESCRIPTION MATCHING */}
      <div className="jd-panel">
        <div className="glass glow" style={{ padding: '2rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Job Description Keyword Matcher</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Paste the job posting description below. The matcher will extract core technologies and soft skills, cross-referencing them against your experience and achievements.
          </p>

          <textarea 
            className="form-textarea" 
            style={{ minHeight: '140px', marginBottom: '1rem' }} 
            value={jdText} 
            onChange={(e) => setJdText(e.target.value)} 
            placeholder="Paste target job description details here (e.g. 'We are looking for a React Developer with AWS, SQL, and 3+ years experience...')"
          />
          
          <button className="btn btn-primary" onClick={handleMatchCheck}>
            Analyze Job Match
          </button>
        </div>

        {matchResult && (
          <div className="glass glow" style={{ padding: '2rem 1.5rem', animation: 'slideUp var(--transition-fast)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div className="score-circle-wrapper" style={{ padding: 0 }}>
                <svg className="score-svg" viewBox="0 0 120 120">
                  <circle className="score-svg-bg" cx="60" cy="60" r="50" />
                  <circle 
                    className="score-svg-bar" 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    strokeDasharray="314"
                    strokeDashoffset={getCircleOffset(matchResult.score)}
                    style={{ stroke: matchResult.score >= 70 ? 'var(--accent-success)' : matchResult.score >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}
                  />
                </svg>
                <div className="score-value">{matchResult.score}%</div>
              </div>

              <div style={{ flexGrow: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>JD Match Score: {matchResult.score}%</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {matchResult.score >= 70 
                    ? 'Excellent job alignment! Your resume targets almost all major keywords.' 
                    : matchResult.score >= 40 
                    ? 'Moderate alignment. Add more extracted tech keywords to rank higher in searches.' 
                    : 'Low keyword alignment. Consider customizing your experience bullets.'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Matched Keywords ({matchResult.matchedKeywords.length})</h4>
              <div className="keywords-display-grid">
                {matchResult.matchedKeywords.length > 0 ? (
                  matchResult.matchedKeywords.map((kw, i) => (
                    <span key={i} className="keyword-tag keyword-tag-match">✓ {kw}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None matched yet.</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Missing Keywords ({matchResult.missingKeywords.length})</h4>
              <div className="keywords-display-grid">
                {matchResult.missingKeywords.length > 0 ? (
                  matchResult.missingKeywords.map((kw, i) => (
                    <span key={i} className="keyword-tag keyword-tag-missing">✗ {kw}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-success)' }}>No missing core keywords!</span>
                )}
              </div>
            </div>

            {matchResult.recommendations.length > 0 && (
              <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Tailoring Recommendations</h4>
                <div className="recommendations-list">
                  {matchResult.recommendations.map((rec, i) => (
                    <div key={i} className="rec-item">
                      <span className="rec-icon">🎯</span>
                      <span className="rec-text">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
