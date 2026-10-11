import React, { useState } from 'react';
import { Clock, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { ScheduleSlot } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 07:00 to 17:00

export const ScheduleGrid = ({ onEdit }: { onEdit: (slot: ScheduleSlot) => void }) => {
  const { schedules, activeFiliere, activeClasse, deleteSchedule } = useScheduleStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredSchedules = schedules.filter(s => {
    const filiereMatch = s.filiere === activeFiliere;
    const classeMatch = activeClasse === 'Toutes' || s.classe === activeClasse;
    return filiereMatch && classeMatch;
  });

  const getSlot = (dayIndex: number, hour: number) => {
    return filteredSchedules.find(s => {
      const slotHour = parseInt(s.startTime.split(':')[0]);
      return s.dayOfWeek === dayIndex && slotHour === hour;
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md overflow-hidden shadow-sm flex flex-col transition-all">
       {/* Header Days */}
       <div className="grid grid-cols-8 border-b border-slate-200 bg-[#1e1b4b]">
          <div className="p-4 border-r border-white/5" />
          {DAYS.map((day) => (
            <div key={day} className="p-4 text-center border-r border-white/5 last:border-r-0">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">{day}</span>
            </div>
          ))}
       </div>

       {/* Time Slots */}
       <div className="max-h-[850px] overflow-y-auto scrollbar-hide">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-100 last:border-b-0">
               <div className="p-4 text-right pr-6 border-r border-slate-100 bg-white flex flex-col items-end justify-center min-h-[140px]">
                  <span className="text-sm font-black text-[#1e1b4b] tabular-nums leading-none">{hour.toString().padStart(2, '0')}:00</span>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">H{hour}</span>
               </div>
               {DAYS.map((_, dayIdx) => {
                 const slot = getSlot(dayIdx, hour);
                 
                 return (
                   <div key={dayIdx} className={`p-2 min-h-[140px] border-r border-slate-100 last:border-r-0 transition-all relative ${slot ? 'bg-slate-50/50' : 'hover:bg-indigo-50/30 cursor-crosshair'}`}>
                      {slot && (
                        <motion.div 
                          layoutId={`slot-${slot.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                          className="h-full bg-white border border-slate-200 rounded-md p-5 shadow-lg border-l-[4px] border-l-indigo-600 flex flex-col justify-between group/card relative transition-all"
                        >
                           <div>
                              <div className="flex justify-between items-start gap-2 mb-3">
                                 <h4 className="text-xs font-black text-[#1e1b4b] leading-tight line-clamp-2 uppercase tracking-tight">
                                   {slot.subject}
                                 </h4>
                                 <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md shrink-0 border border-indigo-100">
                                    {slot.classe}
                                 </span>
                              </div>
                              <div className="text-[10px] text-slate-700 font-bold flex items-center gap-2">
                                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                 {slot.teacherName}
                              </div>
                           </div>

                           <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex flex-col gap-2">
                                 <span className="text-xs text-[#1e1b4b] font-black uppercase flex items-center gap-2 tracking-tighter">
                                    <Clock size={12} className="text-indigo-500" /> {slot.startTime} - {slot.endTime}
                                 </span>
                                 <span className="text-[9px] text-slate-400 font-black uppercase flex items-center gap-2">
                                    <MapPin size={10} className="text-slate-300" /> SALLE {slot.roomId}
                                 </span>
                              </div>

                              <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all translate-y-2 group-hover/card:translate-y-0">
                                 <button 
                                   onClick={() => onEdit(slot)}
                                   className="h-8 w-8 rounded-sm bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100 hover:border-indigo-100"
                                   title="Modifier"
                                 >
                                    <Edit2 size={12} />
                                 </button>
                                 <button 
                                   onClick={() => setConfirmDelete(slot.id)}
                                   className="h-8 w-8 rounded-sm bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center border border-slate-100 hover:border-rose-100"
                                   title="Supprimer"
                                 >
                                    <Trash2 size={12} />
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                      )}
                   </div>
                 );
               })}
            </div>
          ))}
       </div>

       <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-[#1e1b4b]/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-md shadow-2xl w-full max-w-sm overflow-hidden border border-white p-8"
            >
              <div className="text-center">
                 <div className="mx-auto h-16 w-16 bg-rose-50 rounded-sm flex items-center justify-center text-rose-500 mb-6 shadow-sm">
                    <Trash2 size={28} />
                 </div>
                 <h3 className="text-lg font-black text-[#1e1b4b] uppercase tracking-tighter">Suppression de séance</h3>
                 <p className="text-xs text-slate-500 mt-3 font-bold leading-relaxed uppercase tracking-widest px-4">Êtes-vous certain de vouloir retirer ce cours de l'emploi du temps actuel ?</p>
              </div>
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-slate-100 text-slate-500 rounded-sm py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    deleteSchedule(confirmDelete);
                    setConfirmDelete(null);
                  }}
                  className="flex-1 bg-rose-600 text-white rounded-sm py-4 text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-rose-600/30 hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
