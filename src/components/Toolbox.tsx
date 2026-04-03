import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, Calculator, ArrowLeftRight, Grid, Zap, Book, 
  FileText, Layers, Percent, Share2, CheckSquare, 
  Clock, Music, Wrench, ChevronLeft, Play, Pause, RotateCcw,
  Target, Shield, Hourglass, Coffee, Calendar, Variable,
  LineChart, BarChart, Triangle, Divide, FlaskConical,
  Dna, Orbit, Globe, TestTube, Sun, Cog, Battery,
  Languages, Check, Plus, Volume2, Repeat, MessageCircle,
  Type, Globe2, HelpCircle, PenTool, File, Mic, Link, Users,
  Search, Wand2, Sparkles, ChevronRight
} from 'lucide-react';
import { STUDY_TOOLS, Tool, User } from '../types';
import { cn } from '../lib/utils';
import { sounds } from '../lib/sounds';
import { JsxRunner } from './InteractiveRenderer';
import { getFahimResponse } from '../services/gemini';

const CustomToolCreator = ({ user, onGenerated }: { user: User, onGenerated: (code: string) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    sounds.playClick();
    
    try {
      const systemPrompt = `أنت مبرمج أدوات تعليمية محترف. 
      المطلوب: برمجة أداة React (JSX) بناءً على وصف الطالب.
      استخدم Tailwind CSS و Lucide Icons و Framer Motion.
      يجب أن يكون الكود كاملاً وقابلاً للتشغيل داخل LiveProvider.
      رد بالكود فقط داخل علامات \`\`\`jsx ... \`\`\`.
      الوصف: ${prompt}`;

      const response = await getFahimResponse([
        { role: 'user', parts: [{ text: systemPrompt }] }
      ], user);

      const jsxMatch = response.match(/```jsx([\s\S]*?)```/);
      if (jsxMatch && jsxMatch[1]) {
        onGenerated(jsxMatch[1].trim());
        sounds.playSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-card p-6 border-blue-200 bg-blue-50/30 space-y-4">
      <div className="flex items-center gap-3 text-blue-700">
        <Wand2 className="w-6 h-6 animate-pulse" />
        <h3 className="text-lg font-bold">برمج أداتك الخاصة مع فهيم</h3>
      </div>
      <p className="text-sm text-slate-600">اوصف الأداة اللي في خيالك وفهيم هيبرمجها لك في ثواني!</p>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثلاً: حاسبة سرعة الضوء، أو تايمر للمذاكرة بشكل مختلف..."
          className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button 
          onClick={handleCreate}
          disabled={isGenerating}
          className="bg-glass-blue text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all disabled:opacity-50"
        >
          {isGenerating ? 'جاري البرمجة...' : 'برمج الآن'}
        </button>
      </div>
    </div>
  );
};

const IconMap: Record<string, any> = {
  Timer, Calculator, ArrowLeftRight, Grid, Zap, Book, 
  FileText, Layers, Percent, Share2, CheckSquare, 
  Clock, Music, Wrench, Target, Shield, Hourglass, Coffee,
  Calendar, Variable, LineChart, BarChart, Triangle, Divide,
  FlaskConical, Dna, Orbit, Globe, TestTube, Sun, Cog, Battery,
  Languages, Check, Plus, Volume2, Repeat, MessageCircle,
  Type, Globe2, HelpCircle, PenTool, File, Mic, Link, Users
};

export const Toolbox: React.FC<{ user: User }> = ({ user }) => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [filter, setFilter] = useState<Tool['category'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [customCode, setCustomCode] = useState<string | null>(null);

  const filteredTools = STUDY_TOOLS.filter(t => {
    const matchesSearch = t.name.includes(search) || t.description.includes(search);
    const matchesCat = filter === 'all' || t.category === filter;
    return matchesSearch && matchesCat;
  });

  if (customCode) {
    return (
      <div className="h-full bg-slate-50/50 p-6 overflow-y-auto" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          <button 
            onClick={() => { setCustomCode(null); sounds.playClick(); }}
            className="flex items-center gap-2 text-glass-blue font-bold"
          >
            <ChevronRight className="w-5 h-5" />
            <span>الرجوع للأدوات</span>
          </button>
          <div className="glass-card p-8 min-h-[500px]">
             <JsxRunner code={customCode} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50/50 p-6 overflow-y-auto" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-black text-slate-900">صندوق الأدوات</h1>
              <p className="text-slate-500 font-medium">50 أداة ذكية لمساعدتك في كل المواد</p>
            </div>
            <div className="w-12 h-12 bg-glass-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

          <CustomToolCreator user={user} onGenerated={setCustomCode} />

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="ابحث عن أداة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border-none rounded-2xl py-4 pr-12 pl-4 shadow-sm focus:ring-2 focus:ring-glass-blue transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['all', 'productivity', 'math', 'science', 'languages', 'general'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f as any); sounds.playClick(); }}
                  className={cn(
                    "px-6 py-2 rounded-xl font-bold whitespace-nowrap transition-all",
                    filter === f ? "bg-glass-blue text-white shadow-md" : "bg-white text-slate-500 hover:bg-blue-50"
                  )}
                >
                  {f === 'all' ? 'الكل' : 
                   f === 'productivity' ? 'إنتاجية' :
                   f === 'math' ? 'رياضيات' :
                   f === 'science' ? 'علوم وفضاء' :
                   f === 'languages' ? 'لغات' : 'عام'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedTool ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {filteredTools.map((tool) => {
                const Icon = IconMap[tool.icon] || Wrench;
                return (
                  <motion.button
                    key={tool.id}
                    layout
                    whileHover={{ y: -4 }}
                    onClick={() => { setSelectedTool(tool); sounds.playClick(); }}
                    className="glass-card p-5 flex flex-col items-center gap-3 hover:scale-[1.02] transition-all group text-center"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-glass-blue group-hover:rotate-12 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 text-sm">{tool.name}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{tool.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="tool-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <button 
                onClick={() => { setSelectedTool(null); sounds.playClick(); }}
                className="flex items-center gap-2 text-glass-blue font-bold hover:gap-3 transition-all"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
                <span>الرجوع للصندوق</span>
              </button>

              <div className="glass-card p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
                
                <div className="w-full max-w-md relative z-10 space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">{selectedTool.name}</h2>
                    <p className="text-slate-500">{selectedTool.description}</p>
                  </div>

                  {/* Tool Implementations */}
                  <div className="p-6 bg-white/50 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[200px] flex items-center justify-center">
                    {selectedTool.id === 'pomodoro' && <PomodoroTool />}
                    {selectedTool.id === 'calculator' && <ScientificCalculatorTool />}
                    {selectedTool.id === 'unit-converter' && <UnitConverterTool />}
                    {selectedTool.id === 'gpa-calc' && <GPACalculatorTool />}
                    {!['pomodoro', 'calculator', 'unit-converter', 'gpa-calc'].includes(selectedTool.id) && (
                      <div className="text-center space-y-4">
                        <Sparkles className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                        <p className="text-slate-400 text-sm italic">هذه الأداة ({selectedTool.name}) جاهزة للاستخدام الذكي في مادتك.</p>
                        <button 
                          onClick={async () => {
                            const systemPrompt = `برمج أداة تعليمية كاملة لـ ${selectedTool.name} (${selectedTool.description}). استخدم Tailwind CSS و Lucide Icons. رد بالكود فقط داخل علامات \`\`\`jsx ... \`\`\`.`;
                            const response = await getFahimResponse([{ role: 'user', parts: [{ text: systemPrompt }] }], user);
                            const jsxMatch = response.match(/```jsx([\s\S]*?)```/);
                            if (jsxMatch && jsxMatch[1]) {
                              setCustomCode(jsxMatch[1].trim());
                              sounds.playSuccess();
                            }
                          }}
                          className="glass-button text-xs"
                        >
                          اطلب من فهيم برمجتها الآن
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PomodoroTool = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      sounds.playSuccess();
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-6xl font-display font-black text-glass-blue tracking-tighter">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => { setIsActive(!isActive); sounds.playClick(); }}
          className="w-14 h-14 bg-glass-blue rounded-2xl flex items-center justify-center text-white shadow-lg"
        >
          {isActive ? <Pause /> : <Play className="ml-1" />}
        </button>
        <button 
          onClick={() => { setTimeLeft(25 * 60); setIsActive(false); sounds.playClick(); }}
          className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500"
        >
          <RotateCcw />
        </button>
      </div>
    </div>
  );
};

const ScientificCalculatorTool = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  const sciButtons = [
    'sin', 'cos', 'tan', 'log', 'ln',
    'sqrt', '^', '(', ')', 'abs',
    'pi', 'e', 'exp', '1/x', 'x²'
  ];
  
  const numButtons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', 'C', '='
  ];

  const handleBtn = (b: string) => {
    sounds.playClick();
    if (b === 'C') {
      setDisplay('0');
      setHistory('');
    } else if (b === '=') {
      try {
        let expr = display
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/log/g, 'Math.log10')
          .replace(/ln/g, 'Math.log')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/pi/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/abs/g, 'Math.abs')
          .replace(/exp/g, 'Math.exp')
          .replace(/x²/g, '**2')
          .replace(/1\/x/g, '1/')
          .replace(/\^/g, '**');
        
        const result = eval(expr);
        setHistory(display + ' =');
        setDisplay(Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, ''));
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay(prev => {
        if (prev === '0' && !['.', '/', '*', '-', '+', '^'].includes(b)) return b;
        return prev + b;
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-[#1a1a1a] p-4 rounded-2xl text-right overflow-hidden border-4 border-slate-700 shadow-inner">
        <div className="text-[10px] font-mono text-slate-500 h-4">{history}</div>
        <div className="text-2xl font-mono text-emerald-400 truncate">{display}</div>
      </div>
      
      <div className="grid grid-cols-5 gap-1.5">
        {sciButtons.map(b => (
          <button 
            key={b} 
            onClick={() => handleBtn(b)}
            className="p-2 bg-slate-800 text-blue-300 rounded-lg text-[10px] font-bold hover:bg-slate-700 transition-colors"
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {numButtons.map(b => (
          <button 
            key={b} 
            onClick={() => handleBtn(b)}
            className={cn(
              "p-4 rounded-xl font-bold text-sm transition-all active:scale-95",
              b === '=' ? "bg-glass-blue text-white" : 
              ['/', '*', '-', '+'].includes(b) ? "bg-slate-200 text-slate-800" :
              b === 'C' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-700"
            )}
          >
            {b}
          </button>
        ))}
        <button 
          onClick={() => handleBtn('+')}
          className="p-4 rounded-xl font-bold text-sm bg-slate-200 text-slate-800"
        >
          +
        </button>
      </div>
    </div>
  );
};

const GPACalculatorTool = () => {
  const [subjects, setSubjects] = useState([{ grade: 4, hours: 3 }]);
  
  const addSubject = () => setSubjects([...subjects, { grade: 4, hours: 3 }]);
  const updateSubject = (index: number, field: 'grade' | 'hours', val: number) => {
    const newSubs = [...subjects];
    newSubs[index][field] = val;
    setSubjects(newSubs);
  };

  const totalHours = subjects.reduce((acc, s) => acc + s.hours, 0);
  const totalPoints = subjects.reduce((acc, s) => acc + (s.grade * s.hours), 0);
  const gpa = totalHours ? (totalPoints / totalHours).toFixed(2) : '0.00';

  return (
    <div className="w-full space-y-4">
      <div className="text-center p-4 bg-blue-50 rounded-2xl">
        <div className="text-4xl font-black text-glass-blue">{gpa}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase">المعدل التراكمي</div>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
        {subjects.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select 
              value={s.grade} 
              onChange={e => updateSubject(i, 'grade', Number(e.target.value))}
              className="flex-1 p-2 bg-slate-50 rounded-xl text-xs"
            >
              <option value={4}>امتياز (A)</option>
              <option value={3.7}>امتياز مرتفع (A-)</option>
              <option value={3.3}>جيد جداً مرتفع (B+)</option>
              <option value={3}>جيد جداً (B)</option>
              <option value={2}>جيد (C)</option>
              <option value={1}>مقبول (D)</option>
            </select>
            <input 
              type="number" 
              value={s.hours} 
              onChange={e => updateSubject(i, 'hours', Number(e.target.value))}
              className="w-16 p-2 bg-slate-50 rounded-xl text-xs text-center"
              placeholder="ساعات"
            />
          </div>
        ))}
      </div>
      <button onClick={addSubject} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-glass-blue hover:text-glass-blue transition-all">
        + إضافة مادة
      </button>
    </div>
  );
};

const UnitConverterTool = () => {
  const [val, setVal] = useState(1);
  const [type, setType] = useState<'km-m' | 'kg-g' | 'c-f'>('km-m');

  const result = type === 'km-m' ? val * 1000 : type === 'kg-g' ? val * 1000 : (val * 9/5) + 32;

  return (
    <div className="w-full space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'km-m', label: 'كم ⬅️ متر' },
          { id: 'kg-g', label: 'كجم ⬅️ جرام' },
          { id: 'c-f', label: 'سليزيوس ⬅️ فهرنهايت' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => { setType(t.id as any); sounds.playClick(); }}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap",
              type === t.id ? "bg-glass-blue text-white" : "bg-slate-100 text-slate-500"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <input 
          type="number" 
          value={val} 
          onChange={e => setVal(Number(e.target.value))}
          className="liquid-input flex-1 text-center text-xl font-bold"
        />
        <ArrowLeftRight className="text-slate-300" />
        <div className="flex-1 p-4 bg-blue-50 rounded-3xl text-center text-xl font-black text-glass-blue">
          {result.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
