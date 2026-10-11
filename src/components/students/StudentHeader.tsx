import React, { useState } from 'react';
import { Search, Filter, X, Plus, ChevronDown, RotateCcw } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { motion, AnimatePresence } from 'motion/react';

export const StudentHeader = ({ onAddClick }: { onAddClick: () => void }) => {
  const { filters, setFilter } = useStudentStore();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-md border border-slate-200 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un matricule, nom..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-11 pr-10 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all"
            />
            {filters.search && (
              <button 
                onClick={() => setFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border px-5 py-3 rounded-sm text-xs font-bold transition-all shadow-sm ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={16} />
            {showFilters ? 'Fermer Filtres' : 'Filtres'}
            <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-56 group">
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-sm pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer transition-all"
            >
              <option value="name_asc">Tri: Nom (A-Z)</option>
              <option value="name_desc">Tri: Nom (Z-A)</option>
              <option value="date_new">Tri: Plus récents</option>
              <option value="date_old">Tri: Plus anciens</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
          </div>

          <button 
            onClick={onAddClick}
            className="flex flex-none items-center gap-2 bg-indigo-600 text-white rounded-sm px-6 py-3 text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            Ajouter Étudiant
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="bg-indigo-50/50 border border-indigo-200/50 rounded-md p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-indigo-900/40 tracking-[0.2em] ml-1">Filière d'étude</label>
                <div className="relative group">
                  <select 
                     value={filters.filiere}
                     onChange={(e) => setFilter('filiere', e.target.value)}
                     className="w-full bg-white border border-slate-200 rounded-sm px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all"
                  >
                    <option value="Toutes">Toutes les filières</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Économie">Économie</option>
                    <option value="Communication">Communication</option>
                    <option value="Droit">Droit</option>
                    <option value="Management">Management</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-indigo-900/40 tracking-[0.2em] ml-1">Niveau Académique</label>
                <div className="relative group">
                  <select 
                     value={filters.classe}
                      onChange={(e) => setFilter('classe', e.target.value)}
                     className="w-full bg-white border border-slate-200 rounded-sm px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all"
                  >
                    <option value="Toutes">Tous les niveaux</option>
                    <option value="L1">Licence 1</option>
                    <option value="L2">Licence 2</option>
                    <option value="L3">Licence 3</option>
                    <option value="M1">Master 1</option>
                    <option value="M2">Master 2</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                </div>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setFilter('filiere', 'Toutes');
                    setFilter('classe', 'Toutes');
                    setFilter('search', '');
                  }}
                  className="flex items-center gap-2 text-rose-600 hover:text-white hover:bg-rose-600 border border-transparent hover:border-rose-600 rounded-sm px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
                >
                  <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
                  Effacer les filtres
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
