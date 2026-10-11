import React, { useEffect, useState } from 'react';
import { X, Save, User as UserIcon, MapPin, Calendar as CalendarIcon, Briefcase, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../../types';
import { useStudentStore } from '../../store/useStudentStore';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
}

export const StudentFormModal = ({ isOpen, onClose, student }: StudentFormModalProps) => {
  const { addStudent, updateStudent } = useStudentStore();
  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    filiere: 'Génie Logiciel',
    classe: 'L1',
    birthDate: '',
    birthPlace: '',
    address: '',
    status: 'active'
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        filiere: 'Génie Logiciel',
        classe: 'L1',
        birthDate: '',
        birthPlace: '',
        address: '',
        status: 'active'
      });
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      await updateStudent(student.id, formData);
    } else {
      await addStudent(formData as any);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-[#1e1b4b]/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="bg-white rounded-md shadow-[0_20px_50px_rgba(30,27,75,0.3)] w-full max-w-3xl overflow-hidden border border-white"
          >
            <div className="bg-[#1e1b4b] p-6 text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-indigo-500 rounded-sm flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    {student ? <Save size={20} /> : <UserIcon size={20} />}
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.1em]">
                       {student ? 'Dossier • ' + student.matricule : 'Inscription Nouvel Étudiant'}
                    </h3>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-0.5">Système de gestion académique v2.0</p>
                 </div>
              </div>
              <button 
                onClick={onClose} 
                className="h-10 w-10 flex items-center justify-center rounded-sm hover:bg-white/10 text-white transition-all group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* Identity Section */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[11px] font-black text-indigo-600 uppercase tracking-[0.15em] border-b border-indigo-100 pb-3">
                       <div className="h-2 w-2 rounded-full bg-indigo-600" />
                       Informations Personnelles
                    </div>
                    
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom (Patronyme)</label>
                             <input 
                                required
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value.toUpperCase()})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all uppercase"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Prénom</label>
                             <input 
                                required
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date de naissance</label>
                             <input 
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-mono"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Lieu de naissance</label>
                             <input 
                                type="text"
                                value={formData.birthPlace}
                                onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Adresse de résidence</label>
                          <div className="relative group">
                             <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                             <input 
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-11 pr-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                                placeholder="Numéro, Rue, Ville..."
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Academic Section */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[11px] font-black text-indigo-600 uppercase tracking-[0.15em] border-b border-indigo-100 pb-3">
                       <div className="h-2 w-2 rounded-full bg-emerald-500" />
                       Parcours Académique
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Filière d'étude principale</label>
                          <select 
                             required
                             value={formData.filiere}
                             onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                          >
                             <option value="Génie Logiciel">Génie Logiciel</option>
                             <option value="Économie">Économie</option>
                             <option value="Communication">Communication</option>
                             <option value="Droit">Droit</option>
                             <option value="Management">Management</option>
                          </select>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Niveau / Promotion</label>
                             <select 
                                required
                                value={formData.classe}
                                onChange={(e) => setFormData({...formData, classe: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                             >
                                <option value="L1">Licence 1 (L1)</option>
                                <option value="L2">Licence 2 (L2)</option>
                                <option value="L3">Licence 3 (L3)</option>
                                <option value="M1">Master 1 (M1)</option>
                                <option value="M2">Master 2 (M2)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Statut Administratif</label>
                             <select 
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                             >
                                <option value="active">🟢 ACTIF</option>
                                <option value="suspended">🟡 SUSPENDU</option>
                                <option value="graduated">🔵 DIPLÔMÉ</option>
                             </select>
                          </div>
                       </div>

                       {!student && (
                         <div className="p-4 bg-indigo-50 rounded-md border border-indigo-100 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                            <Hash size={16} className="text-indigo-500 mt-1" />
                            <div>
                               <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Matricule Automatique</p>
                               <p className="text-[10px] text-indigo-600/70 font-semibold mt-1 leading-relaxed">Un identifiant unique sera généré lors de la validation finale du dossier par le système UniFlow.</p>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
               </div>

               <div className="mt-10 flex justify-end items-center gap-6 border-t border-slate-100 pt-8">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Annuler l'inscription
                  </button>
                  <button 
                    type="submit"
                    className="bg-indigo-600 text-white rounded-sm px-10 py-4 text-xs font-black uppercase tracking-[0.1em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center gap-3"
                  >
                    <Save size={18} />
                    {student ? 'Mettre à jour le dossier' : 'Finaliser Inscription'}
                  </button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
