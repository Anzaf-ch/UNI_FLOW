import React, { useState } from 'react';
import { Plus, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const FILIERES = ['Informatique', 'Droit', 'Économie', 'Communication', 'Management'];
const CLASSES = ['L1', 'L2', 'L3', 'M1', 'M2'];

const FiliereDropdown: React.FC<{ filiere: string }> = ({ filiere }) => {
  const { activeFiliere, activeClasse, setActiveFiliere, setActiveClasse } = useScheduleStore();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = activeFiliere === filiere;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => {
          setActiveFiliere(filiere);
          setActiveClasse('Toutes');
        }}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${
          isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
        }`}
      >
        {filiere}
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 rounded-sm shadow-xl z-50 py-2 overflow-hidden"
          >
            <button
               onClick={() => {
                 setActiveFiliere(filiere);
                 setActiveClasse('Toutes');
                 setIsOpen(false);
               }}
               className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                 isActive && activeClasse === 'Toutes' 
                 ? 'bg-indigo-50 text-indigo-700' 
                 : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
               }`}
            >
              Toutes les classes
            </button>
            {CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => {
                  setActiveFiliere(filiere);
                  setActiveClasse(cls);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  isActive && activeClasse === cls 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                {cls}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ScheduleHeader = ({ onAddClick }: { onAddClick: () => void }) => {
  const { activeFiliere, activeClasse, schedules } = useScheduleStore();

  const handleSmartCheck = () => {
    const scoped = schedules.filter(s => s.filiere === activeFiliere && (activeClasse === 'Toutes' || s.classe === activeClasse));
    let conflicts = 0;
    for (let i = 0; i < scoped.length; i++) {
      for (let j = i + 1; j < scoped.length; j++) {
        const a = scoped[i];
        const b = scoped[j];
        if (a.dayOfWeek !== b.dayOfWeek) continue;
        const overlap = (a.startTime < b.endTime) && (a.endTime > b.startTime);
        if (overlap && (a.classe === b.classe || a.roomId === b.roomId || a.teacherName === b.teacherName)) conflicts++;
      }
    }
    if (conflicts === 0) toast.success('Analyse intelligente : aucun conflit détecté');
    else toast.error(`Analyse intelligente : ${conflicts} conflit(s) détecté(s)`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tighter">Planification Hebdomadaire</h2>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
               <Filter size={12} className="text-indigo-500" />
               Filtre Actif : <span className="text-indigo-600">{activeFiliere} {activeClasse !== 'Toutes' ? `• ${activeClasse}` : ''}</span>
             </p>
          </div>
        </div>
        <div className="flex gap-4">
           <button
             onClick={handleSmartCheck}
             title="Analyse intelligente des conflits"
             className="bg-white border border-slate-200 h-12 w-12 flex items-center justify-center rounded-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
             <Sparkles size={20} />
           </button>
           <button 
             onClick={onAddClick}
             className="bg-indigo-600 text-white rounded-sm px-8 h-12 text-[11px] font-black uppercase tracking-[0.15em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3"
           >
             <Plus size={18} />
             Ajouter un cours
           </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-md border border-slate-200 shadow-sm w-fit max-w-full overflow-x-auto scrollbar-hide">
         <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 flex items-center gap-2">
            Filière
         </div>
         <div className="flex gap-2">
           {FILIERES.map(f => (
             <FiliereDropdown key={f} filiere={f} />
           ))}
         </div>
      </div>
    </div>
  );
};
