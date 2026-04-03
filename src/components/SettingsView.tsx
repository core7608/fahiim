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
  Zap,
  Key,
  User as UserIcon,
  LogOut,
  Save,
  MessageSquare,
  Users,
  HardDrive,
  Upload,
  Check,
  Download
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { User, UserSettings, ThemeConfig } from '@/src/types';
import { sounds } from '@/src/lib/sounds';
import { auth, signOut, db, doc, updateDoc, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { SketchPicker } from 'react-color';
import { saveToDrive, loadFromDrive } from '@/src/services/googleDrive';

const PRESET_THEMES: ThemeConfig[] = [
  { id: 'liquid', name: 'سائل (افتراضي)', colors: { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd', background: '#ffffff', text: '#0f172a' } },
  { id: 'dark', name: 'ليلي هادئ', colors: { primary: '#6366f1', secondary: '#818cf8', accent: '#a5b4fc', background: '#0f172a', text: '#f8fafc' } },
  { id: 'sunset', name: 'غروب الشمس', colors: { primary: '#f43f5e', secondary: '#fb7185', accent: '#fda4af', background: '#fff1f2', text: '#4c0519' } },
  { id: 'forest', name: 'غابة خضراء', colors: { primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7', background: '#f0fdf4', text: '#064e3b' } },
];

interface SettingsProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ user, onBack, onUpdateUser, onLogout }) => {
  const [settings, setSettings] = useState<UserSettings>(user.settings || {
    theme: 'liquid',
    geminiApiKey: '',
    openaiApiKey: '',
    fahimPersonality: '',
    gender: 'male',
    googleDriveEnabled: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const handleDriveSync = async () => {
    setIsSyncing(true);
    sounds.playClick();
    try {
      const data = {
        user: { ...user, settings },
        timestamp: new Date().toISOString()
      };
      await saveToDrive(data);
      sounds.playSuccess();
      alert('تم النسخ الاحتياطي بنجاح إلى Google Drive');
    } catch (error) {
      console.error("Drive Sync Error:", error);
      alert('فشل الاتصال بـ Google Drive. تأكد من تفعيل الـ API وإضافة الـ Client ID.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDriveLoad = async () => {
    setIsSyncing(true);
    sounds.playClick();
    try {
      const data = await loadFromDrive();
      if (data && data.user) {
        setSettings(data.user.settings);
        onUpdateUser(data.user);
        sounds.playSuccess();
        alert('تم استعادة البيانات بنجاح');
      } else {
        alert('لم يتم العثور على نسخ احتياطية');
      }
    } catch (error) {
      console.error("Drive Load Error:", error);
      alert('فشل استعادة البيانات من Google Drive');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    sounds.playClick();
    try {
      try {
        await updateDoc(doc(db, 'users', user.uid), { settings });
        onUpdateUser({ ...user, settings });
        sounds.playSuccess();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    } catch (error) {
      console.error("Save Settings Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const theme = JSON.parse(content);
          if (theme.colors) {
            setSettings({
              ...settings,
              customColors: theme.colors,
              theme: 'custom'
            });
            sounds.playSuccess();
          }
        } else if (file.name.endsWith('.attheme')) {
          // Basic Telegram .attheme parser
          const colors: any = {};
          const lines = content.split('\n');
          lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
              // Convert decimal color to hex
              const intVal = parseInt(value);
              if (!isNaN(intVal)) {
                const hex = '#' + (intVal & 0xFFFFFF).toString(16).padStart(6, '0');
                if (key.includes('chat_inBubble')) colors.primary = hex;
                if (key.includes('windowBackgroundWhite')) colors.background = hex;
                if (key.includes('chat_outBubble')) colors.accent = hex;
              }
            }
          });
          
          if (Object.keys(colors).length > 0) {
            setSettings({
              ...settings,
              customColors: { ...settings.customColors, ...colors },
              theme: 'custom'
            });
            sounds.playSuccess();
          }
        }
      } catch (err) {
        alert('فشل في قراءة ملف الثيم');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTheme = () => {
    const themeData = {
      name: 'My Custom Theme',
      colors: settings.customColors || PRESET_THEMES.find(t => t.id === settings.theme)?.colors,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fahim_theme_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sounds.playSuccess();
  };

  const handleLogout = async () => {
    sounds.playClick();
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="h-full bg-slate-50/50 overflow-y-auto" dir="rtl">
      <div className="max-w-2xl mx-auto p-6 space-y-8 pb-32">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-glass-blue text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
          </button>
        </header>

        <div className="space-y-8">
          {/* Personality & Gender */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">شخصية المعلم</h3>
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-700">
                  <Users className="w-5 h-5 text-glass-blue" />
                  <span className="font-bold">الجنس</span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setSettings({ ...settings, gender: 'male' })}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      settings.gender === 'male' ? "bg-white text-glass-blue shadow-sm" : "text-slate-400"
                    )}
                  >
                    فهيم (ذكر)
                  </button>
                  <button 
                    onClick={() => setSettings({ ...settings, gender: 'female' })}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      settings.gender === 'female' ? "bg-white text-pink-500 shadow-sm" : "text-slate-400"
                    )}
                  >
                    فهيمة (أنثى)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-glass-blue">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-bold">تخصيص الأسلوب</span>
                </div>
                <textarea 
                  value={settings.fahimPersonality}
                  onChange={e => setSettings({ ...settings, fahimPersonality: e.target.value })}
                  placeholder="مثلاً: كن مرحاً واستخدم أمثلة من كرة القدم..."
                  className="liquid-input w-full h-24 resize-none text-sm"
                />
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">الثيمات والألوان</h3>
            <div className="glass-card p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {PRESET_THEMES.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSettings({ ...settings, theme: t.id, customColors: t.colors })}
                    className={cn(
                      "p-3 rounded-2xl border-2 transition-all text-right flex items-center justify-between",
                      settings.theme === t.id ? "border-glass-blue bg-blue-50/50" : "border-slate-100 hover:border-blue-200"
                    )}
                  >
                    <span className="text-sm font-bold">{t.name}</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.background }} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">تخصيص الألوان يدوياً</span>
                  <div className="flex gap-2">
                    {['primary', 'background', 'accent'].map(c => (
                      <div key={c} className="relative">
                        <button 
                          onClick={() => setShowColorPicker(showColorPicker === c ? null : c)}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: (settings.customColors as any)?.[c] || '#000' }}
                        />
                        {showColorPicker === c && (
                          <div className="absolute bottom-full right-0 z-50 mb-2">
                            <SketchPicker 
                              color={(settings.customColors as any)?.[c] || '#000'}
                              onChange={(color) => setSettings({
                                ...settings,
                                theme: 'custom',
                                customColors: { ...settings.customColors, [c]: color.hex }
                              })}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">رفع ثيم (ملف JSON)</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDownloadTheme}
                      className="bg-blue-50 text-glass-blue px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
                      title="تحميل الثيم الحالي"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل</span>
                    </button>
                    <label className="cursor-pointer bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>رفع</span>
                      <input type="file" className="hidden" accept=".json,.attheme" onChange={handleThemeUpload} />
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    يمكنك تحميل ثيمات جاهزة من <a href="https://t.me/attheme" target="_blank" rel="noopener noreferrer" className="text-glass-blue underline">قناة ثيمات تيليجرام</a> أو اطلب من فهيم يصمم لك ثيم جديد!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Google Drive Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">النسخ الاحتياطي</h3>
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Google Drive</p>
                    <p className="text-[10px] text-slate-400">حفظ بياناتك وأدواتك في السحابة</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, googleDriveEnabled: !settings.googleDriveEnabled })}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    settings.googleDriveEnabled ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  )}
                >
                  {settings.googleDriveEnabled ? 'مفعل' : 'تفعيل'}
                </button>
              </div>

              {settings.googleDriveEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleDriveSync}
                    disabled={isSyncing}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span className="text-xs font-bold">نسخ احتياطي</span>
                  </button>
                  <button 
                    onClick={handleDriveLoad}
                    disabled={isSyncing}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 disabled:opacity-50"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs font-bold">استعادة</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* API Keys Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">مفاتيح الـ API</h3>
            <div className="glass-card p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Gemini API Key
                </label>
                <input 
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={e => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="أدخل مفتاح Gemini هنا..."
                  className="liquid-input w-full text-sm"
                />
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">الحساب</h3>
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <p className="font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </section>
        </div>

        <div className="text-center space-y-2 pt-8">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إصدار فهيم v3.0.0</p>
          <p className="text-[10px] text-slate-300">صنع بكل حب لتبسيط العلم</p>
        </div>
      </div>
    </div>
  );
};
