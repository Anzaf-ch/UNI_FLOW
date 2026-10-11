import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, AlertCircle, Eye, UserX, UserCheck, GraduationCap } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { Student } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const StudentTable = ({ onEdit }: { onEdit: (student: Student) => void }) => {
  const { students, loading, filters, setFilter, deleteStudent, updateStudent } = useStudentStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredStudents = students
    .filter(s => {
      const searchMatch = 
        s.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.matricule.toLowerCase().includes(filters.search.toLowerCase());
      
      const filiereMatch = filters.filiere === 'Toutes' || s.filiere === filters.filiere;
      const classeMatch = filters.classe === 'Toutes' || s.classe === filters.classe;
      
      return searchMatch && filiereMatch && classeMatch;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'name_asc') return a.lastName.localeCompare(b.lastName);
      if (filters.sortBy === 'name_desc') return b.lastName.localeCompare(a.lastName);
      if (filters.sortBy === 'date_new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filters.sortBy === 'date_old') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-6">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Chargement des données</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-200 rounded-md bg-white shadow-sm">
        <div className="h-20 w-20 bg-indigo-50 rounded-sm flex items-center justify-center text-indigo-200 mb-6 group hover:scale-110 transition-transform cursor-pointer">
           <AlertCircle size={40} className="group-hover:text-indigo-400 transition-colors" />
        </div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Aucun dossier trouvé</h3>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-xs font-semibold">Nous n'avons trouvé aucun étudiant correspondant à vos critères de recherche actuels.</p>
        <button 
          onClick={() => { setFilter('search', ''); setFilter('filiere', 'Toutes'); setFilter('classe', 'Toutes'); }} 
          className="mt-6 px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          Voir tous les étudiants
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left">
          <thead className="bg-[#1e1b4b] text-[11px] text-indigo-100 uppercase tracking-[0.1em] font-black">
            <tr>
              <th className="px-8 py-5">Étudiant</th>
              <th className="px-8 py-5">Identifiant</th>
              <th className="px-8 py-5">Parcours & Niveau</th>
              <th className="px-8 py-5 text-center">Statut Actuel</th>
              <th className="px-8 py-5 text-right">Gestion</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((student) => (
                <motion.tr 
                  key={student.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 tracking-tight">
                          {student.lastName} {student.firstName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Enrolé le {new Date(student.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 font-mono text-[11px] font-black text-indigo-600">
                    <span className="bg-indigo-50 px-2 py-1 rounded-sm border border-indigo-100">{student.matricule}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-black uppercase text-slate-800 tracking-tight">
                        {student.filiere}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-[0.1em]">{student.classe}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         student.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                         student.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                         'bg-slate-50 text-slate-700 border-slate-100'
                       }`}>
                         {student.status === 'active' ? 'Académique • Actif' : student.status === 'suspended' ? 'En Suspension' : 'Diplômé'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit(student)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-sm transition-all border border-transparent hover:border-indigo-100"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(student.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-all border border-transparent hover:border-rose-100"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setMenuOpenId(menuOpenId === student.id ? null : student.id)}
                          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm transition-all"
                          title="Plus d'actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpenId === student.id && (
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-xl z-30 overflow-hidden text-left">
                            <button
                              onClick={() => { toast(`${student.lastName} ${student.firstName} • ${student.matricule}`); setMenuOpenId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                              <Eye size={14} /> Voir le dossier
                            </button>
                            {student.status === 'active' ? (
                              <button
                                onClick={() => { updateStudent(student.id, { status: 'suspended' as any }); setMenuOpenId(null); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <UserX size={14} /> Suspendre
                              </button>
                            ) : (
                              <button
                                onClick={() => { updateStudent(student.id, { status: 'active' as any }); setMenuOpenId(null); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <UserCheck size={14} /> Réactiver
                              </button>
                            )}
                            <button
                              onClick={() => { updateStudent(student.id, { status: 'graduated' as any }); setMenuOpenId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <GraduationCap size={14} /> Marquer diplômé
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="bg-[#1e1b4b] px-8 py-4 flex justify-between items-center text-[10px]">
        <span className="text-indigo-300/60 font-black uppercase tracking-[0.2em]">Base de données Étudiants • {filteredStudents.length} dossiers</span>
        <div className="flex gap-6">
           <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-emerald-400 font-black uppercase tracking-widest">Connectivité Live</span>
           </div>
           <span className="text-indigo-300/40 font-bold">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-md shadow-2xl w-full max-w-xs overflow-hidden border border-slate-100 p-8"
            >
              <div className="text-center">
                 <div className="mx-auto h-16 w-16 bg-rose-50 rounded-sm flex items-center justify-center text-rose-500 mb-6">
                    <AlertCircle size={32} />
                 </div>
                 <h3 className="text-lg font-black text-[#1e1b4b] uppercase tracking-tighter">Destruction de Dossier</h3>
                 <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest leading-relaxed px-4">Action irréversible. Les données académiques seront purgées du système UniFlow.</p>
              </div>
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-slate-50 text-slate-400 rounded-sm py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    deleteStudent(confirmDelete);
                    setConfirmDelete(null);
                  }}
                  className="flex-1 bg-rose-600 text-white rounded-sm py-3 text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
