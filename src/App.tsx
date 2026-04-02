import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Beaker, Settings, User as UserIcon, Sparkles, Calendar, Wrench } from 'lucide-react';
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';
import { Lab } from './components/Lab';
import { Toolbox } from './components/Toolbox';
import { SettingsView } from './components/SettingsView';
import { User, INITIAL_STUDY_PLAN, StudyItem } from './types';
import { cn } from './lib/utils';
import { sounds } from './lib/sounds';

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'lab' | 'plan' | 'profile' | 'settings' | 'tools'>('chat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyItem[]>(INITIAL_STUDY_PLAN);

  const toggleStudyItem = (id: string) => {
    setStudyPlan(prev => prev.map(item => {
      if (item.id === id) {
        const newState = !item.completed;
        if (newState) sounds.playSuccess();
        else sounds.playToggle();
        return { ...item, completed: newState };
      }
      return item;
    }));
  };

  const generatePDF = () => {
    if (!user) return;
    setIsGenerating(true);
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Fahim AI Tutor - Study Report', 20, 20);
    doc.setFontSize(16);
    doc.text(`Student: ${user.name}`, 20, 40);
    doc.text(`Year: ${user.year}`, 20, 50);
    doc.text(`Bio: ${user.bio || 'N/A'}`, 20, 60);
    doc.text('Study Progress: Excellent', 20, 80);
    doc.save('fahim-report.pdf');
    setIsGenerating(false);
  };

  const generateZIP = async () => {
    setIsGenerating(true);
    const zip = new JSZip();
    zip.file("hello.txt", "Welcome to Fahim AI Tutor!\nThis is your study package.");
    const folder = zip.folder("lessons");
    folder?.file("physics.txt", "Physics notes...");
    folder?.file("chemistry.txt", "Chemistry notes...");
    
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "fahim-package.zip";
    link.click();
    setIsGenerating(false);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden font-sans">
      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <Chat user={user} studyPlan={studyPlan} />
            </motion.div>
          )}
          {activeTab === 'lab' && (
            <motion.div 
              key="lab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <Lab />
            </motion.div>
          )}
          {activeTab === 'tools' && (
            <motion.div 
              key="tools"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <Toolbox />
            </motion.div>
          )}
          {activeTab === 'plan' && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full p-8 overflow-y-auto"
              dir="rtl"
            >
              <header className="mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-display font-black text-slate-900">خطة المذاكرة</h1>
                  <p className="text-slate-500 font-medium">جدولك النهاردة يا بطل</p>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-glass-blue">
                    {Math.round((studyPlan.filter(i => i.completed).length / studyPlan.length) * 100)}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">نسبة الإنجاز</div>
                </div>
              </header>
              
              <div className="space-y-4">
                {studyPlan.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    onClick={() => toggleStudyItem(item.id)}
                    className={cn(
                      "glass-card p-4 flex items-center justify-between border-r-4 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                      item.completed ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-xs font-bold text-slate-400 w-16">{item.time}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">{item.subject}</h4>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase",
                            item.difficulty === 'hard' ? "bg-rose-100 text-rose-600" :
                            item.difficulty === 'medium' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                          )}>
                            {item.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{item.topic}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                    )}>
                      {item.completed && <Sparkles className="w-3 h-3" />}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 glass-card bg-blue-50/30 border-none">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-glass-blue" />
                  <h4 className="font-bold text-slate-800">نصيحة فهيم</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {studyPlan.filter(i => i.completed).length === 0 ? "يالا يا بطل ابدأ أول مادة عشان نشجع بعض!" :
                   studyPlan.every(i => i.completed) ? "عاش يا وحش! خلصت كل اللي وراك النهاردة، روح ارتاح بقى." :
                   "عاش يا بطل، كمل مجهودك وفاضلك حاجات بسيطة وتخلص جدولك."}
                </p>
              </div>
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full p-8 flex flex-col items-center justify-center text-center space-y-6"
              dir="rtl"
            >
              <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center relative">
                <UserIcon className="w-16 h-16 text-slate-400" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-glass-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black text-slate-900">{user.name}</h2>
                <p className="text-glass-blue font-bold">طالب في السنة {user.year}</p>
                <p className="text-slate-500 max-w-xs">{user.bio || "مفيش نبذة مكتوبة.. بس أكيد أنت بطل!"}</p>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                <div className="text-right mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">أدوات الملفات</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      generatePDF();
                      sounds.playClick();
                    }}
                    disabled={isGenerating}
                    className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">{isGenerating ? 'جاري...' : 'صنع PDF'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      generateZIP();
                      sounds.playClick();
                    }}
                    disabled={isGenerating}
                    className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">{isGenerating ? 'جاري...' : 'صنع ZIP'}</span>
                  </button>
                </div>
                
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="glass-card w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-700">الإعدادات</span>
                  <Settings className="w-5 h-5 text-slate-400" />
                </button>
                <button 
                  onClick={() => setUser(null)}
                  className="w-full p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-3xl transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <SettingsView onBack={() => setActiveTab('profile')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-6 pb-2">
        <NavButton 
          active={activeTab === 'chat'} 
          onClick={() => {
            setActiveTab('chat');
            sounds.playClick();
          }} 
          icon={<MessageSquare />} 
          label="المحادثة" 
        />
        <NavButton 
          active={activeTab === 'lab'} 
          onClick={() => {
            setActiveTab('lab');
            sounds.playClick();
          }} 
          icon={<Beaker />} 
          label="المختبر" 
        />
        <NavButton 
          active={activeTab === 'tools'} 
          onClick={() => {
            setActiveTab('tools');
            sounds.playClick();
          }} 
          icon={<Wrench />} 
          label="الأدوات" 
        />
        <NavButton 
          active={activeTab === 'plan'} 
          onClick={() => {
            setActiveTab('plan');
            sounds.playClick();
          }} 
          icon={<Calendar />} 
          label="الخطة" 
        />
        <NavButton 
          active={activeTab === 'profile' || activeTab === 'settings'} 
          onClick={() => {
            setActiveTab('profile');
            sounds.playClick();
          }} 
          icon={<UserIcon />} 
          label="بروفايلي" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 relative",
        active ? "text-glass-blue" : "text-slate-400"
      )}
    >
      <div className={cn(
        "p-2 rounded-2xl transition-all duration-300",
        active ? "bg-blue-50 scale-110" : "bg-transparent"
      )}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" }) : icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-dot"
          className="absolute -bottom-2 w-1 h-1 bg-glass-blue rounded-full"
        />
      )}
    </button>
  );
}

