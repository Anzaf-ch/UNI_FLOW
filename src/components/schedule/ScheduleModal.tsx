import React, { useEffect, useState } from 'react';
import { X, Save, Clock, BookOpen, User, MapPin, Briefcase, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScheduleSlot } from '../../types';
import { useScheduleStore } from '../../store/useScheduleStore';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot?: ScheduleSlot | null;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const ScheduleModal = ({ isOpen, onClose, slot }: ScheduleModalProps) => {
  const { addSchedule, updateSchedule, activeFiliere } = useScheduleStore();
  const [formData, setFormData] = useState<Partial<ScheduleSlot>>({
    subject: '',
    teacherName: '',
    filiere: activeFiliere,
    classe: 'L1',
    dayOfWeek: 0,
    startTime: '08:00',
    endTime: '10:00',
    roomId: 'S001'
  });

  useEffect(() => {
    if (slot) {
      setFormData(slot);
    } else {
      setFormData({
        subject: '',
        teacherName: '',
        filiere: activeFiliere,
        classe: 'L1',
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '10:00',
        roomId: ''
      });
    }
  }, [slot, isOpen, activeFiliere]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Time validation 07:00 - 17:00
    const startNum = parseInt(formData.startTime!.split(':')[0]);
    const endNum = parseInt(formData.endTime!.split(':')[0]);

    if (startNum < 7 || endNum > 17 || endNum <= startNum) {
      alert("L'horaire doit être entre 07:00 et 17:00, et l'heure de fin doit être après l'heure de début.");
      return;
    }

    let success = false;
    if (slot) {
      success = await updateSchedule(slot.id, formData);
    } else {
      success = await addSchedule(formData as any);
    }

    if (success) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-[#1e1b4b]/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="bg-white rounded-md shadow-[0_20px_50px_rgba(30,27,75,0.3)] w-full max-w-2xl overflow-hidden border border-white"
          >
            <div className="bg-[#1e1b4b] p-6 text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-indigo-500 rounded-sm flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Calendar size={20} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.1em]">
                       {slot ? 'Modification de séance' : 'Nouvelle Planification'}
                    </h3>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-0.5">UniFlow Optimisation</p>
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
                 {/* Main Info */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[11px] font-black text-indigo-600 uppercase tracking-[0.15em] border-b border-indigo-100 pb-3">
                       <div className="h-2 w-2 rounded-full bg-indigo-600" />
                       Détails de l'Enseignement
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Matière / Unité d'Enseignement</label>
                          <input 
                             required
                             type="text"
                             value={formData.subject}
                             onChange={(e) => setFormData({...formData, subject: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                             placeholder="ex: Architecture des Systèmes"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Professeur Responsable</label>
                          <div className="relative group">
                             <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                             <input 
                                required
                                type="text"
                                value={formData.teacherName}
                                onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-11 pr-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                                placeholder="Nom & Prénoms"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Filière</label>
                             <select 
                                required
                                value={formData.filiere}
                                onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                             >
                                <option value="Informatique">Informatique</option>
                                <option value="Droit">Droit</option>
                                <option value="Économie">Économie</option>
                                <option value="Communication">Communication</option>
                                <option value="Médecine">Médecine</option>
                                <option value="Management">Management</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Promotion</label>
                             <select 
                                required
                                value={formData.classe}
                                onChange={(e) => setFormData({...formData, classe: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                             >
                                <option value="L1">L1</option>
                                <option value="L2">L2</option>
                                <option value="L3">L3</option>
                                <option value="M1">M1</option>
                                <option value="M2">M2</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Timing Info */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[11px] font-black text-indigo-600 uppercase tracking-[0.15em] border-b border-indigo-100 pb-3">
                       <div className="h-2 w-2 rounded-full bg-emerald-500" />
                       Temporalité & Localisation
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jour de la Semaine</label>
                          <select 
                             required
                             value={formData.dayOfWeek}
                             onChange={(e) => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})}
                             className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                          >
                             {DAYS.map((day, i) => (
                               <option key={i} value={i}>{day}</option>
                             ))}
                          </select>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Début (Heure)</label>
                             <div className="relative group">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input 
                                   required
                                   type="time"
                                   step="3600"
                                   value={formData.startTime}
                                   onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-11 pr-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-mono"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fin (Heure)</label>
                             <div className="relative group">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input 
                                   required
                                   type="time"
                                   step="3600"
                                   value={formData.endTime}
                                   onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-11 pr-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-mono"
                                />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Salle d'Examen / Salle de Cours</label>
                          <div className="relative group">
                             <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                             <input 
                                required
                                type="text"
                                value={formData.roomId}
                                onChange={(e) => setFormData({...formData, roomId: e.target.value.toUpperCase()})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-11 pr-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-black uppercase tracking-widest"
                                placeholder="ex: SALLE S001"
                             />
                          </div>
                       </div>
                    </div>
                 </div>
               </div>

               <div className="mt-10 flex justify-end items-center gap-6 border-t border-slate-100 pt-8">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    type="submit"
                    className="bg-indigo-600 text-white rounded-sm px-10 py-4 text-xs font-black uppercase tracking-[0.1em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center gap-3"
                  >
                    <Save size={18} />
                    {slot ? 'Confirmer les changements' : 'Enregistrer la séance'}
                  </button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
