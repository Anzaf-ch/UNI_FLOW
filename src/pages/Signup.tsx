import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import { storageService } from '../services/localStorageService';
import { useAuthStore } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { UserProfile } from '../types';

export const Signup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    if (password.length < 6) {
      return toast.error('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    setLoading(true);

    setTimeout(() => {
      const result = storageService.register(email, password, name);

      if (result.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      setUser(result.user as UserProfile);
      toast.success('Compte créé avec succès');
      navigate('/');
      setLoading(false);
    }, 600);
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
        <div className="bg-indigo-600 p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <UserPlus size={100} />
          </div>
          
          <h1 className="text-2xl font-black tracking-tighter uppercase tracking-[0.2em] mb-1">Inscription</h1>
          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-[0.3em]">Nouveau Compte Administrateur</p>
        </div>

        <div className="p-10 space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-sm py-4 pl-12 pr-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirmer mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-sm py-4 pl-12 pr-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-sm bg-indigo-600 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Déjà un compte ?{' '}
               <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4">Se connecter</Link>
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
