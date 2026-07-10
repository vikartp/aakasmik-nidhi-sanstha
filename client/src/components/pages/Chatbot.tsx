import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  Bot,
  User,
} from 'lucide-react';
import { sendChatMessage, type ChatMessage } from '@/services/chatService';

// ─── Types ───────────────────────────────────────────────────────────

interface DisplayMessage extends ChatMessage {
  id: string;
  timestamp: Date;
}

type VoiceLang = 'en-IN' | 'hi-IN';

// ─── Speech Recognition Setup ────────────────────────────────────────

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const isSpeechSupported = !!SpeechRecognition;

// ─── Component ───────────────────────────────────────────────────────

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'नमस्ते! 🙏 I am the Aakasmik Nidhi Sanstha assistant. You can ask me about members, contributions, expenses, or anything about the sanstha.\n\nआप हिंदी या English में पूछ सकते हैं!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLang>('hi-IN');
  const [showPulse, setShowPulse] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input and scroll to bottom when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 300);
    }
  }, [isOpen, scrollToBottom]);

  // ─── Send Message ────────────────────────────────────────────────

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build history for context (exclude welcome message)
    const history: ChatMessage[] = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: trimmed });

    try {
      const reply = await sendChatMessage(trimmed, history);
      const botMsg: DisplayMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errorMsg: DisplayMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Voice Input ─────────────────────────────────────────────────

  const startListening = () => {
    if (!isSpeechSupported) return;

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleLang = () => {
    setVoiceLang(prev => (prev === 'en-IN' ? 'hi-IN' : 'en-IN'));
    if (isListening) {
      stopListening();
    }
  };

  // ─── Text-to-Speech ──────────────────────────────────────────────

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Detect if text is mostly Hindi
    const hindiRegex = /[\u0900-\u097F]/;
    utterance.lang = hindiRegex.test(text) ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // ─── Render Messages ────────────────────────────────────────────

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content.split('\n').map((line, i) => {
      // Bold
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex gap-1.5 ml-2">
            <span className="text-indigo-400 shrink-0">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatted.replace(/^[-•]\s/, ''),
              }}
            />
          </div>
        );
      }
      // Numbered lists
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        return (
          <div key={i} className="flex gap-1.5 ml-2">
            <span className="text-indigo-400 shrink-0 font-semibold">
              {numMatch[1]}.
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatted.replace(/^\d+\.\s/, ''),
              }}
            />
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  // ─── Hide pulse after first open ─────────────────────────────────

  const handleOpen = () => {
    setIsOpen(true);
    setShowPulse(false);
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <>
      {/* ─── Chat Panel ─────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="chatbot-panel"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '12px',
            width: 'min(380px, calc(100vw - 24px))',
            height: 'min(520px, calc(100vh - 120px))',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
            animation: 'chatSlideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #6d28d9)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Bot size={20} color="white" />
              </div>
              <div>
                <div
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '15px',
                    lineHeight: 1.2,
                  }}
                >
                  निधि सहायक
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '11px',
                  }}
                >
                  AI Assistant • Online
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language Toggle */}
              {isSpeechSupported && (
                <button
                  onClick={toggleLang}
                  title={`Voice: ${voiceLang === 'hi-IN' ? 'Hindi' : 'English'}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background =
                      'rgba(255,255,255,0.25)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background =
                      'rgba(255,255,255,0.15)')
                  }
                >
                  {voiceLang === 'hi-IN' ? 'हि' : 'En'}
                </button>
              )}
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
                }
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}
              >
                {/* Bot avatar */}
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={14} color="white" />
                  </div>
                )}

                {/* Message bubble */}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius:
                      msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #4f46e5, #6d28d9)'
                        : 'rgba(255,255,255,0.08)',
                    color: msg.role === 'user' ? 'white' : '#e2e8f0',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    position: 'relative',
                    backdropFilter:
                      msg.role === 'assistant' ? 'blur(10px)' : 'none',
                    border:
                      msg.role === 'assistant'
                        ? '1px solid rgba(255,255,255,0.06)'
                        : 'none',
                  }}
                >
                  {formatContent(msg.content)}

                  {/* Speak button for bot messages */}
                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <button
                      onClick={() => speakText(msg.content)}
                      title="Listen"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        opacity: 0.6,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.background =
                          'rgba(255,255,255,0.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.opacity = '0.6';
                        e.currentTarget.style.background =
                          'rgba(255,255,255,0.1)';
                      }}
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={14} color="white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={14} color="white" />
                </div>
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    gap: '5px',
                    alignItems: 'center',
                  }}
                >
                  <span
                    className="chatbot-dot"
                    style={{ animationDelay: '0s' }}
                  />
                  <span
                    className="chatbot-dot"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="chatbot-dot"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '12px',
              background: '#12121f',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {/* Mic Button */}
            {isSpeechSupported && (
              <button
                onClick={toggleListening}
                title={
                  isListening
                    ? 'Stop listening'
                    : `Speak (${voiceLang === 'hi-IN' ? 'Hindi' : 'English'})`
                }
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isListening
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'rgba(255,255,255,0.08)',
                  color: isListening ? 'white' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  animation: isListening ? 'chatPulse 1.5s infinite' : 'none',
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening ? '🎤 Listening...' : 'Type your message...'
              }
              disabled={isLoading}
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e2e8f0',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e =>
                (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')
              }
              onBlur={e =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')
              }
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: 'none',
                background:
                  input.trim() && !isLoading
                    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                    : 'rgba(255,255,255,0.05)',
                color: input.trim() && !isLoading ? 'white' : '#475569',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Floating Action Button ──────────────────────────────── */}
      <button
        id="chatbot-fab"
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        style={{
          position: 'fixed',
          bottom: '36px',
          right: '12px',
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          border: 'none',
          background: isOpen
            ? 'linear-gradient(135deg, #6d28d9, #4f46e5)'
            : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            '0 8px 32px rgba(79, 70, 229, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen
            ? 'rotate(0deg) scale(0.9)'
            : 'rotate(0deg) scale(1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = isOpen
            ? 'scale(0.95)'
            : 'scale(1.08)';
          e.currentTarget.style.boxShadow =
            '0 12px 40px rgba(79, 70, 229, 0.5), 0 0 0 1px rgba(255,255,255,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
          e.currentTarget.style.boxShadow =
            '0 8px 32px rgba(79, 70, 229, 0.4), 0 0 0 1px rgba(255,255,255,0.1)';
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}

        {/* Pulse ring for attention */}
        {!isOpen && showPulse && (
          <span
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '22px',
              border: '2px solid rgba(99, 102, 241, 0.6)',
              animation: 'chatPulseRing 2s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </button>

      {/* ─── CSS Animations ──────────────────────────────────────── */}
      <style>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }

        @keyframes chatPulseRing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        .chatbot-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6366f1;
          display: inline-block;
          animation: chatDotBounce 1.2s ease-in-out infinite;
        }

        #chatbot-panel::-webkit-scrollbar {
          width: 4px;
        }
        #chatbot-panel *::-webkit-scrollbar {
          width: 4px;
        }
        #chatbot-panel *::-webkit-scrollbar-track {
          background: transparent;
        }
        #chatbot-panel *::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }
        #chatbot-panel *::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>
    </>
  );
};

export default Chatbot;
