import React, { useState, useEffect, useRef } from 'react';
import { getIntakeResponse, getSimulatedIntakeResponse } from '../utils/intakeService';
import ResumePreview from './ResumePreview';

const BLANK_RESUME_DATA = {
  personal: { name: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', summary: '' },
  experience: [],
  education: [],
  projects: [],
  skills: []
};

export default function AiResumeBuilder({ updateResume, setTab }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! Let's build your resume from scratch step-by-step using AI. I will ask you for every single detail (like name, title, contact details, experiences) one-by-one, and the A4 document sheet will edit itself live. To start: What is your Full Name?"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeResume, setActiveResume] = useState(BLANK_RESUME_DATA);
  const [simStep, setSimStep] = useState(0); // tracks steps for simulation fallback
  const chatEndRef = useRef(null);

  // Check if env key is loaded
  const isEnvKeyLoaded = !!import.meta.env.VITE_GEMINI_API_KEY;

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;

    if (!textToSend) setInputVal('');
    setErrorMessage('');

    // Append user message
    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const activeKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      let reply;
      if (!activeKey) {
        // Run simulated interview wizard
        await new Promise((resolve) => setTimeout(resolve, 1500));
        reply = getSimulatedIntakeResponse(activeResume, text, simStep);
        setSimStep(reply.nextStep);
      } else {
        // Run live AI structured interview
        reply = await getIntakeResponse(activeKey, activeResume, updatedMessages);
      }

      // Append assistant message
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1 + '', role: 'assistant', content: reply.message }
      ]);

      // Edit the resume state live!
      if (reply.resume) {
        setActiveResume(reply.resume);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to communicate with AI.");
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1 + '', role: 'assistant', content: "Sorry, I hit an error trying to process that request." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! Let's build your resume from scratch step-by-step using AI. I will ask you for every single detail (like name, title, contact details, experiences) one-by-one, and the A4 document sheet will edit itself live. To start: What is your Full Name?"
      }
    ]);
    setActiveResume(BLANK_RESUME_DATA);
    setSimStep(0);
    setErrorMessage('');
  };

  const handleImport = () => {
    updateResume(activeResume);
    setTab('builder'); // Navigate back to the manual builder workspace
  };

  const INTRO_CHIPS = [
    { label: "Raushan Kumar Baitha", text: "Raushan Kumar Baitha" },
    { label: "Sarah Connor", text: "Sarah Connor" },
    { label: "Alex Morgan", text: "Alex Morgan" }
  ];

  return (
    <div className="ai-builder-layout container">
      {/* 1. INTERACTIVE CHAT COLUMN */}
      <div className="ai-form-column" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Chat Component container */}
        <div className="copilot-chat-container glass glow" style={{ height: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
          
          {/* Status Header */}
          <div className="chat-key-status">
            {isEnvKeyLoaded ? (
              <div className="key-badge key-badge-success">
                <span className="badge-icon">✓</span> AI Active (Gemini API Connected)
              </div>
            ) : (
              <div className="key-badge key-badge-warning">
                <span className="badge-icon">⚠</span> Simulated Mode (No Key in .env)
              </div>
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Resume Interview Wizard</span>
          </div>

          {/* Conversation stream */}
          <div className="chat-messages-stream" style={{ flexGrow: 1, padding: '1.25rem' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row ${msg.role === 'user' ? 'row-user' : 'row-assistant'}`}>
                <div className={`chat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble-row row-assistant">
                <div className="chat-bubble bubble-assistant typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="chat-error-toast">
                ⚠ {errorMessage}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt chips suggestions on load */}
          {messages.length === 1 && !isLoading && (
            <div className="chat-prompt-chips-container">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Select a quick start:</span>
              <div className="chips-grid">
                {INTRO_CHIPS.map((chip, idx) => (
                  <button key={idx} className="chip-btn" onClick={() => sendMessage(chip.text)}>
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input wrapper */}
          <div className="chat-input-footer">
            <button className="chat-reset-btn" onClick={resetChat} title="Clear and Start Fresh">
              ↻
            </button>
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input-field"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                placeholder="Answer interview questions to build A4 page..."
              />
              <button className="chat-send-btn" onClick={() => sendMessage()} disabled={isLoading || !inputVal.trim()}>
                ➔
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SANDBOX PREVIEW COLUMN */}
      <div className="ai-preview-column">
        {activeResume.personal.name ? (
          <div className="ai-preview-results-wrapper">
            <div className="glass preview-success-banner">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span className="banner-title">✨ A4 Live Preview (Editing Live)</span>
                <span className="banner-desc">Review your interview progression and click import once complete.</span>
              </div>
              <button className="btn btn-success" onClick={handleImport}>
                ✓ Keep & Import into Workspace
              </button>
            </div>

            {/* Sandbox Live Preview rendering */}
            <div className="ai-preview-sandbox-frame">
              <ResumePreview resume={activeResume} updateResume={setActiveResume} />
            </div>
          </div>
        ) : (
          <div className="glass glow ai-preview-empty-state">
            <div className="empty-icon-circle">🤖</div>
            <h3>Intake Assistant Screen</h3>
            <p>
              Your new resume document will render here. Start the conversation with the interview chatbot on the left to watch the A4 document populate and edit itself live!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
