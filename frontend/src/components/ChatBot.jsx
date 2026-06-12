import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiAPI } from '../services/api';

const ChatBot = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Hello! 👋 I am your AI Nutrition Assistant. Ask me anything about diet, nutrition, BMI, calories, proteins, or healthy eating habits!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await aiAPI.chat(query);
      setMessages(prev => [...prev, { sender: 'assistant', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Error connecting to AI server. Please try again later.' }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What is BMI?",
    "How much water to drink?",
    "Weight loss tips",
    "How much protein do I need?",
  ];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
      <h3 style={{ marginBottom: '16px' }}>🤖 {t('askAi')}</h3>
      
      <div className="chat-history" style={{ flex: 1, maxHeight: '250px', overflowY: 'auto', marginBottom: '12px' }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.sender}`} style={{
            margin: '6px 0',
            padding: '8px 12px',
            borderRadius: '12px',
            maxWidth: '85%',
            fontSize: '0.875rem',
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: m.sender === 'user' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
            color: m.sender === 'user' ? '#0b0f19' : 'var(--text-primary)'
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant" style={{ alignSelf: 'flex-start', fontStyle: 'italic', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            Typing... 💬
          </div>
        )}
      </div>

      {/* Quick Questions Tags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {quickQuestions.map((q, i) => (
          <span
            key={i}
            onClick={() => handleSend(q)}
            style={{
              fontSize: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '4px 10px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'var(--transition)'
            }}
            onMouseOver={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--text-primary)'; }}
            onMouseOut={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
          >
            {q}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="form-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('aiPlaceholder')}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading}>
          {t('send')}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
