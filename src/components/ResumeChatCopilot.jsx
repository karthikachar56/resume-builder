import React, { useState, useEffect, useRef } from 'react';
import { getCopilotResponse, getSimulatedCopilotResponse } from '../utils/copilotService';

export default function ResumeChatCopilot({ resume, updateResume }) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your AI Resume Copilot. You can tell me how to edit your resume in plain English (e.g. \"Add a new job at Google\", \"Make my summary sound more corporate\", or \"Add Python to skills\"), and I'll modify the A4 document on the right live!"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const chatEndRef = useRef(null);

  // Check if env key is loaded
  const isEnvKeyLoaded = !!import.meta.env.VITE_GEMINI_API_KEY;

  // Load API Key from local storage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

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
      const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
      
      let reply;
      if (!activeKey) {
        // Run in simulation mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        reply = getSimulatedCopilotResponse(resume, text);
      } else {
        // Run live API update
        reply = await getCopilotResponse(activeKey, resume, updatedMessages);
      }

      // Append assistant message
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1 + '', role: 'assistant', content: reply.message }
      ]);

      // Edit the resume state live!
      if (reply.resume) {
        updateResume(reply.resume);
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
        content: "Hello! I am your AI Resume Copilot. You can tell me how to edit your resume in plain English (e.g. \"Add a new job at Google\", \"Make my summary sound more corporate\", or \"Add Python to skills\"), and I'll modify the A4 document on the right live!"
      }
    ]);
    setErrorMessage('');
  };

  const PROMPT_CHIPS = [
    { label: "💼 Add Google Job", prompt: "Add a Senior Software Engineer job at Google starting March 2024 to present" },
    { label: "🎯 Improve Summary", prompt: "Rewrite my professional summary to make it sound highly corporate and senior" },
    { label: "🛠️ Add Python Skill", prompt: "Add Python and Docker to my skills list" },
    { label: "⭐ Add Stripe Project", prompt: "Add a Stripe billing gateway project to my projects list" }
  ];

  return (
    <div className="copilot-chat-container">
      {/* 1. KEY STATUS HEADER */}
      <div className="chat-key-status">
        {isEnvKeyLoaded ? (
          <div className="key-badge key-badge-success">
            <span className="badge-icon">✓</span> API Key Loaded from .env
          </div>
        ) : apiKey ? (
          <div className="key-badge key-badge-success">
            <span className="badge-icon">✓</span> Custom API Key Loaded
          </div>
        ) : (
          <div className="key-badge key-badge-warning">
            <span className="badge-icon">⚠</span> Running in Demo Simulation Mode
          </div>
        )}

        <button className="chat-settings-btn" onClick={() => setShowApiKey(!showApiKey)} title="Configure API Key">
          {showApiKey ? "Hide Key ✖" : "Settings ⚙"}
        </button>
      </div>

      {showApiKey && (
        <div className="chat-key-settings-panel glass">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
            To run live updates, save your Google Gemini API Key below or configure <code>VITE_GEMINI_API_KEY</code> in the <code>.env</code> file.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              className="form-input"
              style={{ flexGrow: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
              placeholder="Enter Gemini API key..."
              value={apiKey}
              onChange={handleApiKeyChange}
            />
            {apiKey && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => { setApiKey(''); localStorage.removeItem('gemini_api_key'); }}
                style={{ padding: '0.35rem 0.5rem' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. CHAT STREAM AREA */}
      <div className="chat-messages-stream">
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

      {/* 3. PROMPT SUGGESTIONS CHIPS */}
      {messages.length === 1 && !isLoading && (
        <div className="chat-prompt-chips-container">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Try asking:</span>
          <div className="chips-grid">
            {PROMPT_CHIPS.map((chip, idx) => (
              <button key={idx} className="chip-btn" onClick={() => sendMessage(chip.prompt)}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. FOOTER CONTROLS & INPUT */}
      <div className="chat-input-footer">
        <button className="chat-reset-btn" onClick={resetChat} title="Reset Chat History">
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
            placeholder="Type instructions to edit A4 page live..."
          />
          <button className="chat-send-btn" onClick={() => sendMessage()} disabled={isLoading || !inputVal.trim()}>
            ➔
          </button>
        </div>
      </div>
    </div>
  );
}
