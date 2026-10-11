import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { storageService } from '../services/localStorageService';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin123');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation d'un délai réseau pour l'UX
    setTimeout(() => {
      const user = storageService.login(email, password);
      
      if (user) {
        setUser(user as any);
        toast.success('Connexion réussie');
        navigate('/');
      } else {
        toast.error('Identifiants invalides (admin@admin.com / admin123)');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm overflow-hidden rounded-md bg-white shadow-[0_30px_70px_rgba(30,27,75,0.1)] border border-white relative z-10"
      >
        <div className="bg-[#1e1b4b] p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <LogIn size={100} />
          </div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-sm bg-indigo-600 shadow-xl shadow-indigo-600/40 border border-indigo-400/30"
          >
            <span className="text-3xl font-black italic tracking-tighter">U</span>
          </motion.div>
          
          <h1 className="text-2xl font-black tracking-tighter uppercase tracking-[0.2em] mb-1">UniFlow</h1>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Accès Administration</p>
        </div>

        <div className="p-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Académique</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-sm py-4 pl-12 pr-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  placeholder="admin@admin.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mot de Passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-sm py-4 pl-12 pr-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-sm bg-[#1e1b4b] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-950 transition-all disabled:opacity-50 shadow-xl shadow-indigo-950/20 active:scale-[0.98]"
            >
              {loading ? 'Authentification...' : 'Se Connecter'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Mode Démonstration Local Uniquement
             </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local Database Mode</span>
             </div>
             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">OFFLINE ACCESS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
