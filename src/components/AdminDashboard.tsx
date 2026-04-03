import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Users, MessageSquare, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { db, collection, getDocs, addDoc, serverTimestamp, query, where } from '@/src/lib/firebase';
import { User } from '@/src/types';
import { sounds } from '@/src/lib/sounds';

interface AdminDashboardProps {
  admin: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [verifiedUsersCount, setVerifiedUsersCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), where('phoneVerified', '==', true));
      const snapshot = await getDocs(q);
      setVerifiedUsersCount(snapshot.size);
    };
    fetchUsers();
  }, []);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    setStatus('idle');
    sounds.playClick();

    try {
      const q = query(collection(db, 'users'), where('phoneVerified', '==', true));
      const snapshot = await getDocs(q);
      const phoneNumbers = snapshot.docs.map(doc => doc.data().phone);

      if (phoneNumbers.length === 0) {
        alert("مفيش مستخدمين مفعلين رقمهم حالياً.");
        setIsSending(false);
        return;
      }

      // Send to backend for WhatsApp broadcast
      const response = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, phoneNumbers })
      });

      if (response.ok) {
        // Log notification in Firestore
        await addDoc(collection(db, 'notifications'), {
          adminId: admin.uid,
          message,
          recipientCount: phoneNumbers.length,
          timestamp: serverTimestamp()
        });
        
        setStatus('success');
        setMessage('');
        sounds.playSuccess();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Broadcast Error:", error);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-right" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-glass-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black text-slate-800">لوحة تحكم الأدمن</h2>
          <p className="text-sm text-slate-500">إرسال تحديثات واتساب للمشتركين</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              رسالة جديدة
            </h3>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
              {verifiedUsersCount} مستخدم مفعل
            </div>
          </div>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب التحديث اللي عايز تبعته هنا..."
            className="liquid-input w-full h-40 resize-none"
          />

          <button
            onClick={handleBroadcast}
            disabled={isSending || !message.trim()}
            className="glass-button w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>إرسال التحديث للكل</span>
          </button>

          {status === 'success' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm justify-center">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم الإرسال بنجاح!</span>
            </motion.div>
          )}
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            إحصائيات سريعة
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">إجمالي المشتركين</span>
              <span className="font-bold text-slate-800">{verifiedUsersCount}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">آخر تحديث أرسل</span>
              <span className="font-bold text-slate-800">منذ يومين</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
