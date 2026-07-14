import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ResumeBuilder from './components/ResumeBuilder';
import ResumeAnalyser from './components/ResumeAnalyser';
import AiResumeBuilder from './components/AiResumeBuilder';

const INITIAL_RESUME_DATA = {
  personal: {
    name: 'Alex Morgan',
    title: 'Senior Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 019-2834',
    location: 'New York, NY',
    website: 'https://alexmorgan.dev',
    linkedin: 'https://linkedin.com/in/alexmorgan-dev',
    github: 'https://github.com/alexmorgan-dev',
    summary: 'Experienced Full-Stack Developer with 6+ years of expertise building high-performance web applications. Skilled in React, Node.js, TypeScript, and cloud deployment pipelines. Driven by writing clean, testable code and optimizing system performance.'
  },
  experience: [
    {
      company: 'TechCorp Solutions',
      role: 'Senior Software Engineer',
      startDate: 'Jan 2022',
      endDate: 'Present',
      location: 'New York, NY',
      description: 'Led a cross-functional team of 6 engineers to redesign and rebuild a legacy monolith portal into a React and Node.js microservices platform, accelerating dashboard load times by 45%.\nSpearheaded adoption of automated Docker containers and Jenkins CI/CD workflows, shortening developer release cycle time from 5 days to 20 minutes.\nOptimized database queries and PostgreSQL indexing, reducing memory usage spikes by 30% and API endpoint latency by 120ms.'
    },
    {
      company: 'Innovate Systems',
      role: 'Software Engineer',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      location: 'Boston, MA',
      description: 'Developed scalable client-facing administrative systems using Vue.js and Python Django, supporting over 20,000 active monthly corporate clients.\nCoded clean REST API layers and implemented Redis memory cache stores, boosting concurrency capacity by 50%.\nAuthored comprehensive automated unit and integration suites using Jest and PyTest, raising global test coverage metrics from 40% to 88%.'
    }
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'Master of Science in Computer Science',
      date: 'June 2019',
      gpa: 'GPA: 3.92/4.0'
    },
    {
      school: 'Boston University',
      degree: 'Bachelor of Science in Computer Engineering',
      date: 'May 2017',
      gpa: 'GPA: 3.75/4.0, Cum Laude'
    }
  ],
  projects: [
    {
      name: 'Dynamic Edge Analyst Portal',
      tech: 'React, Vite, GraphQL, Serverless',
      link: 'https://github.com/alexmorgan-dev/edge-portal',
      date: 'Oct 2023',
      description: 'Architected a real-time data analytical dashboard monitoring Edge caching services. Configured React Server Components and GraphQL subscriptions to handle live telemetry feeds.'
    },
    {
      name: 'Automated Keyword ATS Auditor',
      tech: 'TypeScript, Node.js, Webpack',
      link: 'https://github.com/alexmorgan-dev/ats-scanner',
      date: 'Mar 2023',
      description: 'Programmed a serverless browser script analyzing resume layout nodes against common ATS parsing architectures. Integrated keyword frequency scoring algorithms.'
    }
  ],
  skills: [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Django', 
    'PostgreSQL', 'Docker', 'AWS', 'Redis', 'GraphQL', 'REST APIs', 
    'Git', 'CI/CD', 'Jest', 'Agile Scrum'
  ]
};

export default function App() {
  const [tab, setTab] = useState('dashboard'); // dashboard, builder, analyser
  const [resume, setResume] = useState(INITIAL_RESUME_DATA);
  const [theme, setTheme] = useState('light'); // dark, light

  // Persist resume and theme in local storage if desired
  useEffect(() => {
    const savedResume = localStorage.getItem('user_resume_data');
    if (savedResume) {
      try {
        setResume(JSON.parse(savedResume));
      } catch (e) {
        console.error('Failed to parse saved resume data, using default mock details.', e);
      }
    }
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Update theme classes on body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const updateResume = (newResumeData) => {
    setResume(newResumeData);
    localStorage.setItem('user_resume_data', JSON.stringify(newResumeData));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app-root-layout">
      {/* App Header */}
      <header className="app-header glass glow">
        <div className="logo-section" onClick={() => setTab('dashboard')}>
          <div className="logo-icon">✨</div>
          <span className="logo-text">ResumeCraft<span className="logo-accent">.AI</span></span>
        </div>

        <nav className="nav-actions">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${tab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setTab('dashboard')}
            >
              <span>📊</span> Dashboard
            </button>
            <button 
              className={`nav-tab ${tab === 'builder' ? 'active' : ''}`}
              onClick={() => setTab('builder')}
            >
              <span>📝</span> Editor Workspace
            </button>
            <button 
              className={`nav-tab ${tab === 'ai-builder' ? 'active' : ''}`}
              onClick={() => setTab('ai-builder')}
            >
              <span>🤖</span> AI Generator
            </button>
            <button 
              className={`nav-tab ${tab === 'analyser' ? 'active' : ''}`}
              onClick={() => setTab('analyser')}
            >
              <span>🔍</span> ATS Scanner
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </nav>
      </header>

      {/* Main Content Sections */}
      <main className="app-main-layout">
        {tab === 'dashboard' && <Dashboard resume={resume} setTab={setTab} />}
        {tab === 'builder' && <ResumeBuilder resume={resume} updateResume={updateResume} />}
        {tab === 'ai-builder' && <AiResumeBuilder updateResume={updateResume} setTab={setTab} />}
        {tab === 'analyser' && <ResumeAnalyser resume={resume} updateResume={updateResume} setTab={setTab} />}
      </main>

      {/* Global App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-title">Official Student Learning Ecosystem</p>
          <p className="footer-powered">
            Powered by <strong>EETIRP LTD</strong>
          </p>
          <p className="footer-copyright">© 2026 KAURAHUB • All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
