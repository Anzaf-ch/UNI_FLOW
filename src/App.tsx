import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { storageService } from './services/localStorageService';
import { useAuthStore } from './store';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Grades } from './pages/Grades';
import { Finance } from './pages/Finance';
import { Statistics } from './pages/Statistics';
import { Teachers } from './pages/Teachers';
import { Library } from './pages/Library';
import { Reader } from './pages/Reader';
import { Profile } from './pages/Profile';
import { Signup } from './pages/Signup';
import { Department, Course, ScheduleSlot } from './types/index';
import { Hash, Send } from 'lucide-react';
import { FacebookSearch } from './components/FacebookSearch';
import { MessengerChat } from './components/MessengerChat';
import { io } from 'socket.io-client';
import { ScheduleHeader } from './components/schedule/ScheduleHeader';
import { ScheduleGrid } from './components/schedule/ScheduleGrid';
import { ScheduleModal } from './components/schedule/ScheduleModal';
import { useScheduleStore } from './store/useScheduleStore';
import { Toaster, toast } from 'sonner';
import { StudentHeader } from './components/students/StudentHeader';
import { StudentTable } from './components/students/StudentTable';
import { StudentFormModal } from './components/students/StudentFormModal';
import { useStudentStore } from './store/useStudentStore';

/* ==========================================================================
   1. COMPOSANT ACADEMIC (CORRIGÉ ET ALIGNÉ)
   ========================================================================== */
export const Academic: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [levelFilter, setLevelFilter] = useState<'Tous' | 'L1' | 'L2'>('Tous');

  // États pour gérer l'ouverture des modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });

  const refresh = () => {
    setDepartments(storageService.getAll(storageService.KEYS.DEPARTMENTS));
    setCourses(storageService.getAll(storageService.KEYS.COURSES));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSaveDept = () => {
    if (!deptForm.name.trim()) {
      toast.error('Le nom du département est requis');
      return;
    }
    storageService.add(storageService.KEYS.DEPARTMENTS, {
      name: deptForm.name.trim(),
      code: (deptForm.code.trim() || deptForm.name.trim().slice(0, 3)).toUpperCase(),
      description: ''
    });
    refresh();
    setDeptForm({ name: '', code: '' });
    setIsDeptModalOpen(false);
    toast.success('Département créé avec succès');
  };

  const levelToSemester: Record<string, number> = { L1: 1, L2: 2 };
  const visibleCourses = levelFilter === 'Tous'
    ? courses
    : courses.filter(c => c.semester === levelToSemester[levelFilter]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tighter">Départements & Offres de Formation</h2>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">Contrôle de l'architecture pédagogique.</p>
        </div>
        <button 
          onClick={() => setIsStructureModalOpen(true)}
          className="bg-indigo-600 text-white rounded-md px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          + Structure
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {departments.map(dept => (
            <div key={dept.id} className="p-5 bg-white border border-slate-100 rounded-md shadow-sm transition-all cursor-pointer group hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/5 hover:-translate-y-1">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black text-[#1e1b4b] truncate uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{dept.name}</h3>
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-sm">{dept.code}</span>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setIsDeptModalOpen(true)}
            className="w-full py-4 rounded-md border-2 border-dashed border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 hover:border-indigo-600 transition-all"
          >
            + Nouveau Dept
          </button>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Programmes Disponibles</span>
              <div className="flex gap-2">
                {(['Tous', 'L1', 'L2'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setLevelFilter(level)}
                    className={levelFilter === level
                      ? 'bg-indigo-600 text-white px-4 py-1.5 rounded-sm text-[10px] font-black tracking-widest uppercase shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 px-4 py-1.5 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-slate-100'}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto scrollbar-hide">
              {visibleCourses.map(course => (
                 <div key={course.id} className="p-5 bg-slate-50 border border-slate-50 rounded-md flex justify-between items-center group hover:border-indigo-600/20 hover:bg-white hover:shadow-xl hover:shadow-indigo-600/5 transition-all">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-[#1e1b4b] uppercase tracking-tight">{course.name}</h4>
                      <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{course.code} · Semestre {course.semester}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-sm uppercase tracking-tighter shadow-sm">{course.credits} Cr</span>
                    </div>
                 </div>
              ))}
              {visibleCourses.length === 0 && (
                <div className="col-span-2 py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  Aucun programme pour ce niveau
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL AJOUT DÉPARTEMENT - DESIGN CORRIGÉ */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 transition-all">
          <div className="bg-[#0f172a] p-8 rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.7)] max-w-md w-full border border-slate-800 flex flex-col gap-5 mx-4">
            
            {/* En-tête du Modal */}
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                Créer un Nouveau Département
              </h3>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1">
                Architecture réseau & Structure pédagogique
              </p>
            </div>

            {/* Corps du Formulaire */}
            <div className="space-y-4 my-1">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Nom du département
                </label>
                <input 
                  type="text" 
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="EX: INFORMATIQUE OU GESTION" 
                  className="w-full bg-[#1e293b] border-2 border-slate-700 text-white rounded-md px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 focus:bg-[#1e293b] transition-all placeholder:text-slate-500 uppercase tracking-wide shadow-inner" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Code (optionnel)
                </label>
                <input 
                  type="text" 
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="EX: IT-AI" 
                  className="w-full bg-[#1e293b] border-2 border-slate-700 text-white rounded-md px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 focus:bg-[#1e293b] transition-all placeholder:text-slate-500 uppercase tracking-wide shadow-inner" 
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button 
                onClick={() => { setIsDeptModalOpen(false); setDeptForm({ name: '', code: '' }); }} 
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black rounded-md uppercase tracking-wider transition-colors border border-slate-700"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveDept}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-md uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUCTURE */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-md shadow-2xl max-w-md w-full border border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#1e1b4b] mb-4">Configuration de la Structure</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase mb-6">Architecture globale du campus.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-5 bg-slate-50 rounded-md border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Départements</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">{departments.length}</span>
              </div>
              <div className="p-5 bg-slate-50 rounded-md border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Programmes</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">{courses.length}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsStructureModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-sm uppercase tracking-wider shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   2. COMPOSANT CALENDAR
   ========================================================================== */
export const Calendar: React.FC = () => {
  const { fetchSchedules } = useScheduleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return (
    <div className="space-y-6">
      <ScheduleHeader 
        onAddClick={() => {
          setEditingSlot(null);
          setIsModalOpen(true);
        }} 
      />

      <ScheduleGrid 
        onEdit={(slot) => {
          setEditingSlot(slot);
          setIsModalOpen(true);
        }} 
      />

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSlot(null);
        }}
        slot={editingSlot}
      />
    </div>
  );
};

/* ==========================================================================
   3. COMPOSANT CHAT
   ========================================================================== */
const socket = io();
export const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [activeRoom, setActiveRoom] = useState('Général');

  useEffect(() => {
    socket.emit('join_room', activeRoom);
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });
    return () => { socket.off('receive_message'); };
  }, [activeRoom]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('send_message', {
      room: activeRoom,
      content: input,
      senderId: user?.uid,
      senderName: user?.displayName,
      timestamp: new Date().toISOString()
    });
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row overflow-hidden border border-slate-100 rounded-md bg-white shadow-[0_30px_70px_rgba(30,27,75,0.05)]">
      <div className="w-full md:w-80 border-r border-slate-50 bg-slate-50/30 flex flex-col">
        <div className="p-8 border-b border-slate-50">
           <h3 className="text-[10px] font-black text-[#1e1b4b] uppercase tracking-[0.2em]">Canaux de Com.</h3>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {['Général', 'Conseil Académique', 'Support L3', 'Département IT'].map(c => (
            <button 
              key={c} 
              onClick={() => setActiveRoom(c)}
              className={`w-full text-left p-4 rounded-md transition-all flex items-center gap-3 ${activeRoom === c ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 font-bold hover:bg-slate-100'}`}
            >
              <Hash size={16} className={activeRoom === c ? 'text-white' : 'text-indigo-400'} />
              <span className="text-[11px] uppercase tracking-tight truncate">{c}</span>
              {c === 'Général' && <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
            </button>
          ))}

          <div className="pt-6 pb-2">
             <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] px-4 mb-4">Réseaux Meta</h3>
             <FacebookSearch />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <MessengerChat pageId="107573038343714" />
        <div className="h-20 border-b border-slate-50 px-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="text-sm font-black text-[#1e1b4b] uppercase tracking-tighter">#{activeRoom}</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1.5 bg-emerald-50 rounded-md border border-emerald-100">Actif</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide bg-slate-50/20">
          {messages.filter(m => m.room === activeRoom).map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
              <div className={`max-w-[70%] p-5 rounded-md flex flex-col shadow-sm border ${m.senderId === user?.uid ? 'bg-indigo-600 text-white rounded-br-none border-indigo-500' : 'bg-white rounded-bl-none border-slate-100'}`}>
                {m.senderId !== user?.uid && <span className="text-[9px] font-black uppercase text-indigo-400 mb-2 tracking-widest">{m.senderName}</span>}
                <p className="text-[13px] leading-relaxed font-bold tracking-tight">{m.content}</p>
                <span className={`text-[8px] mt-2 self-end font-black uppercase tracking-[0.1em] ${m.senderId === user?.uid ? 'text-indigo-200' : 'text-slate-300'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-slate-50 bg-white">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-md px-6 py-4 transition-all focus-within:bg-white focus-within:border-indigo-600/20 focus-within:shadow-xl focus-within:shadow-indigo-600/5">
            <input 
              type="text" 
              placeholder="Saisissez votre message académique..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-transparent text-[11px] font-bold outline-none text-[#1e1b4b] placeholder:text-slate-300 uppercase tracking-wider" 
            />
            <button onClick={sendMessage} className="text-indigo-600 hover:scale-110 active:scale-95 transition-transform bg-white p-2 rounded-sm shadow-sm border border-slate-100">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. COMPOSANT ENROLLMENT
   ========================================================================== */
export const Enrollment: React.FC = () => {
  const { fetchStudents, students } = useStudentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filiereStats = students.reduce((acc: any, student) => {
    acc[student.filiere] = (acc[student.filiere] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tighter">Gestion des Inscriptions</h2>
         <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Total Effectif</span>
               <span className="text-xl font-black text-indigo-600 tracking-tighter">{students.length}</span>
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <button
              onClick={() => { fetchStudents(); toast.success('Effectifs synchronisés'); }}
              className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2 py-2 px-4 rounded-sm bg-indigo-50 border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-colors"
            >
               Live Sync
            </button>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {Object.entries(filiereStats).slice(0, 4).map(([filiere, count]: any) => (
           <div key={filiere} className="bg-white p-6 rounded-md border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-600/5 hover:-translate-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{filiere}</p>
              <p className="text-2xl font-black text-[#1e1b4b] tracking-tighter">{count as number}</p>
              <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(count as number / students.length) * 100}%` }} />
              </div>
           </div>
         ))}
         {Object.keys(filiereStats).length === 0 && (
           <div className="col-span-4 py-16 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-white rounded-md border-2 border-dashed border-slate-100 shadow-sm">
             En attente de flux transactionnels...
           </div>
         )}
      </div>

      <StudentHeader 
        onAddClick={() => {
          setEditingStudent(null);
          setIsModalOpen(true);
        }} 
      />

      <StudentTable 
        onEdit={(student) => {
          setEditingStudent(student);
          setIsModalOpen(true);
        }} 
      />

      <StudentFormModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }} 
        student={editingStudent}
      />
    </div>
  );
};

/* ==========================================================================
   5. FONCTION PRINCIPALE (APP)
   ========================================================================== */
export default function App() {
  const { setUser, setLoading, loading, user } = useAuthStore();

  useEffect(() => {
    storageService.seedInitialData();
    const currentUser = storageService.getAuthenticatedUser();
    setUser(currentUser);
    setLoading(false);
  }, [setUser, setLoading]);

  if (loading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
         <div className="animate-spin h-12 w-12 border-[4px] border-indigo-600 border-t-transparent rounded-full shadow-lg shadow-indigo-600/20" />
       </div>
     );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" expand />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/academic" element={<ProtectedRoute><Layout><Academic /></Layout></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute><Layout><Teachers /></Layout></ProtectedRoute>} />
        <Route path="/grades" element={<ProtectedRoute><Layout><Grades /></Layout></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><Layout><Finance /></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
        <Route path="/statistics" element={<ProtectedRoute><Layout><Statistics /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/enrollment" element={<ProtectedRoute><Layout><Enrollment /></Layout></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Layout><Library /></Layout></ProtectedRoute>} />
        <Route path="/library/read/:id" element={<ProtectedRoute><Layout><Reader /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}