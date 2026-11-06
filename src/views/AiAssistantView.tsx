import React, { useState, useRef, useEffect } from 'react';
import { useProcure } from '../context/ProcureContext';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  Info,
  ExternalLink,
  RotateCcw,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const { organisation, selectedRfq } = useProcure();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I am **ProcureAI Assistant**, your intelligent copilot for ${organisation.organisationName}. I am directly connected to your active RFQs, extracted quotations, supplier performance records, and spend ledgers. How can I assist your procurement decision-making today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        { label: 'Data Source', details: 'Connected to live Firestore / SQLite procurement records' },
      ],
      suggestedActions: [
        'Which vendor offers the lowest landed cost for RFQ-2026-001?',
        'Compare Alpha Paper Suppliers vs Beta Industrial Materials',
        'Why was Beta recommended over Gamma?',
        'Which contracts are expiring soon?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.sendAssistantMessage(query, messages.slice(-4));

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        suggestedActions: response.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `I encountered an issue connecting to the AI inference service: ${err.message}. Please check your connection or try another query.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    'Which vendor offers the lowest landed cost?',
    'Compare Alpha vs Beta',
    'Why was Beta recommended?',
    'Which contracts are expiring soon?',
    'Identify cost saving opportunities',
    'Summarise the uploaded vendor quotations',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <BotMessageSquare className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">ProcureAI Assistant</h2>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                Grounding Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Grounded in live RFQ, vendor scorecard, and landed cost records
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'msg-reset',
                sender: 'assistant',
                text: 'Conversation context cleared. How can I help you analyze procurement data?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          title="Reset Conversation"
          className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {isUser ? 'You' : <Sparkles className="h-4 w-4 text-blue-400" />}
              </div>

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Citations and Sources */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-2 space-y-1 text-[11px]">
                    <span className="font-semibold text-slate-500 block">Verified Data Citations:</span>
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="rounded bg-slate-50 p-1.5 text-slate-600 font-mono text-[10px] border border-slate-100">
                        <strong className="text-slate-800">{cite.label}:</strong> {cite.details}
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-up Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(action)}
                        className="rounded-md border border-blue-200 bg-blue-50/70 px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition-colors text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] font-mono ${
                    isUser ? 'text-blue-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-2xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing procurement records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-t border-slate-100 bg-white px-5 py-2 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
        {samplePrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSendMessage(p)}
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-200 bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about vendor landed costs, delivery delays, contract clauses, or cost savings..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
