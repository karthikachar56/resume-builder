import React from 'react';
import { analyzeResume } from '../utils/analyzer';

export default function Dashboard({ resume, setTab }) {
  // 1. Calculate live ATS metrics using the core analyzer helper
  const analysis = analyzeResume(resume);
  const atsScore = analysis.score || 0;
  const recommendations = analysis.recommendations || [];

  // 2. Calculate profile completeness percentage
  let completedSectionsCount = 0;
  const sectionsList = [
    { label: "Personal Details", isDone: !!resume?.personal?.name && !!resume?.personal?.email },
    { label: "Summary Statement", isDone: !!resume?.personal?.summary },
    { label: "Professional History", isDone: resume?.experience && resume?.experience.length > 0 },
    { label: "Educational History", isDone: resume?.education && resume?.education.length > 0 },
    { label: "Core Skills", isDone: resume?.skills && resume?.skills.length > 0 },
    { label: "Projects Portfolio", isDone: resume?.projects && resume?.projects.length > 0 }
  ];
  
  sectionsList.forEach(sec => {
    if (sec.isDone) completedSectionsCount++;
  });
  
  const completenessPercent = Math.round((completedSectionsCount / sectionsList.length) * 100);

  // 3. Define dashboard action routes
  const ACTION_HUB_CARDS = [
    {
      id: 'ai-builder',
      title: 'Conversational AI Creator',
      desc: 'Build a premium resume from scratch via a step-by-step chat interview. The A4 sheet templates format and edit themselves live.',
      icon: '🤖',
      badge: 'Interactive AI',
      badgeClass: 'badge-accent',
      btnText: 'Start Interview',
      tabName: 'ai-builder',
      primary: true
    },
    {
      id: 'builder',
      title: 'Document Workspace',
      desc: 'Fine-tune your resume sections, swap between layouts (including the PDF Replica template), and configure colors/fonts.',
      icon: '📝',
      badge: 'Manual Editor',
      badgeClass: 'badge-secondary',
      btnText: 'Open Workspace',
      tabName: 'builder',
      primary: false
    },
    {
      id: 'analyser',
      title: 'ATS Scanner & Matcher',
      desc: 'Scan your formatting rules, check action verb usage, and paste job listings to extract keyword score metrics.',
      icon: '🔍',
      badge: 'Resume Auditor',
      badgeClass: 'badge-success',
      btnText: 'Analyze Score',
      tabName: 'analyser',
      primary: false
    }
  ];

  return (
    <div className="dashboard-view container">
      {/* 1. HERO BANNER */}
      <div className="hero-section" style={{ marginBottom: '2.5rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.8rem' }}>Create Your ATS-Perfect Resume</h1>
        <p className="hero-subtitle" style={{ maxWidth: '650px' }}>
          Interactively build your resume using conversational AI creators, audit formatting against applicant tracking rules, and land more developer interviews.
        </p>
      </div>

      {/* 2. STATS & ANALYTICS PANELS */}
      <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Metric 1: Live ATS Score Dial */}
        <div className="glass glow metric-stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ATS Score Indicator</span>
            <span style={{ fontSize: '1.25rem' }}>🎯</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="radial-score-ring" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `conic-gradient(var(${atsScore >= 75 ? '--accent-success' : atsScore >= 50 ? '--accent-warning' : '--accent-danger'}) ${atsScore * 3.6}deg, var(--border-color) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div className="radial-score-inner" style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text-primary)'
              }}>
                {atsScore}%
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {atsScore >= 75 ? 'ATS Optimized' : atsScore >= 50 ? 'Needs Refinements' : 'Incomplete Profile'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                {atsScore >= 75 ? 'Looking great! Your layout and content density are optimized for recruiters.' : 'Add active verbs and achievements to improve scan rates.'}
              </p>
            </div>
          </div>
        </div>

        {/* Metric 2: Resume Completeness Meter */}
        <div className="glass glow metric-stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Profile Completeness</span>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
              <span>Sections Filled</span>
              <span>{completenessPercent}%</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              <div className="progress-bar-fill" style={{ height: '100%', width: `${completenessPercent}%`, background: 'var(--accent)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Completed {completedSectionsCount} of {sectionsList.length} critical resume fields.
            </p>
          </div>
        </div>

        {/* Metric 3: Data Summary Counts */}
        <div className="glass glow metric-stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workspace Summary</span>
            <span style={{ fontSize: '1.25rem' }}>📁</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', flexGrow: 1, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{resume.experience?.length || 0}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Jobs Listed</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{resume.projects?.length || 0}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Projects Done</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{resume.skills?.length || 0}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Skills Added</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{resume.education?.length || 0}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Degrees Saved</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. DYNAMIC ACTIONS HUB CONTAINER */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🚀</span> Workspace Hub Actions
      </h3>
      
      <div className="features-grid" style={{ marginBottom: '3rem' }}>
        {ACTION_HUB_CARDS.map((card) => (
          <div key={card.id} className="feature-card glass glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', transition: 'all var(--transition-fast)' }} onClick={() => setTab(card.tabName)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="feature-icon-wrapper" style={{ fontSize: '1.5rem' }}>
                {card.icon}
              </div>
              <span className={`badge ${card.badgeClass}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>
                {card.badge}
              </span>
            </div>
            
            <div style={{ flexGrow: 1 }}>
              <h3 className="feature-card-title" style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>{card.title}</h3>
              <p className="feature-card-description" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </div>
            
            <div className="feature-card-action" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: card.primary ? 'var(--accent)' : 'var(--text-primary)', marginTop: '0.5rem' }}>
              {card.btnText}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* 4. DYNAMIC ATS SCORE TIPS & AUDIT RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <div className="glass glow recommendations-panel" style={{ padding: '2rem', borderRadius: '1rem', borderLeft: '4px solid var(--accent)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span>💡</span> Live Recommendations to Boost ATS Rankings
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recommendations.map((rec, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
