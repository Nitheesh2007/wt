import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Send, Sparkles, User, BookOpen, MapPin, CheckCircle2 } from 'lucide-react';

export default function AIAssistantPage({ onSelectBook, setActiveTab }) {
  const { t, isTamil } = useLanguage();
  const [messages, setMessages] = useState(() => [
    {
      sender: 'assistant',
      text: isTamil
        ? "வணக்கம்! நான் உங்கள் AI நூலக உதவியாளர். புத்தக இருப்பு, அமைவிடம் (Shelf / Rack), அல்லது உங்கள் கல்வித் துறைக்கான பரிந்துரைகள் குறித்து எதையும் கேளுங்கள்!"
        : "Hello! I am your AI Library Assistant. Ask me anything about our academic catalog, live book availability, shelf locations, or personalized book recommendations!",
      books: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = isTamil
    ? [
        "பைதான் புத்தகங்களைக் கண்டுபிடி.",
        "கிடைக்கும் தரவுத்தள புத்தகங்களைக் காட்டு.",
        "இந்த வாரம் காலாவதியாகும் புத்தகங்கள் எவை?",
        "இயந்திர கற்றல் (ML) புத்தகங்களைப் பரிந்துரைக்கவும்.",
        "Clean Code புத்தகம் எங்குள்ளது?",
        "ஜாவா தொடர்பான புத்தகங்களைக் காட்டு."
      ]
    : [
        "Find Python books.",
        "Show available database books.",
        "Which books are due this week?",
        "Recommend machine learning books.",
        "Where is Clean Code located?",
        "Show books similar to Java."
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const q = (queryText || input).trim();
    if (!q) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chatAssistant(q, {
        history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        language: isTamil ? 'ta' : 'en'
      });
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.message,
            books: res.data.books || [],
            followUps: res.data.followUps || []
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: isTamil
            ? "நூலகத் தரவுத்தளத்தை வினவுவதில் பிழை ஏற்பட்டது. தயவுசெய்து உங்கள் இணைப்பைச் சரிபார்க்கவும் அல்லது வேறு கேள்வியைக் கேட்கவும்."
            : "I encountered an error querying the catalog database. Please verify your connection or try a different question.",
          books: [],
          followUps: [
            isTamil ? "நூலக நேரங்கள் மற்றும் விதிகள் என்ன?" : "What are the library hours and rules?",
            isTamil ? "கணினி அறிவியல் பொறியியல் புத்தகங்களைக் காட்டு." : "Show Computer Science engineering books.",
            isTamil ? "அல்காரிதம்கள் பற்றி விளக்கு." : "Explain Algorithms."
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (raw) => {
    if (!raw) return null;
    return raw.split('\n').map((line, idx) => {
      // Bold rendering for **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={idx} style={{ display: 'block', minHeight: line.trim() ? 'auto' : '8px' }}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
            }
            if (p.startsWith('### ')) {
              return <strong key={pIdx} style={{ fontSize: '1rem', display: 'block', marginBottom: '4px', color: 'var(--primary)' }}>{p.replace('### ', '')}</strong>;
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', maxWidth: '960px', margin: '0 auto', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {isTamil ? 'ஸ்மார்ட் நூலக மேலாண்மை AI உதவியாளர்' : 'Smart Library Management AI Assistant'}
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--success)' }} />
              {isTamil ? 'நேரடி MongoDB & கல்வி அறிவு மையம்' : 'Connected to Live MongoDB & Knowledge Engine'}
            </span>
          </div>
        </div>

        {/* Continuous Active Mode Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: '#10b981', display: 'inline-block' }} />
          <span>{isTamil ? 'தொடர்ச்சியான உரையாடல் முறை செயலில் உள்ளது' : 'Continuous Interactive Mode Active'}</span>
        </div>
      </div>

      {/* Chat Messages List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%'
            }}
          >
            {m.sender === 'assistant' && (
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div
                style={{
                  padding: '0.9rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                  color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {m.sender === 'user' ? m.text : renderFormattedText(m.text)}
              </div>

              {/* Attached Book Cards if returned from database */}
              {m.books && m.books.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', marginTop: '4px' }}>
                  {m.books.map((b) => (
                    <div
                      key={b._id}
                      style={{
                        padding: '0.85rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'transform 150ms ease'
                      }}
                      onClick={() => {
                        if (onSelectBook) onSelectBook(b);
                        setActiveTab('book-detail');
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        By {b.author}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {b.shelf} / {b.rack}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Continuous Follow-Up Suggestion Chips */}
              {m.followUps && m.followUps.length > 0 && (
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                    {isTamil ? 'தொடர்ந்து கேட்கக்கூடிய அடுத்த கேள்விகள்:' : 'Continuous Follow-Up Exploration:'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {m.followUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        onClick={() => handleSend(fu)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '5px 12px',
                          borderRadius: '16px',
                          background: 'rgba(79, 70, 229, 0.08)',
                          border: '1px solid rgba(79, 70, 229, 0.25)',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                          fontWeight: 600
                        }}
                      >
                        ⚡ {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {isTamil ? 'நூலகத் தரவுத்தளத்தில் தேடி பதிலைத் தயாரிக்கிறது...' : 'Querying database & parsing library intent...'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            onClick={() => handleSend(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '8px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
      >
        <input
          type="text"
          className="form-input"
          style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
          placeholder={isTamil ? "எ.கா: 'Clean Code புத்தகம் எங்குள்ளது?', 'ML பரிந்துரைகள்', 'தாமதமான நூல்கள்'..." : "Ask: 'Where is Clean Code?', 'Recommend ML books', or 'Which books are due?'..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
