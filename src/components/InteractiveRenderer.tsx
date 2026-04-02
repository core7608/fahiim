import React, { useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { LiveProvider, LivePreview, LiveError } from 'react-live';
import { cn } from '@/src/lib/utils';
import { Code, MessageCircle, Sparkles } from 'lucide-react';

export const FahimVoice: React.FC<{ text: string, position?: 'top' | 'bottom' }> = ({ text, position = 'bottom' }) => (
  <motion.div 
    initial={{ opacity: 0, y: position === 'bottom' ? 10 : -10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={cn(
      "absolute z-20 flex items-start gap-3 max-w-[80%] pointer-events-none",
      position === 'bottom' ? "bottom-4 right-4" : "top-4 right-4"
    )}
  >
    <div className="bg-slate-900 text-white p-3 rounded-2xl rounded-tr-none text-[10px] font-bold shadow-xl border border-slate-700 leading-relaxed">
      {text}
    </div>
    <div className="w-8 h-8 bg-glass-blue rounded-xl flex items-center justify-center shrink-0 shadow-lg">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
  </motion.div>
);

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

const JsxRunner: React.FC<{ code: string }> = ({ code }) => {
  const [showCode, setShowCode] = useState(false);
  
  return (
    <div className="w-full glass-card overflow-hidden border-blue-100 shadow-lg">
      <div className="bg-blue-50/50 p-3 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-400 rounded-full" />
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
          <span className="text-[10px] font-bold text-blue-900 mr-2">عارض فهيم الرسومي</span>
        </div>
        <button 
          onClick={() => setShowCode(!showCode)}
          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-6 bg-white min-h-[150px] flex items-center justify-center relative">
        <LiveProvider code={code} scope={{ motion, cn, FahimVoice, useMotionValue, useState }}>
          <LivePreview />
          <LiveError className="text-xs text-rose-500 bg-rose-50 p-2 rounded-lg mt-2 font-mono" />
        </LiveProvider>
      </div>
      
      {showCode && (
        <div className="p-4 bg-slate-900 text-slate-300 text-[10px] font-mono overflow-x-auto">
          <pre>{code}</pre>
        </div>
      )}
    </div>
  );
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
    } else {
      rendered = <div className="p-4 bg-slate-100 rounded-xl text-xs italic">مكون تفاعلي قيد التطوير...</div>;
    }

    if (rendered && component.fahimComment) {
      return (
        <div className="relative">
          {rendered}
          <FahimVoice text={component.fahimComment} />
        </div>
      );
    }

    return rendered;
  } catch (e) {
    return null;
  }
};
