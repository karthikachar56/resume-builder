import React, { useState, useEffect } from 'react';
import { analyzeResume, matchJobDescription } from '../utils/analyzer';
import { analyzeUploadedResume, getSimulatedUploadAnalysis } from '../utils/aiService';

export default function ResumeAnalyser({ resume, updateResume, setTab }) {
  const [activeMode, setActiveMode] = useState('workspace'); // workspace, upload
  const [atsResult, setAtsResult] = useState({ score: 0, breakdown: {}, recommendations: [] });
  const [jdText, setJdText] = useState('');
  const [matchResult, setMatchResult] = useState(null);

  // States for file upload mode
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [aiScanResult, setAiScanResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  // Sync API Key from local storage on mount, and clean up the old invalid key
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const isOldInvalidKey = savedKey && savedKey.startsWith('AQ.Ab8RN6IJr79i_Q1DW') && savedKey.length > 40;
    
    if (isOldInvalidKey) {
      localStorage.removeItem('gemini_api_key');
      setCustomApiKey('');
    } else if (savedKey) {
      setCustomApiKey(savedKey);
    }
  }, []);

  // Recalculate ATS score whenever the resume content changes or mode switches
  useEffect(() => {
    if (activeMode === 'workspace') {
      const analysis = analyzeResume(resume);
      setAtsResult(analysis);
      
      // Recalculate JD match if a JD is already inputted
      if (jdText.trim()) {
        const match = matchJobDescription(resume, jdText);
        setMatchResult(match);
      } else {
        setMatchResult(null);
      }
    } else {
      // In upload mode, use the parsed resume for JD matching calculations
      if (aiScanResult && aiScanResult.extractedResume && jdText.trim()) {
        const match = matchJobDescription(aiScanResult.extractedResume, jdText);
        setMatchResult(match);
      } else {
        setMatchResult(null);
      }
    }
  }, [resume, jdText, activeMode, aiScanResult]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setScanError('');
    setIsScanning(true);
    setAiScanResult(null);
    setUploadedFileName(file.name);

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');

      if (!isPdf && !isTxt) {
        throw new Error('Only PDF and TXT files are supported.');
      }

      const reader = new FileReader();

      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File reading failed.'));
        if (isPdf) {
          reader.readAsDataURL(file); // base64 data url
        } else {
          reader.readAsText(file); // raw text string
        }
      });

      const apiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY;

      let result;
      if (!apiKey) {
        // Run in simulated fallback mode
        result = await getSimulatedUploadAnalysis(file.name);
      } else {
        // Run live Gemini API analysis
        result = await analyzeUploadedResume(apiKey, fileData, file.type, isPdf);
      }

      setAiScanResult(result);
    } catch (err) {
      console.error(err);
      setScanError(err.message || 'Failed to scan the resume file.');
      setUploadedFileName('');
    } finally {
      setIsScanning(false);
    }
  };

  const handleImport = () => {
    if (aiScanResult && aiScanResult.extractedResume) {
      updateResume(aiScanResult.extractedResume);
      setTab('builder'); // Navigate back to the editor workspace
    }
  };

  const resetUpload = () => {
    setAiScanResult(null);
    setUploadedFileName('');
    setScanError('');
  };

  const handleMatchCheck = () => {
    if (!jdText.trim()) return;
    const targetResume = activeMode === 'workspace' ? resume : (aiScanResult ? aiScanResult.extractedResume : null);
    if (!targetResume) return;
    const match = matchJobDescription(targetResume, jdText);
    setMatchResult(match);
  };

  // Circular progress stroke offset calculations
  const getCircleOffset = (val) => {
    const limit = Math.max(0, Math.min(100, val));
    return 314 - (limit / 100) * 314;
  };

  // Choose which score result object to display on the left panel
  const displayScore = activeMode === 'workspace' ? atsResult.score : (aiScanResult ? aiScanResult.score : 0);
  const displayBreakdown = activeMode === 'workspace' ? atsResult.breakdown : (aiScanResult ? aiScanResult.breakdown : { completeness: 0, actionVerbs: 0, quantifiable: 0, formatting: 0 });
  const displayRecs = activeMode === 'workspace' ? atsResult.recommendations : (aiScanResult ? aiScanResult.recommendations : []);

  return (
    <div className="analyser-container container">
      {/* 0. TAB MODE SWITCH SELECTORS */}
      <div className="workspace-sub-tabs" style={{ gridColumn: '1 / -1', marginBottom: '0.5rem', display: 'flex', gap: '0.75rem' }}>
        <button 
          className={`workspace-sub-tab ${activeMode === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveMode('workspace')}
        >
          📋 Scan Current Workspace
        </button>
        <button 
          className={`workspace-sub-tab ${activeMode === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveMode('upload')}
        >
          📤 Upload & AI Scan File
        </button>
      </div>

      {/* LEFT COLUMN: ATS SCORE & AUDIT */}
      <div className="score-panel">
        {activeMode === 'upload' && !aiScanResult && !isScanning ? (
          <div className="glass glow empty-upload-placeholder" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>📤</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>External AI Scan Mode</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '300px' }}>
              Drag and drop any PDF or TXT resume into the scanner on the right to perform a complete live AI ATS audit.
            </p>
          </div>
        ) : (
          <>
            <div className="glass glow" style={{ padding: '2rem 1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                {activeMode === 'workspace' ? 'Workspace ATS Report' : 'AI Upload ATS Report'}
              </h2>
              
              <div className="score-circle-wrapper">
                <svg className="score-svg" viewBox="0 0 120 120">
                  <circle className="score-svg-bg" cx="60" cy="60" r="50" />
                  <circle 
                    className="score-svg-bar" 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    strokeDasharray="314"
                    strokeDashoffset={getCircleOffset(displayScore)}
                    style={{ stroke: displayScore >= 80 ? 'var(--accent-success)' : displayScore >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}
                  />
                </svg>
                <div className="score-value">{displayScore}</div>
                <div className="score-label">Overall ATS Score</div>
                <div className="score-status">
                  {displayScore >= 80 ? 'Excellent Formatting & Impact' : displayScore >= 50 ? 'Needs Alignment Optimization' : 'Incomplete Sections Found'}
                </div>
              </div>

              <div className="factor-list">
                <div className="factor-item">
                  <span className="factor-name">Section Completeness</span>
                  <div className="factor-score-bar-group">
                    <div className="factor-score-bar">
                      <div className="factor-score-fill" style={{ width: `${(displayBreakdown.completeness / 25) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="factor-score-value">{displayBreakdown.completeness}/25</span>
                  </div>
                </div>

                <div className="factor-item">
                  <span className="factor-name">High-Impact Verbs</span>
                  <div className="factor-score-bar-group">
                    <div className="factor-score-bar">
                      <div className="factor-score-fill" style={{ width: `${(displayBreakdown.actionVerbs / 25) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="factor-score-value">{displayBreakdown.actionVerbs}/25</span>
                  </div>
                </div>

                <div className="factor-item">
                  <span className="factor-name">Quantifiable Metrics</span>
                  <div className="factor-score-bar-group">
                    <div className="factor-score-bar">
                      <div className="factor-score-fill" style={{ width: `${(displayBreakdown.quantifiable / 25) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="factor-score-value">{displayBreakdown.quantifiable}/25</span>
                  </div>
                </div>

                <div className="factor-item">
                  <span className="factor-name">Formatting Standards</span>
                  <div className="factor-score-bar-group">
                    <div className="factor-score-bar">
                      <div className="factor-score-fill" style={{ width: `${(displayBreakdown.formatting / 25) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="factor-score-value">{displayBreakdown.formatting}/25</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ATS RECS PANEL */}
            <div className="glass glow" style={{ padding: '1.5rem', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 600 }}>Actionable Improvements</h3>
              {displayRecs.length > 0 ? (
                <div className="recommendations-list">
                  {displayRecs.map((rec, i) => (
                    <div key={i} className="rec-item">
                      <span className="rec-icon">⚡</span>
                      <span className="rec-text">{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--accent-success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🎉</span>
                  This resume is fully structured, complete, and ATS compliant!
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* RIGHT COLUMN: JOB DESCRIPTION MATCHING & UPLOADER */}
      <div className="jd-panel">
        {activeMode === 'upload' && (
          <div className="glass glow" style={{ padding: '2rem 1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Upload External Resume</h2>
              <button 
                className="chat-settings-btn" 
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.7rem', cursor: 'pointer' }}
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? "Hide Key ✖" : "Settings ⚙"}
              </button>
            </div>

            {showApiKey && (
              <div className="glass" style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  Save your custom Google Gemini API Key below, or clear it to use the workspace's default key from <code>.env</code>.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="password"
                    className="form-input"
                    style={{ flexGrow: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                    placeholder="Enter custom Gemini API key..."
                    value={customApiKey}
                    onChange={handleApiKeyChange}
                  />
                  {customApiKey && (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={clearApiKey}
                      style={{ padding: '0.35rem 0.5rem' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Upload your existing PDF or plain text resume. Our AI model will extract structural content nodes, identify contact fields, and perform a complete ATS audit.
            </p>

            {/* Drop Zone Component */}
            {!aiScanResult && !isScanning && (
              <div 
                className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="resume-file-input" 
                  style={{ display: 'none' }} 
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div className="upload-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Drag & drop your resume file here or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports PDF and TXT documents up to 10MB</p>
                </label>
              </div>
            )}

            {/* Loading Scan State */}
            {isScanning && (
              <div className="file-scanning-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem', background: 'rgba(99, 102, 241, 0.03)', border: '1px dashed var(--accent)', borderRadius: '0.75rem' }}>
                <div className="scanner-line-shimmer"></div>
                <div className="scanning-spinner"></div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>AI is scanning, parsing, and auditing "{uploadedFileName}"...</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This takes about 3-5 seconds</p>
              </div>
            )}

            {/* Success Upload Scan Report */}
            {aiScanResult && (
              <div className="scan-success-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>✅</span>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Successfully Scanned File</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{uploadedFileName}</p>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={resetUpload}>Scan New File</button>
                </div>

                <div className="glass" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-success)' }}>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    We have parsed and extracted all personal details, experiences, educational records, and tech skills. You can import this directly into the workspace to apply A4 templates.
                  </p>
                </div>

                <button className="btn btn-success" onClick={handleImport} style={{ alignSelf: 'flex-start' }}>
                  📥 Import Extracted Resume into Workspace
                </button>
              </div>
            )}

            {scanError && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: 'var(--accent-danger)', fontSize: '0.85rem', marginTop: '1rem' }}>
                ⚠ <strong>Scan Failed:</strong> {scanError}
              </div>
            )}
          </div>
        )}

        {/* JOB DESCRIPTION KEYWORD MATCHER */}
        {(!activeMode === 'upload' || aiScanResult) && (
          <div className="glass glow" style={{ padding: '2rem 1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Job Description Keyword Matcher</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Paste the job posting description below. The matcher will extract core technologies and soft skills, cross-referencing them against {activeMode === 'workspace' ? 'your workspace resume' : 'the uploaded resume'}.
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
        )}

        {matchResult && (
          <div className="glass glow" style={{ padding: '2rem 1.5rem', marginTop: '1rem', animation: 'slideUp var(--transition-fast)' }}>
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

