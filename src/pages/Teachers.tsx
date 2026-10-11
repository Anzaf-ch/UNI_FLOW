import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  UserPlus,
  LayoutGrid,
  List,
  Eye,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/localStorageService';
import { Teacher } from '../types';
import { toast } from 'sonner';

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    subject: 'Mathématiques',
    status: 'active' as const
  });

  const subjects = ['Mathématiques', 'Informatique', 'Physique', 'Gestion', 'Anglais', 'Droit'];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = storageService.getAll(storageService.KEYS.TEACHERS);
      // Tri par date de création décroissante
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTeachers(sortedData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la récupération des enseignants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        storageService.update(storageService.KEYS.TEACHERS, editingTeacher.id, formData);
        toast.success('Enseignant mis à jour');
      } else {
        storageService.add(storageService.KEYS.TEACHERS, formData);
        toast.success('Enseignant ajouté');
      }
      setIsModalOpen(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l’enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      storageService.delete(storageService.KEYS.TEACHERS, id);
      toast.success('Enseignant supprimé');
      fetchTeachers();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const setTeacherStatus = (teacher: Teacher, status: Teacher['status']) => {
    storageService.update(storageService.KEYS.TEACHERS, teacher.id, { status });
    toast.success('Statut mis à jour');
    setMenuOpenId(null);
    fetchTeachers();
  };

  const resetForm = () => {    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      subject: 'Mathématiques',
      status: 'active'
    });
    setEditingTeacher(null);
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const searchTerms = `${t.firstName} ${t.lastName} ${t.email} ${t.subject}`.toLowerCase();
      const matchesSearch = searchTerms.includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || t.subject === filterSubject;
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [teachers, searchQuery, filterSubject, filterStatus]);

  // Pagination Logic
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-[#1e1b4b] uppercase tracking-tighter">Corps Enseignant</h2>
           <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Gestion et affectation du personnel académique.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Effectif Global</span>
              <span className="text-xl font-black text-indigo-600 tracking-tighter">{teachers.length} Expert(s)</span>
           </div>
           <button 
             onClick={() => { resetForm(); setIsModalOpen(true); }}
             className="bg-[#1e1b4b] text-white p-4 rounded-md shadow-xl shadow-indigo-950/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
           >
             <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] pr-2">Agréger Expert</span>
           </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-md border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, email ou matière..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-sm py-3 pl-12 pr-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <select 
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-sm py-3 pl-10 pr-8 text-[10px] font-black uppercase tracking-widest text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none appearance-none cursor-pointer"
              >
                <option value="all">Toutes les matières</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="relative min-w-[140px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-sm py-3 pl-10 pr-8 text-[10px] font-black uppercase tracking-widest text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="on_leave">En congés</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-sm border border-slate-100">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-sm transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher List Area */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-md">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full shadow-lg shadow-indigo-600/20" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] animate-pulse">Synchronisation...</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {filteredTeachers.length === 0 && !loading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-20 text-center bg-white rounded-md border border-dashed border-slate-200 shadow-sm"
            >
              <div className="h-20 w-20 bg-indigo-50 rounded-sm flex items-center justify-center mx-auto mb-6 text-indigo-200 group hover:scale-110 transition-transform cursor-pointer">
                 <AlertCircle size={40} className="group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Aucun expert trouvé</h3>
              <p className="text-sm text-slate-400 mt-2 text-center max-w-xs mx-auto font-semibold">Nous n'avons trouvé aucun enseignant correspondant à vos critères de recherche actuels.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterSubject('all'); setFilterStatus('all'); }}
                className="mt-8 px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                Réinitialiser l'index
              </button>
            </motion.div>
          ) : (viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-3">
              {paginatedTeachers.map((teacher, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  key={teacher.id}
                  className="bg-white rounded-md border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-sm bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm shadow-inner uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                        </div>
                        <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter line-clamp-1">{teacher.firstName} {teacher.lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Spécialité: {teacher.specialty}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => { setEditingTeacher(teacher); setFormData({...teacher}); setIsModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-sm transition-all"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button 
                            onClick={() => setConfirmDeleteId(teacher.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === teacher.id ? null : teacher.id)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm transition-all"
                            title="Plus d'actions"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {menuOpenId === teacher.id && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-xl z-30 overflow-hidden text-left">
                              <button
                                onClick={() => { toast(`${teacher.firstName} ${teacher.lastName} • ${teacher.specialty}`); setMenuOpenId(null); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                              >
                                <Eye size={14} /> Voir le profil
                              </button>
                              {teacher.status !== 'active' && (
                                <button
                                  onClick={() => setTeacherStatus(teacher, 'active' as Teacher['status'])}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <UserCheck size={14} /> Marquer actif
                                </button>
                              )}
                              {teacher.status !== 'on_leave' && (
                                <button
                                  onClick={() => setTeacherStatus(teacher, 'on_leave' as Teacher['status'])}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 transition-colors"
                                >
                                  <UserX size={14} /> Mettre en congé
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Identifiant</span>
                        <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-sm border border-indigo-100 uppercase">
                          ENS-{new Date(teacher.createdAt).getFullYear()}-{teacher.id.slice(0, 4).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Matière</span>
                        <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">{teacher.subject}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Statut</span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            teacher.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            teacher.status === 'on_leave' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                            'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                            {teacher.status === 'active' ? 'Staff • Actif' : teacher.status === 'on_leave' ? 'En Congés' : 'Inactif'}
                        </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-md border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
            >
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left font-sans">
                  <thead className="bg-[#1e1b4b] text-[11px] text-indigo-100 uppercase tracking-[0.1em] font-black min-h-[60px]">
                    <tr>
                      <th className="px-8 py-5">Enseignant</th>
                      <th className="px-8 py-5">Identifiant</th>
                      <th className="px-8 py-5">Spécialité / Matière</th>
                      <th className="px-8 py-5 text-center">Statut</th>
                      <th className="px-8 py-5 text-right">Gestion</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {paginatedTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              {teacher.firstName[0]}{teacher.lastName[0]}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 tracking-tight">{teacher.firstName} {teacher.lastName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ajouté le {new Date(teacher.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 font-mono text-[11px] font-black text-indigo-600">
                           <span className="bg-indigo-50 px-2 py-1 rounded-sm border border-indigo-100 uppercase">
                             ENS-{new Date(teacher.createdAt).getFullYear()}-{teacher.id.slice(0, 4).toUpperCase()}
                           </span>
                        </td>
                        <td className="px-8 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-black uppercase text-slate-800 tracking-tight">
                                    {teacher.subject}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-[0.1em]">{teacher.specialty}</span>
                            </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex justify-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${
                                teacher.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                teacher.status === 'on_leave' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                                {teacher.status === 'active' ? 'Staff • Actif' : teacher.status === 'on_leave' ? 'En Congés' : 'Inactif'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => { setEditingTeacher(teacher); setFormData({...teacher}); setIsModalOpen(true); }}
                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-sm transition-all border border-transparent hover:border-indigo-100 shadow-sm sm:shadow-none"
                                title="Modifier"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => setConfirmDeleteId(teacher.id)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-all border border-transparent hover:border-rose-100 shadow-sm sm:shadow-none"
                                title="Supprimer"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="relative hidden sm:block">
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === teacher.id ? null : teacher.id)}
                                className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm transition-all"
                                title="Plus d'actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {menuOpenId === teacher.id && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-xl z-30 overflow-hidden text-left">
                                  <button
                                    onClick={() => { toast(`${teacher.firstName} ${teacher.lastName} • ${teacher.specialty}`); setMenuOpenId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                  >
                                    <Eye size={14} /> Voir le profil
                                  </button>
                                  {teacher.status !== 'active' && (
                                    <button
                                      onClick={() => setTeacherStatus(teacher, 'active' as Teacher['status'])}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    >
                                      <UserCheck size={14} /> Marquer actif
                                    </button>
                                  )}
                                  {teacher.status !== 'on_leave' && (
                                    <button
                                      onClick={() => setTeacherStatus(teacher, 'on_leave' as Teacher['status'])}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 transition-colors"
                                    >
                                      <UserX size={14} /> Mettre en congé
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#1e1b4b] px-8 py-4 flex justify-between items-center text-[10px]">
                <span className="text-indigo-300/60 font-black uppercase tracking-[0.2em]">Base de données Personnel • {filteredTeachers.length} dossiers</span>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-emerald-400 font-black uppercase tracking-widest">Connectivité Live</span>
                    </div>
                    <span className="text-indigo-300/40 font-bold hidden sm:inline">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Container */}
      {!loading && filteredTeachers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white p-4 rounded-md border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dossiers par page:</span>
                <select 
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-slate-50 border border-slate-100 rounded-sm px-3 py-1.5 text-[10px] font-black text-[#1e1b4b] outline-none cursor-pointer hover:bg-indigo-50 transition-colors"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <div className="h-4 w-px bg-slate-100" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-slate-50 text-slate-400 rounded-sm hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`h-8 w-8 text-[10px] font-black rounded-sm transition-all ${
                                    currentPage === pageNum 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'bg-white text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 shadow-sm'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-slate-50 text-slate-400 rounded-sm hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#1e1b4b]/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-md shadow-2xl overflow-hidden"
            >
              <div className="bg-[#1e1b4b] p-8 text-white flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10">
                       <Plus size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter">{editingTeacher ? 'Modifier Expert' : 'Nouvel Enseignant'}</h3>
                       <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest mt-0.5">Hydratation des données académiques</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-sm transition-all">
                  <X size={24} />
               </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                    <input 
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      placeholder="Ex: MarcELLE"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de famille</label>
                    <input 
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      placeholder="Ex: RAZAFY"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Certifié</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      placeholder="expert@uniflow.edu"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone Direct</label>
                    <input 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      placeholder="+261 34 00 000 00"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Spécialité Technique</label>
                    <input 
                      required
                      value={formData.specialty}
                      onChange={e => setFormData({...formData, specialty: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      placeholder="Ex: Architecture Big Data"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secteur d'Enseignement</label>
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-sm p-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    >
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut de Disponibilité</label>
                    <div className="grid grid-cols-3 gap-3">
                       {(['active', 'on_leave', 'inactive'] as const).map(s => (
                         <button
                           key={s}
                           type="button"
                           onClick={() => setFormData({...formData, status: s})}
                           className={`py-3 text-[9px] font-black uppercase rounded-sm border-2 transition-all ${
                             formData.status === s 
                             ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                             : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'
                           }`}
                         >
                           {s === 'active' ? 'Actif' : s === 'on_leave' ? 'Congés' : 'Inactif'}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="md:col-span-2 pt-6">
                    <button type="submit" className="w-full bg-[#1e1b4b] text-white py-5 rounded-md text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-950/20 hover:-translate-y-1 active:translate-y-0 transition-all">
                       {editingTeacher ? 'Valider les modifications' : 'Agréger au système'}
                    </button>
                 </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-[#450a0a]/20 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-md shadow-2xl p-8 text-center"
            >
              <div className="h-20 w-20 bg-rose-50 rounded-sm flex items-center justify-center mx-auto mb-6 text-rose-500">
                 <AlertCircle size={40} />
              </div>
              <h3 className="text-sm font-black text-[#1e1b4b] uppercase tracking-widest mb-2">Révoquer l'accès ?</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                Cette action supprimera définitivement cet enseignant du système. Cette opération est irréversible.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button 
                   onClick={() => setConfirmDeleteId(null)}
                   className="py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-100 transition-all"
                 >
                    Annuler
                 </button>
                 <button 
                   onClick={() => handleDelete(confirmDeleteId)}
                   className="py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all"
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
