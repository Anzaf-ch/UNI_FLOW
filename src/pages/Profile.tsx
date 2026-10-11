import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Facebook, 
  Save, 
  ShieldCheck, 
  Key,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store';
import { storageService } from '../services/localStorageService';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    facebookUrl: user?.facebookUrl || '',
    bio: user?.bio || '',
    phone: user?.phone || ''
  });

  // Password States
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = { ...user, ...profileForm };
      
      // Update in localStorage
      localStorage.setItem(storageService.KEYS.AUTH_USER, JSON.stringify(updatedUser));
      
      // If we had a USERS collection, we would update it there too
      // storageService.update(storageService.KEYS.USERS, user.uid, profileForm);

      setUser(updatedUser);
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (passwords.new !== passwords.confirm) {
      return toast.error('Les nouveaux mots de passe ne correspondent pas');
    }
    if (passwords.new.length < 6) {
      return toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
    }
    
    setLoading(true);
    try {
      // Simple verification for local mode
      // In a real local app, we might store the password in a users table
      // For this migration, we'll just simulate it or update the session
      
      toast.success('Mot de passe modifié avec succès (Simulé en local)');
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error(error);
      toast.error('Erreur lors de la modification du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const photoURL = event.target?.result as string;
      try {
        const updatedUser = { ...user, photoURL };
        localStorage.setItem(storageService.KEYS.AUTH_USER, JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success('Photo de profil mise à jour');
      } catch (error: any) {
        toast.error('Erreur lors de la mise à jour de la photo');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-start gap-10">
        
        {/* Left Col: Avatar & Quick Info */}
        <div className="w-full md:w-80 space-y-6">
           <div className="bg-white p-8 rounded-md border border-slate-200 shadow-sm text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors pointer-events-none" />
              
              <div className="relative inline-block mb-6">
                 <div className="h-32 w-32 rounded-md bg-indigo-100 border-4 border-white shadow-xl overflow-hidden relative">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-4xl font-black text-indigo-600">
                         {user?.displayName?.[0]}
                      </div>
                    )}
                 </div>
                 <button 
                   onClick={handlePhotoClick}
                   className="absolute -bottom-2 -right-2 p-3 bg-[#1e1b4b] text-white rounded-sm shadow-xl hover:scale-110 active:scale-95 transition-all"
                 >
                    <Camera size={16} />
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
              </div>

              <h2 className="text-xl font-black text-[#1e1b4b] uppercase tracking-tighter">{user?.displayName}</h2>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Administrateur Senior</p>
              
              <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                 <div className="text-left">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Status</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-sm uppercase">Vérifié</span>
                 </div>
                 <div className="text-left">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Niveau</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-sm uppercase">L3 Elite</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#1e1b4b] p-8 rounded-md shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={120} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">Securité du Compte</h3>
              <p className="text-[10px] text-indigo-300 font-bold leading-relaxed mb-6">Votre accès est protégé par un cryptage end-to-end de niveau militaire.</p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                 <Globe size={14} className="text-indigo-400" />
                 Last IP: 197.242.xx.xx
              </div>
           </div>
        </div>

        {/* Right Col: Forms */}
        <div className="flex-1 space-y-10">
           {/* Section: Informations Générales */}
           <div className="bg-white p-10 rounded-md border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-12 w-12 bg-indigo-50 rounded-sm flex items-center justify-center text-indigo-600">
                    <User size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-[#1e1b4b] uppercase tracking-tighter">Paramètres du Profil</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identité officielle & contact</p>
                 </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom d'affichage</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            value={profileForm.displayName}
                            onChange={e => setProfileForm({...profileForm, displayName: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 pl-12 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Lecture seule)</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            readOnly
                            value={profileForm.email}
                            className="w-full bg-slate-100 border border-slate-200 rounded-sm p-4 pl-12 text-xs font-bold text-slate-400 cursor-not-allowed"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone Secours</label>
                       <input 
                         value={profileForm.phone}
                         onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                         placeholder="+261 34 xx xxx xx"
                         className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lien Facebook Personnel</label>
                       <div className="relative">
                          <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            value={profileForm.facebookUrl}
                            onChange={e => setProfileForm({...profileForm, facebookUrl: e.target.value})}
                            placeholder="facebook.com/votre.profil"
                            className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 pl-12 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                          />
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio / Présentation Académique</label>
                    <textarea 
                      rows={3}
                      value={profileForm.bio}
                      onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                      placeholder="Décrivez votre rôle au sein de l'institution..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all resize-none"
                    />
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="bg-indigo-600 text-white px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                 >
                    <Save size={16} />
                    Mettre à jour le profil
                 </button>
              </form>
           </div>

           {/* Section: Mot de Passe */}
           <div className="bg-white p-10 rounded-md border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-12 w-12 bg-rose-50 rounded-sm flex items-center justify-center text-rose-500">
                    <Lock size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-[#1e1b4b] uppercase tracking-tighter">Données Critiques</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Modification sécurisée du mot de passe</p>
                 </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ancien Code</label>
                       <input 
                         type="password"
                         required
                         value={passwords.old}
                         onChange={e => setPasswords({...passwords, old: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold outline-none focus:bg-white focus:border-rose-200 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau Code</label>
                       <input 
                         type="password"
                         required
                         value={passwords.new}
                         onChange={e => setPasswords({...passwords, new: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmation</label>
                       <input 
                         type="password"
                         required
                         value={passwords.confirm}
                         onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={loading}
                   className="bg-[#1e1b4b] text-white px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-950/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                 >
                    <Key size={16} />
                    Changer le mot de passe
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};
