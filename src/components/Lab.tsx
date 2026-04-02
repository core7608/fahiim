import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlaskConical, Zap, Calculator, Dna, Telescope, Scroll, ChevronLeft, Play, Sparkles, MessageCircle } from 'lucide-react';
import { LABS } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { sounds } from '@/src/lib/sounds';
import { FahimVoice } from './InteractiveRenderer';

const IconMap: Record<string, any> = {
  FlaskConical, Zap, Calculator, Dna, Telescope, Scroll
};

export const Lab: React.FC = () => {
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [subLab, setSubLab] = useState<string | null>(null);

  const currentLab = LABS.find(l => l.id === selectedLab);

  return (
    <div className="h-full bg-slate-50/50 p-6 overflow-y-auto" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-display font-black text-slate-900">مختبر فهيم</h1>
          <p className="text-slate-500 font-medium">جرب بنفسك وشوف العلم وهو بيتحرك قدامك</p>
        </header>

        <AnimatePresence mode="wait">
          {!selectedLab ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {LABS.map((lab) => {
                const Icon = IconMap[lab.icon];
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setSelectedLab(lab.id);
                      sounds.playClick();
                    }}
                    className="glass-card p-6 flex flex-col items-center gap-4 hover:scale-[1.02] transition-all group text-center"
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6",
                      lab.color, "bg-opacity-10"
                    )}>
                      <Icon className={cn("w-8 h-8", lab.color.replace('bg-', 'text-'))} />
                    </div>
                    <span className="font-bold text-slate-700">{lab.name}</span>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="sandbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <button 
                onClick={() => { 
                  setSelectedLab(null); 
                  setSubLab(null); 
                  sounds.playClick();
                }}
                className="flex items-center gap-2 text-glass-blue font-bold hover:gap-3 transition-all"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
                <span>الرجوع للمختبرات</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sub-labs sidebar */}
                <div className="md:col-span-1 space-y-2">
                  {['تجارب أساسية', 'مستوى متقدم', 'تحديات', 'مراجعة سريعة'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSubLab(s);
                        sounds.playClick();
                      }}
                      className={cn(
                        "w-full p-3 rounded-2xl text-right font-bold transition-all",
                        subLab === s ? "bg-glass-blue text-white shadow-lg" : "bg-white text-slate-500 hover:bg-blue-50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Sandbox Area */}
                <div className="md:col-span-3 glass-card p-8 min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
                  
                  <div className="w-full h-full relative z-10">
                    <FahimVoice 
                      text={subLab ? `إيه رأيك في قسم ${subLab}؟ لو عايزني أغير أي حاجة في التجربة قولي في الشات!` : "اختار التجربة اللي عايزني أشرحهالك يا بطل!"} 
                      position="top"
                    />
                    {selectedLab === 'physics' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800">محاكاة البندول البسيط</h3>
                        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden">
                          <motion.div
                            animate={{ rotate: [30, -30, 30] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 w-1 h-40 bg-slate-400 origin-top flex flex-col items-center"
                          >
                            <div className="w-8 h-8 bg-blue-600 rounded-full mt-40 shadow-lg" />
                          </motion.div>
                          <div className="absolute top-0 w-full h-1 bg-slate-200" />
                        </div>
                        <p className="text-sm text-slate-500">لاحظ كيف تتغير السرعة عند أقصى إزاحة وفي المنتصف.</p>
                      </div>
                    )}

                    {selectedLab === 'chemistry' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800">مقياس الـ pH</h3>
                        <div className="flex flex-col items-center gap-8">
                          <div className="w-full h-12 bg-gradient-to-r from-red-500 via-green-500 to-violet-500 rounded-full relative">
                            <motion.div 
                              drag="x"
                              dragConstraints={{ left: 0, right: 280 }}
                              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-slate-800 rounded-full shadow-xl cursor-grab active:cursor-grabbing"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4 w-full">
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                              <span className="block font-bold text-red-600">حمضي</span>
                              <span className="text-[10px] text-slate-400">0 - 6</span>
                            </div>
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                              <span className="block font-bold text-green-600">متعادل</span>
                              <span className="text-[10px] text-slate-400">7</span>
                            </div>
                            <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
                              <span className="block font-bold text-violet-600">قاعدي</span>
                              <span className="text-[10px] text-slate-400">8 - 14</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLab === 'math' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800">رسم الدوال البيانية</h3>
                        <div className="h-64 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
                          <svg width="100%" height="100%" viewBox="0 0 200 200">
                            <line x1="0" y1="100" x2="200" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                            <line x1="100" y1="0" x2="100" y2="200" stroke="#cbd5e1" strokeWidth="1" />
                            <motion.path
                              d="M 0 100 Q 50 0 100 100 T 200 100"
                              fill="none"
                              stroke="#0056D2"
                              strokeWidth="3"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 2 }}
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-500">دالة الجيب (Sine Function) بتوضح التكرار الدوري.</p>
                      </div>
                    )}

                    {['biology', 'astronomy', 'history'].includes(selectedLab || '') && (
                      <div className="space-y-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse mx-auto">
                          <Play className="text-glass-blue w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-slate-900">ساحة عرض {currentLab?.name}</h2>
                          <p className="text-slate-500 max-w-md mx-auto">
                            {subLab ? `أهلاً بك في قسم ${subLab}. ` : ''}
                            جاري تحميل المحتوى التفاعلي المتقدم لهذا القسم...
                          </p>
                        </div>
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
