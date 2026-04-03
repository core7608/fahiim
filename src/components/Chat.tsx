import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, Sparkles, User, Bot, PlusCircle, Mic, MicOff, FileText, Download, Loader2, Palette, History, Plus, X, MessageSquare as MsgIcon, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, User as UserType, StudyItem, ChatSession } from '@/src/types';
import { getFahimResponse, getFahimResponseStream } from '@/src/services/gemini';
import { InteractiveRenderer } from './InteractiveRenderer';
import { cn } from '@/src/lib/utils';
import { sounds } from '@/src/lib/sounds';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, storage, ref, uploadBytes, getDownloadURL, handleFirestoreError, OperationType, getDocs, limit } from '@/src/lib/firebase';

interface ChatProps {
  user: UserType;
  studyPlan: StudyItem[];
  onUpdateUser: (user: UserType) => void;
  onUpdateStudyPlan: (plan: StudyItem[]) => void;
}

export const Chat: React.FC<ChatProps> = ({ user, studyPlan, onUpdateUser, onUpdateStudyPlan }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('activeChatId'));
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fahimName = user.settings?.gender === 'female' ? 'فهيمة' : 'فهيم';

  // Fetch sessions
  useEffect(() => {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      setSessions(sess);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Real-time messages from Firestore
  useEffect(() => {
    if (!activeChatId) {
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: `أهلاً بيك يا ${user.name}! أنا ${fahimName}، أخوك الكبير ومدرسك الـ AI. قولي يا بطل، إيه اللي واقف قدامك النهاردة وعايزني أبسطهولك؟`
      }]);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', activeChatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => unsubscribe();
  }, [activeChatId, user.name, fahimName]);

  const startNewChat = async () => {
    setActiveChatId(null);
    localStorage.removeItem('activeChatId');
    setMessages([]);
    sounds.playToggle();
  };

  const selectSession = (id: string) => {
    setActiveChatId(id);
    localStorage.setItem('activeChatId', id);
    setShowHistory(false);
    sounds.playClick();
  };

  const handleSend = async (textOverride?: string, fileData?: { url: string, name: string, base64?: string, mimeType?: string }) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() && !fileData) return;

    let currentChatId = activeChatId;

    // Create session if it doesn't exist
    if (!currentChatId) {
      try {
        const sessionRef = await addDoc(collection(db, 'sessions'), {
          userId: user.uid,
          title: textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : ''),
          lastMessage: textToSend,
          timestamp: serverTimestamp()
        });
        currentChatId = sessionRef.id;
        setActiveChatId(currentChatId);
        localStorage.setItem('activeChatId', currentChatId);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'sessions');
        return;
      }
    }

    const userMsg: any = {
      userId: user.uid,
      chatId: currentChatId,
      role: 'user',
      text: textToSend,
      timestamp: serverTimestamp(),
    };

    if (fileData) {
      userMsg.fileUrl = fileData.url;
      userMsg.fileName = fileData.name;
      userMsg.mimeType = fileData.mimeType;
    }

    setInput('');
    setIsLoading(true);
    setStreamingText('');
    sounds.playClick();

    try {
      await addDoc(collection(db, 'messages'), userMsg);
      
      // Update session last message
      await updateDoc(doc(db, 'sessions', currentChatId), {
        lastMessage: textToSend,
        timestamp: serverTimestamp()
      });

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const userParts: any[] = [{ text: textToSend }];
      if (fileData?.base64 && fileData?.mimeType) {
        userParts.push({
          inlineData: {
            data: fileData.base64.split(',')[1],
            mimeType: fileData.mimeType
          }
        });
      }
      history.push({ role: 'user', parts: userParts });

      let fullResponse = "";
      const stream = getFahimResponseStream(history, user, studyPlan);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }
      
      // Parse interactive component if exists
      const interactiveMatch = fullResponse.match(/```interactive-component\n([\s\S]*?)\n```/);
      const jsxMatch = fullResponse.match(/```jsx\n([\s\S]*?)\n```/);
      const themeMatch = fullResponse.match(/```theme-json\n([\s\S]*?)\n```/);
      const quizMatch = fullResponse.match(/```quiz-json\n([\s\S]*?)\n```/);
      const planMatch = fullResponse.match(/```study-plan-json\n([\s\S]*?)\n```/);
      
      let cleanText = fullResponse
        .replace(/```interactive-component\n([\s\S]*?)\n```/, '')
        .replace(/```jsx\n([\s\S]*?)\n```/, '')
        .replace(/```theme-json\n([\s\S]*?)\n```/, '')
        .replace(/```quiz-json\n([\s\S]*?)\n```/, '')
        .replace(/```study-plan-json\n([\s\S]*?)\n```/, '')
        .trim();
      
      const modelMsg: any = {
        userId: user.uid,
        chatId: currentChatId,
        role: 'model',
        text: cleanText,
        timestamp: serverTimestamp()
      };

      if (jsxMatch) {
        modelMsg.interactive = {
          type: 'jsx',
          props: { code: jsxMatch[1] }
        };
      } else if (interactiveMatch) {
        try {
          modelMsg.interactive = JSON.parse(interactiveMatch[1]);
        } catch (e) {
          console.error("JSON Parse Error:", e);
        }
      } else if (quizMatch) {
        try {
          modelMsg.interactive = {
            type: 'quiz',
            props: JSON.parse(quizMatch[1])
          };
        } catch (e) {
          console.error("Quiz Parse Error:", e);
        }
      }

      await addDoc(collection(db, 'messages'), modelMsg);
      setStreamingText('');
      sounds.playSuccess();
    } catch (error) {
      console.error("Send Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    sounds.playClick();
    try {
      // Convert to base64 for Gemini
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const fileRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await handleSend(`[ملف مرفق: ${file.name}]`, { url, name: file.name, base64, mimeType: file.type });
    } catch (error) {
      console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
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

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleApplyTheme = (themeJson: string) => {
    try {
      const theme = JSON.parse(themeJson);
      if (theme.colors) {
        const newSettings = {
          ...user.settings,
          customColors: theme.colors,
          theme: 'custom'
        };
        onUpdateUser({ ...user, settings: newSettings });
        sounds.playSuccess();
      }
    } catch (e) {
      console.error("Theme Apply Error:", e);
    }
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
            <h2 className={cn("font-display font-bold text-slate-900", focusMode && "text-white")}>{fahimName}</h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">متصل الآن</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={startNewChat}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
            title="محادثة جديدة"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
            title="السجل"
          >
            <History className="w-5 h-5" />
          </button>
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
      </div>

      {/* History Sidebar/Modal */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-80 bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-black text-xl text-slate-900">سجل المحادثات</h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sessions.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">مفيش محادثات قديمة يا بطل</div>
                ) : (
                  sessions.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => selectSession(s.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-right transition-all border-2",
                        activeChatId === s.id ? "border-glass-blue bg-blue-50/50" : "border-transparent hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <MsgIcon className="w-4 h-4 text-glass-blue" />
                        <span className="font-bold text-sm text-slate-800 truncate">{s.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate pr-7">{s.lastMessage}</p>
                    </button>
                  ))
                )}
              </div>
              <div className="p-4">
                <button 
                  onClick={() => {
                    startNewChat();
                    setShowHistory(false);
                  }}
                  className="w-full bg-glass-blue text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>محادثة جديدة</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  "p-4 rounded-3xl text-sm leading-relaxed relative group",
                  m.role === 'user' 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "glass-card text-slate-800 rounded-tl-none border-none shadow-sm bg-blue-50/30",
                  focusMode && m.role === 'model' && "bg-slate-800 text-slate-200 border-slate-700"
                )}>
                  {m.fileUrl && (
                    <div className="mb-3 p-3 bg-white/10 rounded-2xl flex items-center justify-between gap-4 border border-white/20">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-5 h-5 shrink-0" />
                        <span className="text-xs font-bold truncate">{m.fileName}</span>
                      </div>
                      <a href={m.fileUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : '';
                        const content = String(children).replace(/\n$/, '');
                        
                        if (lang === 'study-plan-json') {
                          return (
                            <div className="my-4 p-4 glass-card border-blue-100 bg-blue-50/30">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-blue-600">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-xs font-bold">تعديل مقترح لخطة المذاكرة</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    try {
                                      const plan = JSON.parse(content);
                                      onUpdateStudyPlan(plan);
                                      sounds.playSuccess();
                                    } catch (e) {
                                      console.error("Plan Parse Error:", e);
                                    }
                                  }}
                                  className="bg-glass-blue text-white px-4 py-1.5 rounded-xl text-[10px] font-bold hover:bg-blue-600 transition-all shadow-sm"
                                >
                                  تحديث الخطة
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500">فهيم اقترح تعديل لجدولك عشان يناسب مستواك أكتر.</p>
                            </div>
                          );
                        }
                        
                        if (lang === 'theme-json') {
                          return (
                            <div className="my-4 p-4 glass-card border-emerald-100 bg-emerald-50/30">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-emerald-600">
                                  <Palette className="w-4 h-4" />
                                  <span className="text-xs font-bold">ثيم جديد من فهيم!</span>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleApplyTheme(content)}
                                    className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold hover:bg-emerald-600 transition-all shadow-sm"
                                  >
                                    تطبيق الثيم
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const blob = new Blob([content], { type: 'application/json' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `fahim_theme_${new Date().getTime()}.json`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                    }}
                                    className="bg-white text-emerald-500 border border-emerald-200 px-4 py-1.5 rounded-xl text-[10px] font-bold hover:bg-emerald-50 transition-all shadow-sm"
                                  >
                                    تحميل الملف
                                  </button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {Object.values(JSON.parse(content).colors).map((c: any, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
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

          {streamingText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full gap-3 flex-row"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm bg-glass-blue/10">
                <Sparkles className="w-4 h-4 text-glass-blue" />
              </div>
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className={cn(
                  "p-4 rounded-3xl text-sm leading-relaxed glass-card text-slate-800 rounded-tl-none border-none shadow-sm bg-blue-50/30",
                  focusMode && "bg-slate-800 text-slate-200 border-slate-700"
                )}>
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
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
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className="p-3 hover:bg-slate-50 text-slate-400 rounded-2xl transition-all"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>
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
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isUploading}
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
