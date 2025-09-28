import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import useAppStore from '../../store/useAppStore';
import { useAppContext } from '../../hooks/useAppContext';

export const NaseehWidget: React.FC = () => {
  const { user } = useAppContext();
  const { quickChat, sendQuickChatMessage, clearQuickChat } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if(isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [quickChat?.messages, quickChat?.isLoading, isOpen]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
      const messageContent = input.value.trim();
      if (!messageContent || !user) return;
      sendQuickChatMessage(messageContent, user);
      input.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Submit the form
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    clearQuickChat(); // Clear the quick chat session state
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 lg:left-6 lg:right-auto z-50 bg-white/70 dark:bg-slate-700/70 backdrop-blur-lg text-primary rounded-full p-4 shadow-lg hover:shadow-solar transform hover:scale-110 transition-all duration-300"
        aria-label="Open Naseeh AI Assistant"
      >
        <Sparkles size={28} />
      </button>

      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 lg:left-6 lg:right-auto z-50 w-full max-w-sm h-[500px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          {/* Header */}
          <header className="p-4 bg-gradient-primary text-white flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <h3 className="font-semibold">المساعد الذكي نصيح</h3>
            </div>
            <Button variant="ghost" size="sm" className="p-1 h-auto text-white hover:bg-white/20" onClick={handleClose}>
              <X size={18} />
            </Button>
          </header>
          
          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {quickChat && quickChat.messages.length > 0 ? quickChat.messages.map(msg => (
                 <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-2.5 rounded-lg text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/10 text-slate-800 dark:text-slate-200'}`}>
                        {msg.content}
                        {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-primary/20">
                                <h4 className="text-xs font-semibold mb-1">المصادر:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {msg.sources.map((source, index) => (
                                        <a 
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            key={index} 
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
             )) : <p className="text-center text-sm text-slate-500">ابدأ محادثتك مع نصيح...</p>}
             {quickChat?.isLoading && (
                <div className="flex items-start gap-2 justify-start">
                    <div className="max-w-xs p-2.5 rounded-lg text-sm bg-primary/10">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-1.sem h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                </div>
              )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSendMessage} className="relative">
                <Textarea
                    name="message"
                    placeholder="سؤال سريع..."
                    className="pe-10 text-sm"
                    rows={1}
                    disabled={quickChat?.isLoading}
                    onKeyDown={handleKeyDown}
                />
                <Button type="submit" variant="ghost" size="sm" className="absolute top-1/2 -translate-y-1/2 left-1 p-2 h-auto text-primary" disabled={quickChat?.isLoading}>
                    <Send size={18} />
                </Button>
            </form>
          </div>

        </div>
      )}
      <style>{`
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};
