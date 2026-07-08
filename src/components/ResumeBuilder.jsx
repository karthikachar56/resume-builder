import React from 'react';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';

export default function ResumeBuilder({ resume, updateResume }) {
  return (
    <div className="builder-workspace">
      {/* 1. Editor Form Panel */}
      <div className="editor-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
            </svg>
            <span className="panel-title">Resume Editor</span>
          </div>
        </div>
        
        <ResumeForm 
          resume={resume} 
          updateResume={updateResume} 
        />
      </div>

      {/* 2. Live Preview Panel */}
      <div className="preview-panel">
        <ResumePreview resume={resume} updateResume={updateResume} />
      </div>
    </div>
  );
}
