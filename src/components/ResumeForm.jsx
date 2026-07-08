import React, { useState } from 'react';

// List of action words for selection
const OPTIMIZER_VERBS = [
  'Developed', 'Designed', 'Spearheaded', 'Optimized', 'Automated', 
  'Architected', 'Led', 'Implemented', 'Reduced', 'Increased', 
  'Engineered', 'Streamlined', 'Refactored', 'Deployed', 'Orchestrated'
];

// Common stem active verbs for detection checks
const ACTIVE_VERB_STEMS = [
  'develop', 'design', 'spearhead', 'led', 'lead', 'optimize', 'improve', 
  'reduce', 'increase', 'orchestrate', 'architect', 'deploy', 'automate', 
  'engineer', 'create', 'execute', 'analyze', 'research', 'solve', 
  'debug', 'integrate', 'migrate', 'streamline', 'refactor', 'collaborate',
  'manage', 'supervise', 'transform', 'deliver', 'initiate'
];

/**
 * Inline structural helper panel running local calculations on bullet point layout
 */
function StarFormatHelper({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVerb, setSelectedVerb] = useState('Spearheaded');
  const [taskInput, setTaskInput] = useState('');
  const [metricInput, setMetricInput] = useState('');

  // 1. Text Analytics Calculations
  const rawText = value || '';
  const paragraphs = rawText.split('\n').filter(p => p.trim().length > 0);
  
  // Analyze the first/most recent line if multiple lines exist
  const targetLine = paragraphs[paragraphs.length - 1] || '';
  const words = targetLine.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  // Clean first word to test active verbs
  const firstWord = wordCount > 0 ? words[0].toLowerCase().replace(/[^a-z]/g, '') : '';
  const startsWithVerb = ACTIVE_VERB_STEMS.some(stem => firstWord.startsWith(stem));
  
  // Check if string contains any numbers, %, or $ representing quantifiable metrics
  const containsMetric = /[\d%]/g.test(targetLine);

  // 2. Score Calculation (0 - 100)
  let verbPoints = startsWithVerb ? 30 : 0;
  let metricPoints = containsMetric ? 40 : 0;
  let lengthPoints = 0;
  if (wordCount >= 10 && wordCount <= 35) {
    lengthPoints = 30; // Ideal length
  } else if (wordCount > 0) {
    lengthPoints = 15; // Too short or too long
  }
  
  const lineScore = verbPoints + metricPoints + lengthPoints;

  const handleInsertBullet = () => {
    if (!taskInput.trim()) return;
    
    const resultPart = metricInput.trim() ? `, resulting in ${metricInput.trim()}` : '';
    const newBullet = `${selectedVerb} ${taskInput.trim()}${resultPart}.`;
    
    // Inject bullet at the end of text
    if (rawText.trim()) {
      onChange(rawText.trim() + '\n' + newBullet);
    } else {
      onChange(newBullet);
    }

    // Reset inputs
    setTaskInput('');
    setMetricInput('');
  };

  return (
    <div style={{ marginTop: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(99, 102, 241, 0.04)', userSelect: 'none' }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
          <span>💡</span> STAR Format Helper & Metrics Calculator
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isOpen ? 'Collapse ▲' : 'Expand ▼'}
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Analysis Metrics */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Bullet Optimization Score: </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: lineScore >= 80 ? 'var(--accent-success)' : lineScore >= 45 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                {rawText ? `${lineScore}/100` : '0/100'}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: startsWithVerb ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: startsWithVerb ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {startsWithVerb ? '✓ Active Verb' : '✗ Missing Active Verb'}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: containsMetric ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: containsMetric ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {containsMetric ? '✓ Quantified Impact' : '✗ Lacks Metrics'}
              </span>
            </div>
          </div>

          {/* Constructor Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bullet Point Builder:</span>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Verb Select */}
              <select 
                className="form-select" 
                style={{ flexGrow: 1, minWidth: '110px', padding: '0.4rem', fontSize: '0.8rem' }}
                value={selectedVerb}
                onChange={(e) => setSelectedVerb(e.target.value)}
              >
                {OPTIMIZER_VERBS.map((v, i) => (
                  <option key={i} value={v}>{v}</option>
                ))}
              </select>

              {/* Task/Achievement Input */}
              <input 
                type="text" 
                className="form-input" 
                style={{ flexGrow: 3, minWidth: '200px', padding: '0.4rem', fontSize: '0.8rem' }} 
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Core Action (e.g. a microservice handling transactions)"
              />

              {/* Metric Result Input */}
              <input 
                type="text" 
                className="form-input" 
                style={{ flexGrow: 2, minWidth: '150px', padding: '0.4rem', fontSize: '0.8rem' }} 
                value={metricInput}
                onChange={(e) => setMetricInput(e.target.value)}
                placeholder="Impact (e.g. reducing downtime by 35%)"
              />

              <button className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.75rem' }} onClick={handleInsertBullet}>
                + Add Bullet
              </button>
            </div>
            
            {taskInput && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                Preview: "{selectedVerb} {taskInput}{metricInput ? `, resulting in ${metricInput}` : ''}."
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeForm({ resume, updateResume }) {
  const [activeSection, setActiveSection] = useState('personal');

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    updateResume({
      ...resume,
      personal: {
        ...resume.personal,
        [name]: value
      }
    });
  };

  // Generic list update handlers (Work Experience, Education, Projects, Certifications)
  const addListItem = (sectionName, defaultValue) => {
    const newList = [...(resume[sectionName] || []), defaultValue];
    updateResume({
      ...resume,
      [sectionName]: newList
    });
  };

  const updateListItem = (sectionName, index, field, value) => {
    const newList = [...(resume[sectionName] || [])];
    newList[index] = { ...newList[index], [field]: value };
    updateResume({
      ...resume,
      [sectionName]: newList
    });
  };

  const removeListItem = (sectionName, index) => {
    const newList = (resume[sectionName] || []).filter((_, i) => i !== index);
    updateResume({
      ...resume,
      [sectionName]: newList
    });
  };

  // Skill tags input helpers
  const [skillInput, setSkillInput] = useState('');
  const handleAddSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const cleanSkill = skillInput.trim().replace(/,$/, '');
      if (cleanSkill && !resume.skills.includes(cleanSkill)) {
        updateResume({
          ...resume,
          skills: [...resume.skills, cleanSkill]
        });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    updateResume({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. PERSONAL INFORMATION */}
      <div className={`form-section-card ${activeSection === 'personal' ? 'active' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('personal')}>
          <div className="form-section-title-group">
            <svg className="form-section-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="form-section-title">Personal Details</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeSection === 'personal' ? '▼' : '▲'}
          </span>
        </div>
        
        {activeSection === 'personal' && (
          <div className="form-section-content">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" value={resume.personal.name || ''} onChange={handlePersonalChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <input type="text" name="title" className="form-input" value={resume.personal.title || ''} onChange={handlePersonalChange} placeholder="Senior Software Engineer" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" value={resume.personal.email || ''} onChange={handlePersonalChange} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-input" value={resume.personal.phone || ''} onChange={handlePersonalChange} placeholder="+1 234 567 890" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" name="location" className="form-input" value={resume.personal.location || ''} onChange={handlePersonalChange} placeholder="San Francisco, CA" />
              </div>
              <div className="form-group">
                <label className="form-label">Personal Website / Portfolio</label>
                <input type="url" name="website" className="form-input" value={resume.personal.website || ''} onChange={handlePersonalChange} placeholder="https://johndoe.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input type="url" name="linkedin" className="form-input" value={resume.personal.linkedin || ''} onChange={handlePersonalChange} placeholder="linkedin.com/in/johndoe" />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input type="url" name="github" className="form-input" value={resume.personal.github || ''} onChange={handlePersonalChange} placeholder="github.com/johndoe" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Summary</label>
              <textarea name="summary" className="form-textarea" value={resume.personal.summary || ''} onChange={handlePersonalChange} placeholder="Write a short summary (50-100 words) highlighting your top technical skills and achievements."></textarea>
            </div>
          </div>
        )}
      </div>

      {/* 2. WORK EXPERIENCE */}
      <div className={`form-section-card ${activeSection === 'experience' ? 'active' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('experience')}>
          <div className="form-section-title-group">
            <svg className="form-section-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span className="form-section-title">Work Experience</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeSection === 'experience' ? '▼' : '▲'}
          </span>
        </div>

        {activeSection === 'experience' && (
          <div className="form-section-content">
            {resume.experience?.map((exp, index) => (
              <div key={index} className="entry-item-card">
                <div className="entry-item-header">
                  <span className="entry-item-title">Experience #{index + 1}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeListItem('experience', index)}>
                    Remove
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input type="text" className="form-input" value={exp.company || ''} onChange={(e) => updateListItem('experience', index, 'company', e.target.value)} placeholder="Google" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Title / Role</label>
                      <input type="text" className="form-input" value={exp.role || ''} onChange={(e) => updateListItem('experience', index, 'role', e.target.value)} placeholder="Software Engineer" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input type="text" className="form-input" value={exp.startDate || ''} onChange={(e) => updateListItem('experience', index, 'startDate', e.target.value)} placeholder="Jan 2023" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input type="text" className="form-input" value={exp.endDate || ''} onChange={(e) => updateListItem('experience', index, 'endDate', e.target.value)} placeholder="Present" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input type="text" className="form-input" value={exp.location || ''} onChange={(e) => updateListItem('experience', index, 'location', e.target.value)} placeholder="New York, NY" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description & Achievements</label>
                    <textarea className="form-textarea" style={{ minHeight: '120px' }} value={exp.description || ''} onChange={(e) => updateListItem('experience', index, 'description', e.target.value)} placeholder="Describe your achievements. Enter each achievement on a new line."></textarea>
                    
                    {/* Integrated local STAR Format Helper */}
                    <StarFormatHelper 
                      value={exp.description} 
                      onChange={(newVal) => updateListItem('experience', index, 'description', newVal)} 
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-secondary" onClick={() => addListItem('experience', { company: '', role: '', startDate: '', endDate: '', location: '', description: '' })}>
              + Add Work Entry
            </button>
          </div>
        )}
      </div>

      {/* 3. EDUCATION */}
      <div className={`form-section-card ${activeSection === 'education' ? 'active' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('education')}>
          <div className="form-section-title-group">
            <svg className="form-section-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
            </svg>
            <span className="form-section-title">Education</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeSection === 'education' ? '▼' : '▲'}
          </span>
        </div>

        {activeSection === 'education' && (
          <div className="form-section-content">
            {resume.education?.map((edu, index) => (
              <div key={index} className="entry-item-card">
                <div className="entry-item-header">
                  <span className="entry-item-title">Education #{index + 1}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeListItem('education', index)}>
                    Remove
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">School / Institution</label>
                      <input type="text" className="form-input" value={edu.school || ''} onChange={(e) => updateListItem('education', index, 'school', e.target.value)} placeholder="Stanford University" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree / Certificate</label>
                      <input type="text" className="form-input" value={edu.degree || ''} onChange={(e) => updateListItem('education', index, 'degree', e.target.value)} placeholder="B.S. Computer Science" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Graduation Date</label>
                      <input type="text" className="form-input" value={edu.date || ''} onChange={(e) => updateListItem('education', index, 'date', e.target.value)} placeholder="June 2022" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GPA / Honors / Activities</label>
                      <input type="text" className="form-input" value={edu.gpa || ''} onChange={(e) => updateListItem('education', index, 'gpa', e.target.value)} placeholder="GPA: 3.8/4.0, Magna Cum Laude" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-secondary" onClick={() => addListItem('education', { school: '', degree: '', date: '', gpa: '' })}>
              + Add Education Entry
            </button>
          </div>
        )}
      </div>

      {/* 4. PROJECTS */}
      <div className={`form-section-card ${activeSection === 'projects' ? 'active' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('projects')}>
          <div className="form-section-title-group">
            <svg className="form-section-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span className="form-section-title">Projects</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeSection === 'projects' ? '▼' : '▲'}
          </span>
        </div>

        {activeSection === 'projects' && (
          <div className="form-section-content">
            {resume.projects?.map((proj, index) => (
              <div key={index} className="entry-item-card">
                <div className="entry-item-header">
                  <span className="entry-item-title">Project #{index + 1}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeListItem('projects', index)}>
                    Remove
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Project Name</label>
                      <input type="text" className="form-input" value={proj.name || ''} onChange={(e) => updateListItem('projects', index, 'name', e.target.value)} placeholder="AI Resume Builder" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role / Technologies</label>
                      <input type="text" className="form-input" value={proj.tech || ''} onChange={(e) => updateListItem('projects', index, 'tech', e.target.value)} placeholder="React, Node.js, CSS Grid" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Link / Repository</label>
                      <input type="url" className="form-input" value={proj.link || ''} onChange={(e) => updateListItem('projects', index, 'link', e.target.value)} placeholder="https://github.com/myproject" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date (Optional)</label>
                      <input type="text" className="form-input" value={proj.date || ''} onChange={(e) => updateListItem('projects', index, 'date', e.target.value)} placeholder="Oct 2023" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Description</label>
                    <textarea className="form-textarea" value={proj.description || ''} onChange={(e) => updateListItem('projects', index, 'description', e.target.value)} placeholder="Outline the project goals and your specific contributions."></textarea>
                    
                    {/* Integrated local STAR Format Helper */}
                    <StarFormatHelper 
                      value={proj.description} 
                      onChange={(newVal) => updateListItem('projects', index, 'description', newVal)} 
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-secondary" onClick={() => addListItem('projects', { name: '', tech: '', link: '', description: '', date: '' })}>
              + Add Project Entry
            </button>
          </div>
        )}
      </div>

      {/* 5. SKILLS */}
      <div className={`form-section-card ${activeSection === 'skills' ? 'active' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('skills')}>
          <div className="form-section-title-group">
            <svg className="form-section-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span className="form-section-title">Skills & Keywords</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeSection === 'skills' ? '▼' : '▲'}
          </span>
        </div>

        {activeSection === 'skills' && (
          <div className="form-section-content">
            <div className="form-group">
              <label className="form-label">Skills List</label>
              <div className="tags-container">
                {resume.skills?.map((skill, index) => (
                  <span key={index} className="tag-item">
                    {skill}
                    <button type="button" className="tag-remove" onClick={() => removeSkill(index)}>
                      &times;
                    </button>
                  </span>
                ))}
                <input type="text" className="tag-input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder="Type skill and press Enter or comma..." />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Separate skills with commas. Example: React, Python, Cloud Computing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
