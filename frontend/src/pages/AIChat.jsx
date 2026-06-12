import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiAPI } from '../services/api';

const AIChat = () => {
  const { t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! 👋 I am your dedicated AI Diet & Nutrition Assistant.\n\nYou can ask me anything about:\n• Body Mass Index (BMI) assessment\n• Custom calorie budgets & macro targets\n• Healthy snack and meal ideas\n• Hydration calculations\n• Fat loss & muscle building programs\n• Managing specialized diets (e.g. Vegetarian, Keto, Diabetic)\n\nWhat is on your mind today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Error connecting to the AI Nutrition server. Please check your connection and try again.' }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { text: "Suggest a high-protein vegetarian breakfast.", icon: "🍳" },
    { text: "What are some healthy diabetic-friendly snacks?", icon: "🍇" },
    { text: "Explain BMR vs TDEE calories.", icon: "🔥" },
    { text: "How can I calculate my water target?", icon: "💧" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div className="app-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>🤖 {t('askAi')}</h2>
          <p style={{ fontSize: '0.9rem' }}>Chat directly with our rule-based AI Nutritionist for immediate answers.</p>
        </div>
      </div>

      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        overflow: 'hidden',
        background: 'rgba(31, 41, 55, 0.4)'
      }}>
        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                gap: '12px',
                flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              {/* Profile icon bubble */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: m.sender === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                color: m.sender === 'user' ? '#0b0f19' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}>
                {m.sender === 'user' ? '👤' : '🤖'}
              </div>

              {/* Message text bubble */}
              <div style={{
                background: m.sender === 'user' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                color: m.sender === 'user' ? '#0b0f19' : 'var(--text-primary)',
                padding: '14px 18px',
                borderRadius: '16px',
                borderTopRightRadius: m.sender === 'user' ? '2px' : '16px',
                borderTopLeftRadius: m.sender === 'user' ? '16px' : '2px',
                fontSize: '0.925rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                border: '1px solid var(--border-color)'
              }}>
                🤖
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-secondary)',
                padding: '12px 16px',
                borderRadius: '16px',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                border: '1px solid var(--border-color)'
              }}>
                Analyzing your question... 💬
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length === 1 && !loading && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '500' }}>
              💡 Common suggestions to get you started:
            </p>
            <div className="grid-cols-4" style={{ display: 'grid', gap: '12px' }}>
              {samplePrompts.map((prompt, i) => (
                <div
                  key={i}
                  onClick={() => handleSend(prompt.text)}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'var(--transition)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{prompt.icon}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{prompt.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <input
            type="text"
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiPlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '14px 18px', fontSize: '0.95rem' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={loading}
            style={{ padding: '0 24px', height: '48px', fontSize: '0.95rem' }}
          >
            {t('send')} 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
