import React, { useState } from 'react';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import ResumeChatCopilot from './ResumeChatCopilot';

export default function ResumeBuilder({ resume, updateResume }) {
  const [activeSubTab, setActiveSubTab] = useState('form'); // form, copilot

  return (
    <div className="builder-workspace">
      {/* 1. Editor Form / AI Chat Panel */}
      <div className="editor-panel">
        <div className="panel-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="panel-title-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
              </svg>
              <span className="panel-title">Workspace Manager</span>
            </div>
          </div>

          {/* Sub-tab navigation selector */}
          <div className="workspace-sub-tabs">
            <button 
              className={`workspace-sub-tab ${activeSubTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('form')}
            >
              ✍ Manual Form Editor
            </button>
            <button 
              className={`workspace-sub-tab ${activeSubTab === 'copilot' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('copilot')}
            >
              🤖 AI Copilot Chat
            </button>
          </div>
        </div>
        
        {activeSubTab === 'form' ? (
          <ResumeForm 
            resume={resume} 
            updateResume={updateResume} 
          />
        ) : (
          <ResumeChatCopilot 
            resume={resume}
            updateResume={updateResume}
          />
        )}
      </div>

      {/* 2. Live Preview Panel */}
      <div className="preview-panel">
        <ResumePreview resume={resume} updateResume={updateResume} />
      </div>
    </div>
  );
}
