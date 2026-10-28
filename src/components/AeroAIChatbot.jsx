import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Key,
  Bot,
  User,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { generateAIResponse, getStoredApiKey, setStoredApiKey } from '../services/aiService';

export default function AeroAIChatbot({ isOpen, onClose, weatherContext }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I'm **AeroAI**, your personal atmospheric assistant. I see you're looking at **${
        weatherContext?.location || 'your area'
      }** (${weatherContext?.temp ?? '--'}°C, ${weatherContext?.condition?.text || 'Clear'}). How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [apiKeySavedNotice, setApiKeySavedNotice] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  // Handle Send Message
  const handleSend = async (queryText = input) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const aiReplyText = await generateAIResponse(textToSend, weatherContext, messages);
      
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'I ran into an issue answering that. Please try asking again!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Prompt Chips
  const quickPrompts = [
    'What should I wear today?',
    'Is it a good day for outdoor running?',
    'Will I need an umbrella later?',
    'Give me a 3-day travel forecast tip'
  ];

  // Voice Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Text-To-Speech Readout
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const cleanText = text.replace(/[*#_~]/g, ''); // strip markdown
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Save API Key
  const handleSaveApiKey = () => {
    setStoredApiKey(apiKeyInput.trim());
    setApiKeySavedNotice(true);
    setTimeout(() => {
      setApiKeySavedNotice(false);
      setShowSettings(false);
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* Slide-over Container */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          borderRadius: 0,
          borderLeft: '1px solid var(--card-border-glow)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(13, 19, 34, 0.95)',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.6)'
        }}
      >
        {/* Chat Drawer Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={20} color="#090d16" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                AeroAI Assistant
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', margin: 0 }}>
                Weather-Aware AI Engine
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-glass"
              style={{ padding: '8px' }}
              title="API Key Settings"
            >
              <Key size={18} color="var(--accent-amber)" />
            </button>
            <button onClick={onClose} className="btn-glass" style={{ padding: '8px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Current Weather Banner inside Chat */}
        {weatherContext && (
          <div
            style={{
              padding: '10px 20px',
              background: 'rgba(56, 189, 248, 0.1)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--text-secondary)'
            }}
          >
            <span>📍 Active: <strong>{weatherContext.location}</strong></span>
            <span><strong>{weatherContext.temp}°C</strong> | {weatherContext.condition?.text}</span>
          </div>
        )}

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  maxWidth: '88%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: msg.sender === 'user' ? 'var(--accent-blue)' : 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {msg.sender === 'user' ? <User size={16} color="#000" /> : <Bot size={16} color="#000" />}
                </div>

                <div
                  className="glass-panel"
                  style={{
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    background:
                      msg.sender === 'user'
                        ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(96, 165, 250, 0.35))'
                        : 'rgba(255, 255, 255, 0.08)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  paddingLeft: msg.sender === 'ai' ? '36px' : 0,
                  paddingRight: msg.sender === 'user' ? '36px' : 0
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => speakText(msg.text)}
                    style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer' }}
                    title="Read response aloud"
                  >
                    {isSpeaking ? (
                      <VolumeX size={14} color="var(--accent-rose)" />
                    ) : (
                      <Volume2 size={14} color="var(--text-muted)" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Loader2 size={18} className="animate-spin-slow" color="var(--accent-cyan)" />
              <span>AeroAI is analyzing atmosphere and compiling answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '10px 16px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="glass-pill"
              style={{
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                padding: '6px 12px'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className="btn-glass"
              style={{
                padding: '10px',
                background: isListening ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.08)'
              }}
              title={isListening ? 'Stop listening' : 'Speak message'}
            >
              {isListening ? <MicOff size={18} color="#fff" /> : <Mic size={18} color="var(--accent-cyan)" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask AeroAI about weather, outfit, plans...'}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '10px 16px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{ padding: '10px 16px', opacity: !input.trim() || loading ? 0.5 : 1 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>

      {/* API Key Modal Overlay */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: 0 }}>
                Gemini API Key Settings
              </h4>
              <button onClick={() => setShowSettings(false)} className="btn-glass" style={{ padding: '4px 8px' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Configure your Google Gemini API key to enable live AI generative responses.
            </p>

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste Gemini API Key here..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                marginBottom: '16px',
                fontSize: '0.9rem'
              }}
            />

            {apiKeySavedNotice && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '12px' }}>
                <CheckCircle2 size={16} />
                <span>API Key saved successfully!</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSettings(false)} className="btn-glass">
                Cancel
              </button>
              <button onClick={handleSaveApiKey} className="btn-primary">
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
