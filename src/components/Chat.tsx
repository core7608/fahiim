import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, Sparkles, User, Bot, PlusCircle, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, User as UserType, StudyItem } from '@/src/types';
import { getFahimResponse } from '@/src/services/gemini';
import { InteractiveRenderer } from './InteractiveRenderer';
import { cn } from '@/src/lib/utils';
import { sounds } from '@/src/lib/sounds';

interface ChatProps {
  user: UserType;
  studyPlan: StudyItem[];
}

export const Chat: React.FC<ChatProps> = ({ user, studyPlan }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: `أهلاً بيك يا ${user.name}! أنا فهيم، أخوك الكبير ومدرسك الـ AI. قولي يا بطل، إيه اللي واقف قدامك النهاردة وعايزني أبسطهولك؟`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    history.push({ role: 'user', parts: [{ text: input }] });

    const response = await getFahimResponse(history, user, studyPlan);
    sounds.playSuccess();
    
    // Parse interactive component if exists
    const interactiveMatch = response.match(/```interactive-component\n([\s\S]*?)\n```/);
    const jsxMatch = response.match(/```jsx\n([\s\S]*?)\n```/);
    
    let cleanText = response
      .replace(/```interactive-component\n([\s\S]*?)\n```/, '')
      .replace(/```jsx\n([\s\S]*?)\n```/, '')
      .trim();
    
    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: cleanText,
      interactive: interactiveMatch ? JSON.parse(interactiveMatch[1]) : undefined
    };

    // If it's JSX, we'll store it in a special way or just add another message part
    // For simplicity, let's add a new property to Message or just use interactive with a special type
    if (jsxMatch) {
      modelMsg.interactive = {
        type: 'jsx' as any,
        props: { code: jsxMatch[1] }
      };
    }

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم خاصية الإدخال الصوتي.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      sounds.playClick();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
      sounds.playSuccess();
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className={cn("flex flex-col h-full bg-white relative transition-all duration-500", focusMode && "bg-slate-900")} dir="rtl">
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all",
        focusMode && "bg-slate-900/80 border-slate-800"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-glass-blue rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className={cn("font-display font-bold text-slate-900", focusMode && "text-white")}>فهيم</h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">متصل الآن</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            setFocusMode(!focusMode);
            sounds.playClick();
          }}
          className={cn(
            "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all",
            focusMode ? "bg-glass-blue text-white" : "bg-slate-100 text-slate-500"
          )}
        >
          {focusMode ? 'إيقاف وضع التركيز' : 'وضع التركيز'}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full gap-3",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm",
                m.role === 'user' ? "bg-slate-100" : "bg-glass-blue/10"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4 text-slate-500" /> : <Sparkles className="w-4 h-4 text-glass-blue" />}
              </div>
              
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className={cn(
                  "p-4 rounded-3xl text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "glass-card text-slate-800 rounded-tl-none border-none shadow-sm bg-blue-50/30",
                  focusMode && m.role === 'model' && "bg-slate-800 text-slate-200 border-slate-700"
                )}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
                
                {m.interactive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2"
                  >
                    <InteractiveRenderer 
                      data={m.interactive.type === 'jsx' ? (m.interactive.props as any).code : JSON.stringify(m.interactive)} 
                      type={m.interactive.type === 'jsx' ? 'jsx' : 'interactive'}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-glass-blue/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-glass-blue" />
            </div>
            <div className="bg-blue-50/30 p-4 rounded-3xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-glass-blue/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-glass-blue/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-glass-blue/40 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-10 transition-all",
        focusMode && "from-slate-900 via-slate-900"
      )}>
        <div className="max-w-2xl mx-auto relative">
          <div className={cn(
            "glass-card p-2 flex items-center gap-2 shadow-2xl shadow-blue-100 transition-all",
            focusMode && "bg-slate-800 border-slate-700 shadow-none"
          )}>
            <button 
              onClick={toggleListening}
              className={cn(
                "p-3 rounded-2xl transition-all relative overflow-hidden",
                isListening ? "bg-rose-50 text-rose-500" : "hover:bg-slate-50 text-slate-400"
              )}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 relative z-10" />
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-rose-100 rounded-full"
                  />
                </>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <input 
              type="text" 
              placeholder="اسأل فهيم أي حاجة..."
              className={cn(
                "flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium",
                focusMode && "text-white"
              )}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => {
                handleSend();
                sounds.playClick();
              }}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-glass-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
