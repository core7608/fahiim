import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  Moon, 
  Sun, 
  Languages, 
  Shield, 
  Bell, 
  ChevronLeft,
  Palette,
  Zap
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

import { sounds } from '@/src/lib/sounds';

interface SettingsProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ onBack }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [notifications, setNotifications] = useState(true);

  const sections = [
    {
      title: 'التجربة البصرية',
      items: [
        { 
          id: 'theme', 
          label: 'الوضع الليلي', 
          icon: darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />,
          action: () => {
            setDarkMode(!darkMode);
            sounds.playClick();
          },
          value: darkMode ? 'مفعل' : 'معطل'
        },
        { 
          id: 'colors', 
          label: 'ألوان الواجهة', 
          icon: <Palette className="w-5 h-5" />,
          value: 'أزرق زجاجي'
        }
      ]
    },
    {
      title: 'الصوت والذكاء',
      items: [
        { 
          id: 'voice', 
          label: 'سرعة صوت فهيم', 
          icon: <Volume2 className="w-5 h-5" />,
          action: () => {
            setVoiceSpeed(prev => prev === 1.5 ? 1 : prev + 0.25);
            sounds.playClick();
          },
          value: `${voiceSpeed}x`
        },
        { 
          id: 'level', 
          label: 'مستوى الشرح', 
          icon: <Zap className="w-5 h-5" />,
          value: 'مبسط جداً'
        }
      ]
    },
    {
      title: 'الأمان والتنبيهات',
      items: [
        { 
          id: 'notifs', 
          label: 'التنبيهات الذكية', 
          icon: <Bell className="w-5 h-5" />,
          action: () => {
            setNotifications(!notifications);
            sounds.playClick();
          },
          value: notifications ? 'مفعلة' : 'معطلة'
        },
        { 
          id: 'privacy', 
          label: 'خصوصية البيانات', 
          icon: <Shield className="w-5 h-5" />,
          value: 'محمية'
        }
      ]
    }
  ];

  return (
    <div className="h-full bg-slate-50/50 overflow-y-auto" dir="rtl">
      <div className="max-w-2xl mx-auto p-6 space-y-8 pb-32">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => {
              onBack();
              sounds.playClick();
            }}
            className="p-2 hover:bg-white rounded-2xl transition-colors text-slate-400"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-3xl font-display font-black text-slate-900">الإعدادات</h1>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">{section.title}</h3>
              <div className="glass-card overflow-hidden">
                {section.items.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={cn(
                      "w-full p-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors text-right",
                      idx !== section.items.length - 1 && "border-b border-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-glass-blue shadow-sm">
                        {item.icon}
                      </div>
                      <span className="font-bold text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-glass-blue bg-blue-50 px-3 py-1 rounded-full">
                      {item.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-2 pt-8">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إصدار فهيم v2.0.4</p>
          <p className="text-[10px] text-slate-300">صنع بكل حب لتبسيط العلم</p>
        </div>
      </div>
    </div>
  );
};
