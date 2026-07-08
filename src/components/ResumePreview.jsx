import React, { useState } from 'react';

/**
 * Deterministic height-estimation function partitioning resume data into distinct A4 page objects
 */
function partitionResume(resume, template) {
  const pages = [];
  
  // A4 height = 297mm. With 20mm padding top and bottom (40mm total),
  // the budget is 257mm. We use 230mm for safe, unclipped formatting.
  const PAGE_BUDGET = 230; 
  
  let currentPageIndex = 0;
  let currentHeight = 0;
  
  let currentPage = {
    pageIndex: 0,
    personal: resume.personal, // Header & summary go to Page 1
    skills: resume.skills,
    experience: [],
    projects: [],
    education: [],
    showExperienceHeader: false,
    showProjectsHeader: false,
    showEducationHeader: false,
    showSkillsHeader: resume.skills && resume.skills.length > 0
  };
  
  // Estimate baseline Header + Summary height on Page 1
  let headerHeight = 45;
  if (template === 'executive') headerHeight = 55;
  if (template === 'tech') headerHeight = 40;
  if (template === 'creative') headerHeight = 0; // Creative places personal details in a side column
  
  let summaryHeight = 0;
  if (resume.personal?.summary) {
    summaryHeight = Math.max(15, Math.ceil(resume.personal.summary.length / 85) * 5);
  }
  
  let skillsHeight = 0;
  if (resume.skills && resume.skills.length > 0 && template !== 'creative') {
    skillsHeight = Math.max(10, Math.ceil(resume.skills.length / 5) * 6);
  }
  
  currentHeight = headerHeight + summaryHeight + skillsHeight;
  
  const createNewPage = () => {
    pages.push(currentPage);
    currentPageIndex++;
    currentPage = {
      pageIndex: currentPageIndex,
      personal: null, // Subsequent pages don't repeat the main header
      skills: null,
      experience: [],
      projects: [],
      education: [],
      showExperienceHeader: false,
      showProjectsHeader: false,
      showEducationHeader: false,
      showSkillsHeader: false
    };
    currentHeight = 0; // Reset height budget
  };
  
  // 1. Partition WORK EXPERIENCE
  if (resume.experience && resume.experience.length > 0) {
    let headerAdded = false;
    
    resume.experience.forEach((exp) => {
      const descLength = exp.description ? exp.description.length : 0;
      const itemHeight = 20 + Math.ceil(descLength / 80) * 5.2; // mm
      
      const headerSpace = headerAdded ? 0 : 15;
      if (currentHeight + itemHeight + headerSpace > PAGE_BUDGET && currentHeight > 50) {
        createNewPage();
        headerAdded = false;
      }
      
      if (!headerAdded) {
        currentPage.showExperienceHeader = true;
        headerAdded = true;
        currentHeight += 15;
      }
      
      currentPage.experience.push(exp);
      currentHeight += itemHeight;
    });
  }
  
  // 2. Partition PROJECTS
  if (resume.projects && resume.projects.length > 0) {
    let headerAdded = false;
    
    resume.projects.forEach((proj) => {
      const descLength = proj.description ? proj.description.length : 0;
      const itemHeight = 15 + Math.ceil(descLength / 80) * 5.2; // mm
      
      const headerSpace = headerAdded ? 0 : 15;
      if (currentHeight + itemHeight + headerSpace > PAGE_BUDGET && currentHeight > 50) {
        createNewPage();
        headerAdded = false;
      }
      
      if (!headerAdded) {
        currentPage.showProjectsHeader = true;
        headerAdded = true;
        currentHeight += 15;
      }
      
      currentPage.projects.push(proj);
      currentHeight += itemHeight;
    });
  }
  
  // 3. Partition EDUCATION
  if (resume.education && resume.education.length > 0) {
    let headerAdded = false;
    
    resume.education.forEach((edu) => {
      const itemHeight = 15; // mm
      
      const headerSpace = headerAdded ? 0 : 15;
      if (currentHeight + itemHeight + headerSpace > PAGE_BUDGET && currentHeight > 50) {
        createNewPage();
        headerAdded = false;
      }
      
      if (!headerAdded) {
        currentPage.showEducationHeader = true;
        headerAdded = true;
        currentHeight += 15;
      }
      
      currentPage.education.push(edu);
      currentHeight += itemHeight;
    });
  }
  
  pages.push(currentPage);
  return pages;
}

export default function ResumePreview({ resume, updateResume }) {
  const [template, setTemplate] = useState('modern'); // modern, creative, executive, tech
  const [zoom, setZoom] = useState(1.0);
  const [font, setFont] = useState('sans'); // sans, serif, mon
  const [margin, setMargin] = useState('normal'); // compact, normal, wide
  const [accentColor, setAccentColor] = useState('#4f46e5'); // indigo-600 default

  const cleanLink = (url) => {
    if (!url) return '';
    return url.replace(/^(https?:\/\/)?(www\.)?/, '');
  };

  const getSheetStyle = () => {
    let fontStyle = 'var(--font-sans)';
    if (font === 'serif') fontStyle = 'var(--font-serif)';
    if (font === 'mon') fontStyle = 'var(--font-mono)';

    let paddingValue = '20mm';
    if (margin === 'compact') paddingValue = '12mm';
    if (margin === 'wide') paddingValue = '28mm';

    return {
      transform: `scale(${zoom})`,
      fontFamily: fontStyle,
      padding: paddingValue,
      '--accent': accentColor
    };
  };

  const handlePrint = () => {
    window.print();
  };



  // Run our dynamic partitioning algorithm
  const pages = partitionResume(resume, template);

  return (
    <>
      {/* 1. Preview Controls Header */}
      <div className="preview-controls">
        <div className="control-group">
          <label className="control-label">Template</label>
          <select className="form-select btn-sm" style={{ padding: '0.35rem 0.5rem' }} value={template} onChange={(e) => setTemplate(e.target.value)}>
            <option value="modern">Modern Slate</option>
            <option value="creative">Creative Coral</option>
            <option value="executive">Executive Ivory</option>
            <option value="tech">Tech Minimal</option>
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Accent</label>
          <input type="color" style={{ width: '28px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }} value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
        </div>

        <div className="control-group">
          <label className="control-label">Font</label>
          <select className="form-select btn-sm" style={{ padding: '0.35rem 0.5rem' }} value={font} onChange={(e) => setFont(e.target.value)}>
            <option value="sans">Clean Sans</option>
            <option value="serif">Classic Serif</option>
            <option value="mon">Tech Monospace</option>
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Margins</label>
          <select className="form-select btn-sm" style={{ padding: '0.35rem 0.5rem' }} value={margin} onChange={(e) => setMargin(e.target.value)}>
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>

        <div className="control-group" style={{ flexGrow: 1, maxWidth: '140px' }}>
          <label className="control-label">Zoom</label>
          <input type="range" min="1.0" max="1.3" step="0.05" style={{ width: '100%' }} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
        </div>



        <button className="btn btn-success btn-sm" onClick={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Download PDF
        </button>
      </div>

      {/* 2. Scrollable Canvas Sheet Stack */}
      <div className="preview-container-wrapper">
        {pages.map((pageData, pIdx) => (
          <React.Fragment key={pIdx}>
            
            {/* Modern Template */}
            {template === 'modern' && (
              <div className="resume-sheet template-modern" style={getSheetStyle()}>
                {pageData.personal && (
                  <div className="r-header">
                    <h1 className="r-name" style={{ color: accentColor }}>{resume.personal.name || 'John Doe'}</h1>
                    <p className="r-title" style={{ color: accentColor }}>{resume.personal.title || 'Your Professional Title'}</p>
                    <div className="r-contact">
                      {resume.personal.email && <span>📧 {resume.personal.email}</span>}
                      {resume.personal.phone && <span>📞 {resume.personal.phone}</span>}
                      {resume.personal.location && <span>📍 {resume.personal.location}</span>}
                      {resume.personal.website && <span>🌐 <a href={resume.personal.website} target="_blank" rel="noreferrer">{cleanLink(resume.personal.website)}</a></span>}
                      {resume.personal.linkedin && <span>🔗 <a href={resume.personal.linkedin} target="_blank" rel="noreferrer">{cleanLink(resume.personal.linkedin)}</a></span>}
                      {resume.personal.github && <span>💻 <a href={resume.personal.github} target="_blank" rel="noreferrer">{cleanLink(resume.personal.github)}</a></span>}
                    </div>
                  </div>
                )}

                {pageData.pageIndex > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '1.25rem' }}>
                    <span>{resume.personal.name || 'Resume'}</span>
                    <span>Page {pageData.pageIndex + 1}</span>
                  </div>
                )}

                {pageData.personal?.summary && (
                  <div className="r-section">
                    <h2 className="r-section-title" style={{ borderBottomColor: `${accentColor}22` }}>Profile</h2>
                    <p style={{ fontSize: '9pt', color: '#475569', lineHeight: 1.6 }}>{pageData.personal.summary}</p>
                  </div>
                )}

                {pageData.experience && pageData.experience.length > 0 && (
                  <div className="r-section">
                    {pageData.showExperienceHeader && (
                      <h2 className="r-section-title" style={{ borderBottomColor: `${accentColor}22` }}>
                        Experience {pageData.pageIndex > 0 ? '(Continued)' : ''}
                      </h2>
                    )}
                    {pageData.experience.map((exp, index) => (
                      <div key={index} className="r-experience-item">
                        <div className="r-item-header">
                          <span>{exp.role || 'Job Role'}</span>
                          <span>{exp.startDate || 'Start'} — {exp.endDate || 'End'}</span>
                        </div>
                        <div className="r-item-sub" style={{ color: accentColor }}>
                          <span>{exp.company || 'Company'}</span>
                          <span>{exp.location || ''}</span>
                        </div>
                        {exp.description && (
                          <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageData.projects && pageData.projects.length > 0 && (
                  <div className="r-section">
                    {pageData.showProjectsHeader && (
                      <h2 className="r-section-title" style={{ borderBottomColor: `${accentColor}22` }}>
                        Projects {pageData.pageIndex > 0 ? '(Continued)' : ''}
                      </h2>
                    )}
                    {pageData.projects.map((proj, index) => (
                      <div key={index} className="r-project-item">
                        <div className="r-item-header">
                          <span>{proj.name || 'Project Name'}</span>
                          <span>{proj.date || ''}</span>
                        </div>
                        <div className="r-item-sub" style={{ color: accentColor }}>
                          <span>{proj.tech || 'Technologies'}</span>
                          {proj.link && <span><a href={proj.link} target="_blank" rel="noreferrer">{cleanLink(proj.link)}</a></span>}
                        </div>
                        {proj.description && (
                          <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageData.education && pageData.education.length > 0 && (
                  <div className="r-section">
                    {pageData.showEducationHeader && (
                      <h2 className="r-section-title" style={{ borderBottomColor: `${accentColor}22` }}>
                        Education {pageData.pageIndex > 0 ? '(Continued)' : ''}
                      </h2>
                    )}
                    {pageData.education.map((edu, index) => (
                      <div key={index} style={{ marginBottom: '0.75rem' }}>
                        <div className="r-item-header">
                          <span>{edu.degree || 'Degree'}</span>
                          <span>{edu.date || ''}</span>
                        </div>
                        <div className="r-item-sub" style={{ color: accentColor }}>
                          <span>{edu.school || 'School'}</span>
                          <span>{edu.gpa || ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pageData.skills && pageData.skills.length > 0 && (
                  <div className="r-section">
                    {pageData.showSkillsHeader && (
                      <h2 className="r-section-title" style={{ borderBottomColor: `${accentColor}22` }}>Skills</h2>
                    )}
                    <div className="r-skills-grid">
                      {pageData.skills.map((skill, index) => (
                        <span key={index} className="r-skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Creative Template */}
            {template === 'creative' && (
              <div className="resume-sheet template-creative" style={getSheetStyle()}>
                <div className="sidebar-col">
                  {pageData.personal ? (
                    <>
                      <div>
                        <h1 className="r-name">{resume.personal.name || 'John Doe'}</h1>
                        <p className="r-title" style={{ color: accentColor }}>{resume.personal.title || 'Software Engineer'}</p>
                      </div>

                      <div className="r-section">
                        <h3 className="r-section-title" style={{ borderBottomColor: accentColor }}>Contact</h3>
                        <div className="r-contact-list">
                          {resume.personal.email && <div>📧 {resume.personal.email}</div>}
                          {resume.personal.phone && <div>📞 {resume.personal.phone}</div>}
                          {resume.personal.location && <div>📍 {resume.personal.location}</div>}
                          {resume.personal.website && <div>🌐 <a href={resume.personal.website} target="_blank" rel="noreferrer">{cleanLink(resume.personal.website)}</a></div>}
                          {resume.personal.linkedin && <div>🔗 <a href={resume.personal.linkedin} target="_blank" rel="noreferrer">{cleanLink(resume.personal.linkedin)}</a></div>}
                          {resume.personal.github && <div>💻 <a href={resume.personal.github} target="_blank" rel="noreferrer">{cleanLink(resume.personal.github)}</a></div>}
                        </div>
                      </div>

                      {pageData.skills && pageData.skills.length > 0 && (
                        <div className="r-section">
                          <h3 className="r-section-title" style={{ borderBottomColor: accentColor }}>Skills</h3>
                          <div>
                            {pageData.skills.map((skill, index) => (
                              <span key={index} className="r-skill-tag" style={{ background: `${accentColor}11`, color: accentColor }}>{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '8pt', color: '#94a3b8' }}>
                      <span style={{ fontWeight: 700 }}>{resume.personal.name}</span>
                      <span>Page {pageData.pageIndex + 1}</span>
                    </div>
                  )}

                  {pageData.education && pageData.education.length > 0 && (
                    <div className="r-section">
                      <h3 className="r-section-title" style={{ borderBottomColor: accentColor }}>Education</h3>
                      {pageData.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '0.75rem', fontSize: '8.5pt' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{edu.degree || 'Degree'}</div>
                          <div style={{ color: '#475569' }}>{edu.school || 'School'}</div>
                          <div style={{ color: accentColor, fontWeight: '500' }}>{edu.date || ''}</div>
                          {edu.gpa && <div style={{ fontStyle: 'italic', fontSize: '8pt', color: '#64748b' }}>{edu.gpa}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="main-col">
                  {pageData.personal?.summary && (
                    <div className="r-section">
                      <h3 className="r-section-title" style={{ borderBottomColor: accentColor }}>Profile</h3>
                      <p style={{ fontSize: '9pt', color: '#334155', lineHeight: 1.5 }}>{pageData.personal.summary}</p>
                    </div>
                  )}

                  {pageData.experience && pageData.experience.length > 0 && (
                    <div className="r-section">
                      {pageData.showExperienceHeader && (
                        <h3 className="r-section-title" style={{ borderBottomColor: accentColor }}>
                          Work Experience {pageData.pageIndex > 0 ? '(Continued)' : ''}
                        </h3>
                      )}
                      {pageData.experience.map((exp, index) => (
                        <div key={index} className="r-experience-item">
                          <div className="r-item-header">
                            <span>{exp.role || 'Job Role'}</span>
                          </div>
                          <div className="r-item-sub">
                            <span style={{ fontWeight: '600', color: '#475569' }}>{exp.company || 'Company'}</span> | <span>{exp.startDate || ''} - {exp.endDate || ''}</span>
                          </div>
                          {exp.description && (
                            <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {pageData.projects && pageData.projects.length > 0 && (
                    <div className="r-section">
                      {pageData.showProjectsHeader && (
                        <h3 className="r-section-title" style={{ borderBottomColor: accentColor }}>
                          Projects {pageData.pageIndex > 0 ? '(Continued)' : ''}
                        </h3>
                      )}
                      {pageData.projects.map((proj, index) => (
                        <div key={index} className="r-project-item">
                          <div className="r-item-header">
                            <span>{proj.name || 'Project Name'}</span>
                          </div>
                          <div className="r-item-sub">
                            <span style={{ fontWeight: '500', color: accentColor }}>{proj.tech || ''}</span>
                            {proj.link && <span> | <a href={proj.link} target="_blank" rel="noreferrer">Project Link</a></span>}
                          </div>
                          {proj.description && (
                            <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{proj.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Executive Template */}
            {template === 'executive' && (
              <div className="resume-sheet template-executive" style={getSheetStyle()}>
                {pageData.personal && (
                  <div className="r-header">
                    <h1 className="r-name">{resume.personal.name || 'John Doe'}</h1>
                    <p className="r-title" style={{ color: accentColor }}>{resume.personal.title || 'Your Professional Title'}</p>
                    <div className="r-contact">
                      {resume.personal.email && <span>{resume.personal.email}</span>}
                      {resume.personal.phone && <span>{resume.personal.phone}</span>}
                      {resume.personal.location && <span>{resume.personal.location}</span>}
                    </div>
                    <div className="r-contact" style={{ marginTop: '0.25rem' }}>
                      {resume.personal.website && <span><a href={resume.personal.website} target="_blank" rel="noreferrer">{cleanLink(resume.personal.website)}</a></span>}
                      {resume.personal.linkedin && <span><a href={resume.personal.linkedin} target="_blank" rel="noreferrer">{cleanLink(resume.personal.linkedin)}</a></span>}
                      {resume.personal.github && <span><a href={resume.personal.github} target="_blank" rel="noreferrer">{cleanLink(resume.personal.github)}</a></span>}
                    </div>
                  </div>
                )}

                {pageData.pageIndex > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', fontFamily: 'var(--font-sans)', color: '#94a3b8', borderBottom: '1px double #cbd5e1', paddingBottom: '0.25rem', marginBottom: '1.25rem' }}>
                    <span>{resume.personal.name}</span>
                    <span>Page {pageData.pageIndex + 1}</span>
                  </div>
                )}

                {pageData.personal?.summary && (
                  <div className="r-section">
                    <h2 className="r-section-title">Summary</h2>
                    <p style={{ fontSize: '9pt', color: '#1e293b', lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic' }}>"{pageData.personal.summary}"</p>
                  </div>
                )}

                {pageData.experience && pageData.experience.length > 0 && (
                  <div className="r-section">
                    {pageData.showExperienceHeader && (
                      <h2 className="r-section-title">
                        Professional Experience {pageData.pageIndex > 0 ? '(Continued)' : ''}
                      </h2>
                    )}
                    {pageData.experience.map((exp, index) => (
                      <div key={index} className="r-experience-item">
                        <div className="r-item-header">
                          <span>{exp.company || 'Company Name'}</span>
                          <span>{exp.startDate || ''} — {exp.endDate || ''}</span>
                        </div>
                        <div className="r-item-sub">
                          <span>{exp.role || 'Job Role'}</span>
                          <span>{exp.location || ''}</span>
                        </div>
                        {exp.description && (
                          <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageData.projects && pageData.projects.length > 0 && (
                  <div className="r-section">
                    {pageData.showProjectsHeader && (
                      <h2 className="r-section-title">
                        Selected Projects {pageData.pageIndex > 0 ? '(Continued)' : ''}
                      </h2>
                    )}
                    {pageData.projects.map((proj, index) => (
                      <div key={index} className="r-project-item">
                        <div className="r-item-header">
                          <span>{proj.name || 'Project Name'}</span>
                          <span>{proj.date || ''}</span>
                        </div>
                        <div className="r-item-sub">
                          <span>{proj.tech || 'Technologies'}</span>
                          {proj.link && <span><a href={proj.link} target="_blank" rel="noreferrer">{cleanLink(proj.link)}</a></span>}
                        </div>
                        {proj.description && (
                          <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageData.education && pageData.education.length > 0 && (
                  <div className="r-section">
                    {pageData.showEducationHeader && (
                      <h2 className="r-section-title">
                        Education {pageData.pageIndex > 0 ? '(Continued)' : ''}
                      </h2>
                    )}
                    {pageData.education.map((edu, index) => (
                      <div key={index} style={{ marginBottom: '0.75rem' }}>
                        <div className="r-item-header">
                          <span>{edu.school || 'School'}</span>
                          <span>{edu.date || ''}</span>
                        </div>
                        <div className="r-item-sub">
                          <span>{edu.degree || 'Degree'}</span>
                          <span>{edu.gpa || ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pageData.skills && pageData.skills.length > 0 && (
                  <div className="r-section">
                    {pageData.showSkillsHeader && (
                      <h2 className="r-section-title">Technical Skills</h2>
                    )}
                    <p className="r-skills-list">{pageData.skills.join(' • ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tech Minimal Template (Monospace) */}
            {template === 'tech' && (
              <div className="resume-sheet template-tech" style={getSheetStyle()}>
                {pageData.personal && (
                  <div className="r-header" style={{ borderColor: accentColor }}>
                    <h1 className="r-name" style={{ color: accentColor }}>&gt; {resume.personal.name || 'John Doe'}</h1>
                    <p className="r-title">{resume.personal.title || 'Full Stack Engineer'}</p>
                    <div className="r-contact">
                      {resume.personal.email && <span>[email: {resume.personal.email}]</span>}
                      {resume.personal.phone && <span>[phone: {resume.personal.phone}]</span>}
                      {resume.personal.location && <span>[loc: {resume.personal.location}]</span>}
                    </div>
                    <div className="r-contact" style={{ marginTop: '0.25rem' }}>
                      {resume.personal.website && <span>[web: <a href={resume.personal.website} target="_blank" rel="noreferrer">{cleanLink(resume.personal.website)}</a>]</span>}
                      {resume.personal.linkedin && <span>[linkedin: <a href={resume.personal.linkedin} target="_blank" rel="noreferrer">{cleanLink(resume.personal.linkedin)}</a>]</span>}
                      {resume.personal.github && <span>[github: <a href={resume.personal.github} target="_blank" rel="noreferrer">{cleanLink(resume.personal.github)}</a>]</span>}
                    </div>
                  </div>
                )}

                {pageData.pageIndex > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', color: '#94a3b8', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '1.25rem' }}>
                    <span>&gt; {resume.personal.name}</span>
                    <span>[Page {pageData.pageIndex + 1}]</span>
                  </div>
                )}

                {pageData.personal?.summary && (
                  <div className="r-section">
                    <div className="r-section-title" style={{ background: accentColor }}># PROFILE SUMMARY</div>
                    <p style={{ lineHeight: 1.5 }}>{pageData.personal.summary}</p>
                  </div>
                )}

                {pageData.experience && pageData.experience.length > 0 && (
                  <div className="r-section">
                    {pageData.showExperienceHeader && (
                      <div className="r-section-title" style={{ background: accentColor }}>
                        # WORK EXPERIENCE {pageData.pageIndex > 0 ? '(CONTINUED)' : ''}
                      </div>
                    )}
                    {pageData.experience.map((exp, index) => (
                      <div key={index} className="r-experience-item" style={{ borderLeftColor: accentColor }}>
                        <div className="r-item-header">
                          <span>{exp.company || 'Company'} / {exp.role || 'Role'}</span>
                          <span>{exp.startDate || ''} - {exp.endDate || ''}</span>
                        </div>
                        <div className="r-item-sub">
                          <span>loc: {exp.location || 'remote'}</span>
                        </div>
                        {exp.description && (
                          <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageData.projects && pageData.projects.length > 0 && (
                  <div className="r-section">
                    {pageData.showProjectsHeader && (
                      <div className="r-section-title" style={{ background: accentColor }}>
                        # SELECTED PROJECTS {pageData.pageIndex > 0 ? '(CONTINUED)' : ''}
                      </div>
                    )}
                    {pageData.projects.map((proj, index) => (
                      <div key={index} className="r-project-item" style={{ borderLeftColor: accentColor }}>
                        <div className="r-item-header">
                          <span>{proj.name || 'Project'}</span>
                          <span>{proj.date || ''}</span>
                        </div>
                        <div className="r-item-sub">
                          <span>tech: {proj.tech || ''}</span>
                          {proj.link && <span>[<a href={proj.link} target="_blank" rel="noreferrer">link</a>]</span>}
                        </div>
                        {proj.description && (
                          <p className="r-item-desc" style={{ whiteSpace: 'pre-line' }}>{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageData.education && pageData.education.length > 0 && (
                  <div className="r-section">
                    {pageData.showEducationHeader && (
                      <div className="r-section-title" style={{ background: accentColor }}>
                        # ACADEMIC HISTORY {pageData.pageIndex > 0 ? '(CONTINUED)' : ''}
                      </div>
                    )}
                    {pageData.education.map((edu, index) => (
                      <div key={index} style={{ marginBottom: '0.75rem', borderLeft: `2px solid ${accentColor}`, paddingLeft: '0.75rem' }}>
                        <div className="r-item-header">
                          <span>{edu.school || 'School'}</span>
                          <span>{edu.date || ''}</span>
                        </div>
                        <div className="r-item-sub">
                          <span>{edu.degree || 'Degree'} ({edu.gpa || ''})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pageData.skills && pageData.skills.length > 0 && (
                  <div className="r-section">
                    {pageData.showSkillsHeader && (
                      <div className="r-section-title" style={{ background: accentColor }}># TECHNOLOGIES & TOOLS</div>
                    )}
                    <p className="r-skills-list">&gt; {pageData.skills.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

          </React.Fragment>
        ))}
      </div>
    </>
  );
}
