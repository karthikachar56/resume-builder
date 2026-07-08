import React from 'react';

export default function Dashboard({ resume, setTab }) {
  // Compute some quick stats if resume data exists
  const hasData = resume && (resume.personal?.name || resume.experience?.length > 0 || resume.skills?.length > 0);
  
  return (
    <div className="dashboard-view container">
      <div className="hero-section">
        <h1 className="hero-title">Craft an ATS-Optimized Resume</h1>
        <p className="hero-subtitle">
          Build a visually stunning resume, analyze it against core applicant tracking systems (ATS), and match it directly to your target job descriptions using rules and AI.
        </p>
      </div>

      {hasData && (
        <div className="glass glow" style={{ padding: '1.5rem 2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Welcome Back, {resume.personal.name || 'Professional'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Your resume contains {resume.experience?.length || 0} experience entries, {resume.projects?.length || 0} projects, and {resume.skills?.length || 0} skills.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setTab('analyser')}>
              View ATS Score
            </button>
            <button className="btn btn-primary" onClick={() => setTab('builder')}>
              Resume Workspace
            </button>
          </div>
        </div>
      )}

      <div className="features-grid">
        {/* Card 1: Resume Builder */}
        <div className="feature-card glass glow" onClick={() => setTab('builder')}>
          <div className="feature-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 className="feature-card-title">Interactive Resume Workspace</h3>
          <p className="feature-card-description">
            Build your resume section-by-section. Choose from premium templates, customize font sizes, colors, and layouts in real-time, then export directly to PDF.
          </p>
          <div className="feature-card-action">
            Open Builder
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>

        {/* Card 2: ATS Analyser */}
        <div className="feature-card glass glow" onClick={() => setTab('analyser')}>
          <div className="feature-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <h3 className="feature-card-title">ATS Resume Scanner</h3>
          <p className="feature-card-description">
            Scan your resume against critical ATS filtering rules. Checks formatting standards, content sections, action verb density, and quantifiable results.
          </p>
          <div className="feature-card-action">
            Scan Resume
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>

        {/* Card 3: Job Matcher */}
        <div className="feature-card glass glow" onClick={() => setTab('analyser')}>
          <div className="feature-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m4.93 4.93 4.24 4.24"></path>
              <path d="m14.83 9.17 4.24-4.24"></path>
              <path d="m14.83 14.83 4.24 4.24"></path>
              <path d="m9.17 14.83-4.24 4.24"></path>
            </svg>
          </div>
          <h3 className="feature-card-title">Job Description Matching</h3>
          <p className="feature-card-description">
            Paste target job postings to compare keywords. Identify critical skills, technologies, and action verbs missing from your current resume.
          </p>
          <div className="feature-card-action">
            Match Keywords
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
