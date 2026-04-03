import React, { useState } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'motion/react';
import { LiveProvider, LivePreview, LiveError } from 'react-live';
import { cn } from '@/src/lib/utils';
import { Code, MessageCircle, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { JsxViewer } from './JsxViewer';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const QuizSim: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    if (option === questions[currentIdx].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="p-8 glass-card bg-emerald-50/30 border-emerald-100 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <Sparkles className="w-10 h-10" />
        </div>
        <div>
          <h4 className="text-2xl font-display font-black text-emerald-900">خلصت الاختبار يا بطل!</h4>
          <p className="text-emerald-700 font-medium mt-2">درجتك: {score} من {questions.length}</p>
        </div>
        <button 
          onClick={resetQuiz}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
        >
          <RotateCcw className="w-5 h-5" />
          <span>جرب تاني</span>
        </button>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="p-6 glass-card bg-blue-50/30 border-blue-100 flex flex-col gap-6" dir="rtl">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">سؤال {currentIdx + 1} من {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn("w-2 h-1 rounded-full", i <= currentIdx ? "bg-blue-500" : "bg-blue-100")} />
          ))}
        </div>
      </div>

      <h4 className="text-lg font-bold text-slate-800 leading-relaxed">{q.question}</h4>

      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={showResult}
            className={cn(
              "w-full p-4 rounded-2xl text-right font-medium transition-all border-2 flex items-center justify-between group",
              selectedOption === opt 
                ? (opt === q.correctAnswer ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50")
                : (showResult && opt === q.correctAnswer ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-white hover:border-blue-200")
            )}
          >
            <span>{opt}</span>
            {showResult && opt === q.correctAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {showResult && selectedOption === opt && opt !== q.correctAnswer && <XCircle className="w-5 h-5 text-rose-500" />}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              selectedOption === q.correctAnswer ? "bg-emerald-100/50 text-emerald-800" : "bg-rose-100/50 text-rose-800"
            )}
          >
            <p className="font-bold mb-1">{selectedOption === q.correctAnswer ? "صح يا وحش! 🔥" : "للاسف غلط.. ركز في اللي جاي"}</p>
            <p className="opacity-80">{q.explanation}</p>
            <button 
              onClick={nextQuestion}
              className="mt-4 w-full bg-white/50 hover:bg-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>{currentIdx + 1 < questions.length ? 'السؤال اللي بعده' : 'شوف النتيجة'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface GravityProps {
  mass1: number;
  mass2: number;
}

const GravitySim: React.FC<GravityProps> = ({ mass1, mass2 }) => {
  const [distance, setDistance] = useState(200);
  const x1 = useMotionValue(0);
  const x2 = useMotionValue(200);
  
  const force = (mass1 * mass2) / Math.pow(distance / 10, 2);

  return (
    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col items-center gap-6 overflow-hidden">
      <h4 className="font-display font-bold text-blue-900">تجربة الجذب العام</h4>
      <div className="relative w-full h-40 flex items-center justify-center">
        <motion.div
          drag="x"
          dragConstraints={{ left: -100, right: 100 }}
          style={{ x: x1 }}
          onDrag={() => setDistance(Math.abs(x2.get() - x1.get()))}
          className="absolute w-12 h-12 bg-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white text-xs font-bold"
        >
          {mass1}kg
        </motion.div>
        
        <motion.div
          drag="x"
          dragConstraints={{ left: -100, right: 100 }}
          style={{ x: x2 }}
          onDrag={() => setDistance(Math.abs(x2.get() - x1.get()))}
          className="absolute w-16 h-16 bg-blue-600 rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white text-xs font-bold"
        >
          {mass2}kg
        </motion.div>
        
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 -z-10" />
      </div>
      
      <div className="w-full grid grid-cols-2 gap-4 text-center">
        <div className="bg-white p-3 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">المسافة</p>
          <p className="font-bold text-blue-600">{distance.toFixed(0)}m</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">قوة الجذب</p>
          <p className="font-bold text-blue-600">{force.toFixed(2)}N</p>
        </div>
      </div>
    </div>
  );
};

const ReactionSim: React.FC<{ elements: string[] }> = ({ elements }) => {
  const [reacted, setReacted] = useState(false);
  return (
    <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex flex-col items-center gap-6">
      <h4 className="font-display font-bold text-emerald-900">مختبر التفاعلات</h4>
      <div className="flex gap-4">
        {elements.map((el, i) => (
          <motion.div
            key={i}
            animate={reacted ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            className="w-12 h-12 bg-white border-2 border-emerald-200 rounded-2xl flex items-center justify-center font-bold text-emerald-600 shadow-sm"
          >
            {el}
          </motion.div>
        ))}
      </div>
      <button 
        onClick={() => setReacted(true)}
        className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors"
      >
        ابدأ التفاعل
      </button>
      {reacted && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-emerald-700">
          تم التفاعل بنجاح! النتيجة مبهرة يا بطل.
        </motion.p>
      )}
    </div>
  );
};

export const JsxRunner: React.FC<{ code: string }> = ({ code }) => {
  return <JsxViewer code={code} />;
};

const GraphSim: React.FC<{ equation: string }> = ({ equation }) => {
  return (
    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col items-center gap-4">
      <h4 className="font-display font-bold text-indigo-900">رسم بياني: {equation}</h4>
      <div className="w-full h-40 bg-white rounded-2xl border border-indigo-100 flex items-center justify-center relative overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 200 100">
          <line x1="0" y1="50" x2="200" y2="50" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="100" y1="0" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="1" />
          <motion.path
            d="M 20 80 Q 100 0 180 80"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />
        </svg>
      </div>
      <p className="text-[10px] text-slate-400">تمثيل تقريبي للدالة {equation}</p>
    </div>
  );
};

export const InteractiveRenderer: React.FC<{ data: string, type?: 'interactive' | 'jsx' }> = ({ data, type = 'interactive' }) => {
  if (type === 'jsx') {
    return <JsxRunner code={data} />;
  }

  try {
    const component = JSON.parse(data);
    let rendered: React.ReactNode = null;

    if (component.type === 'physics') {
      if (component.props.type === 'gravity') {
        rendered = <GravitySim {...component.props} />;
      }
    } else if (component.type === 'chemistry') {
      rendered = <ReactionSim {...component.props} />;
    } else if (component.type === 'math') {
      rendered = <GraphSim {...component.props} />;
    } else if (component.type === 'quiz') {
      rendered = <QuizSim questions={component.props} />;
    } else {
      rendered = <div className="p-4 bg-slate-100 rounded-xl text-xs italic">مكون تفاعلي قيد التطوير...</div>;
    }

    return rendered;
  } catch (e) {
    return null;
  }
};
