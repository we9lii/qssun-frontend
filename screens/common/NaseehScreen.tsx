import React, { useState, useRef, useEffect } from 'react';
// FIX: The ChatSession type was not defined. It is now defined in types.ts, resolving the module member error.
import { ChatSession, User } from '../../types';
import { Sparkles, Plus, Send, MessageSquare, Trash2, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';

const NaseehScreen: React.FC = () => {
  const { user } = useAppContext();
  const { 
      chatSessions, 
      sendNaseehMessage, 
      createNewSession, 
      deleteSession 
  } = useAppStore();
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(chatSessions[0]?.id || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    // If there's no active session, create one or set the first one as active.
    if (!activeSessionId && chatSessions.length > 0) {
        setActiveSessionId(chatSessions[0].id);
    } else if (chatSessions.length === 0) {
        createNewSession();
    }
  }, [chatSessions, activeSessionId, createNewSession]);

  useEffect(() => {
    // FIX: Completed the component by adding message handlers and JSX, resolving the return type error.
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, activeSession?.isLoading]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
    const messageContent = input.value.trim();
    if (!messageContent || !user || !activeSessionId) return;
    sendNaseehMessage(messageContent, activeSessionId, user);
    input.value = '';
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-160px)]">
      {/* Sessions Sidebar */}
      <div className="w-80 flex flex-col bg-slate-100 dark:bg-slate-800/50 p-4 border-l border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary"/>
            المحادثات
          </h2>
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={createNewSession} aria-label="New Session">
            <Plus size={18} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {chatSessions.map(session => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                activeSessionId === session.id ? 'bg-primary/10' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare size={16} className={activeSessionId === session.id ? 'text-primary' : 'text-slate-500'} />
                <span className="text-sm truncate font-medium">{session.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-destructive opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                aria-label="Delete Session"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/50">
        {activeSession ? (
          <>
            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeSession.messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.sender === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <UserIcon size={16} className="text-slate-600 dark:text-slate-300" />
                      </div>
                  ) : (
                      <img src='https://www2.0zz0.com/2025/09/11/09/271562700.gif' alt="avatar" className="w-8 h-8 rounded-full"/>
                  )}
                  <div className={`max-w-xl p-3 rounded-xl text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 rounded-bl-none'}`}>
                    <p>{msg.content}</p>
                    {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-primary/20">
                            <h4 className="text-xs font-semibold mb-1">المصادر:</h4>
                            <div className="flex flex-wrap gap-1">
                                {msg.sources.map((source, index) => (
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" key={index} 
                                       className="text-xs bg-slate-200 dark:bg-slate-600 p-1 px-1.5 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors truncate max-w-[150px]"
                                       title={source.title}
                                    >
                                        {source.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ))}
              {activeSession.isLoading && (
                <div className="flex items-start gap-3">
                    <img src="https://www2.0zz0.com/2025/09/11/09/271562700.gif" alt="avatar" className="w-8 h-8 rounded-full"/>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 rounded-bl-none">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <form onSubmit={handleSendMessage} className="relative">
                <Textarea
                  name="message"
                  placeholder="اسأل نصيح أي شيء..."
                  className="pe-12 text-base"
                  rows={2}
                  disabled={activeSession.isLoading}
                  onKeyDown={handleKeyDown}
                />
                <Button type="submit" variant="primary" size="sm" className="absolute bottom-3 left-3 p-2 h-auto" disabled={activeSession.isLoading}>
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <p>اختر محادثة أو ابدأ واحدة جديدة.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NaseehScreen;