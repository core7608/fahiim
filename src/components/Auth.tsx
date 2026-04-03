import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '@/src/types';
import { UserCircle, GraduationCap, Sparkles, ChevronRight, LogIn } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { sounds } from '@/src/lib/sounds';
import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc, handleFirestoreError, OperationType } from '@/src/lib/firebase';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Login, 1-3: Profile Setup
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    bio: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    sounds.playClick();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser(user);

      // Check if user exists in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          onLogin(userData);
          sounds.playSuccess();
        } else {
          // New user, start profile setup
          setStep(1);
          setFormData({ ...formData, name: user.displayName || '' });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        console.log("User closed the login popup.");
        // No need to show a scary error, just reset loading
      } else {
        console.error("Login Error:", err);
        setError("حصل مشكلة في تسجيل الدخول. جرب تاني كدة؟");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      sounds.playClick();
    } else {
      setLoading(true);
      try {
        const userData: User = {
          uid: currentUser.uid,
          name: formData.name,
          year: formData.year,
          bio: formData.bio,
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '',
          settings: {
            theme: 'liquid',
            gender: 'male',
            googleDriveEnabled: false
          }
        };
        try {
          await setDoc(doc(db, 'users', currentUser.uid), userData);
          onLogin(userData);
          sounds.playSuccess();
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      } catch (error) {
        console.error("Profile Setup Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-right" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-glass-blue rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-blue-200 animate-float">
            <Sparkles className="text-white w-12 h-12" />
          </div>
          <h1 className="text-5xl font-display font-black text-glass-blue tracking-tight">فهيم</h1>
          <p className="text-slate-500 font-medium">مدرسك الـ AI اللي بيفهمك من غير تعقيد</p>
        </div>

        <div className="glass-card p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          
          {step === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <p className="text-center text-slate-600 font-medium">سجل دخولك عشان نبدأ رحلة المذاكرة سوا!</p>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs text-center font-bold border border-rose-100"
                >
                  {error}
                </motion.div>
              )}

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                ) : (
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                )}
                <span>تسجيل الدخول بجوجل</span>
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 mr-2">اسمك إيه يا بطل؟</label>
              <div className="relative">
                <UserCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="اكتب اسمك هنا..."
                  className="liquid-input w-full pr-12"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 mr-2">في سنة كام؟</label>
              <div className="relative">
                <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select 
                  className="liquid-input w-full pr-12 appearance-none"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                >
                  <option value="">اختر سنتك الدراسية</option>
                  <option value="1">أولى ثانوي</option>
                  <option value="2">تانية ثانوي</option>
                  <option value="3">تالتة ثانوي</option>
                </select>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 mr-2">قولي نبذة عنك (اختياري)</label>
              <textarea 
                placeholder="بتحب إيه؟ إيه أكتر مادة صعبة عليك؟"
                className="liquid-input w-full h-32 resize-none"
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />
            </motion.div>
          )}

          {step > 0 && (
            <button 
              onClick={handleNext}
              disabled={loading || (step === 1 ? !formData.name : step === 2 ? !formData.year : false)}
              className="glass-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              <span>{step === 3 ? 'يلا نبدأ!' : 'اللي بعده'}</span>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
        </div>

        {step > 0 && (
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                step === i ? "w-8 bg-glass-blue" : "w-2 bg-slate-200"
              )} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
