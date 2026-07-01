"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from '@/components/ChatBubble';
import InvestmentNudgeCard from '@/components/InvestmentNudgeCard';

interface Message {
  role: 'user' | 'model';
  type: 'text' | 'nudge_card';
  content?: string;
  data?: any;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', type: 'text', content: 'Hello Ravi! I am your IDBI WealthLens Co-pilot. How can I help you grow your wealth today?' }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What's my current balance?",
    "How much did I spend on food this month?",
    "Do I have any surplus cash to invest?"
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', type: 'text', content: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSuggestions([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: 'model', type: 'text', content: `Oops! ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, data]);
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', type: 'text', content: 'Network error. Please try again later.' }]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleDeclineNudge = () => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: 'No, thanks.' }]);
    // Optionally trigger another API call here if we want Gemini to respond to the decline.
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">
          <svg className="lens-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          IDBI WealthLens
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>PoC Sandbox</div>
      </header>

      <div className="chat-area" ref={chatAreaRef}>
        {messages.map((msg, index) => {
          if (msg.type === 'nudge_card' && msg.data) {
            return (
              <InvestmentNudgeCard 
                key={index} 
                data={msg.data} 
                onAccept={() => {}}
                onDecline={handleDeclineNudge}
              />
            );
          }
          return <ChatBubble key={index} role={msg.role} content={msg.content || ''} />;
        })}
        {isLoading && (
          <div className="bubble-container model">
            <div className="bubble model" style={{ padding: '16px' }}>
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && !isLoading && (
        <div className="suggestions-container">
          {suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => handleSend(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="input-area">
        <input 
          type="text" 
          className="chat-input"
          placeholder="Ask about your finances..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button className="send-button" onClick={handleSend} disabled={isLoading || !input.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <footer style={{ textAlign: 'center', fontSize: '0.75rem', padding: '8px', color: 'var(--text-light)', borderTop: '1px solid var(--border)', background: 'white' }}>
        Created by <a href="https://github.com/anonyxhappie" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Akshay Saini</a>
      </footer>
    </div>
  );
}
