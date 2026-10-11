import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Wallet, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Users, 
  UserPlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Library as LibraryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore, useUIStore } from '../store';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { storageService } from '../services/localStorageService';

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
  { id: 'academic', label: 'Académique', icon: BookOpen, path: '/academic' },
  { id: 'library', label: 'Bibliothèque', icon: LibraryIcon, path: '/library' },
  { id: 'teachers', label: 'Enseignants', icon: Users, path: '/teachers' },
  { id: 'enrollment', label: 'Inscriptions', icon: UserPlus, path: '/enrollment' },
  { id: 'grades', label: 'Notes', icon: GraduationCap, path: '/grades' },
  { id: 'finance', label: 'Finance', icon: Wallet, path: '/finance' },
  { id: 'calendar', label: 'Emploi du temps', icon: Calendar, path: '/calendar' },
  { id: 'chat', label: 'Communication', icon: MessageSquare, path: '/chat' },
  { id: 'statistics', label: 'Statistiques', icon: BarChart3, path: '/statistics' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, setUser } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"
      />
    </div>
  );

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        className="relative flex flex-col border-r border-slate-200 bg-[#1e1b4b] text-white transition-all z-20"
      >
        <div className="flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-sm bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <span className="text-white font-black text-xl italic">U</span>
            </div>
            {isSidebarOpen && <span className="text-xl font-black tracking-tight text-white uppercase italic">UniFlow</span>}
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-8 overflow-y-auto scrollbar-hide">
          {isSidebarOpen && <div className="text-indigo-300/40 text-[10px] font-black uppercase tracking-[0.2em] px-2 mb-3">Menu Principal</div>}
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 rounded-md px-4 py-3 transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                    : 'text-indigo-100/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-indigo-400 group-hover:text-white'} />
                {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </Link>
            );
          })}

          {isSidebarOpen && <div className="pt-8 text-indigo-300/40 text-[10px] font-black uppercase tracking-[0.2em] px-2 mb-3">Analytique & Com</div>}
          {navItems.slice(5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 rounded-md px-4 py-3 transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                    : 'text-indigo-100/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-indigo-400 group-hover:text-white'} />
                {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-5 space-y-3">
          {isSidebarOpen && (
             <Link to="/profile" className="flex items-center gap-3 px-1 mb-5 transition-all hover:bg-white/5 p-2 rounded-md group/profile">
               <img 
                 src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                 alt="Profile" 
                 className="h-10 w-10 rounded-md border-2 border-indigo-400/20 object-cover"
               />
               <div className="overflow-hidden">
                 <p className="text-xs font-black text-white truncate uppercase tracking-tighter group-hover/profile:text-indigo-400 transition-colors">{user?.displayName}</p>
                 <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest">Admin Central</p>
                 </div>
               </div>
             </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-rose-300 hover:bg-rose-500/10 transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="text-xs uppercase tracking-widest">Quitter UniFlow</span>}
          </button>
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-indigo-600 shadow-md z-30 hover:scale-110 transition-transform"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 box-border">
          <div className="flex items-center gap-4 flex-1">
             <div className="flex flex-col">
                <h1 className="text-sm font-black text-slate-800 uppercase tracking-tighter hidden sm:block">Panneau de Commandes Central</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Campus Numérique de Madagascar</p>
             </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative w-72 hidden md:block group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Rechercher un dossier, un cours..." 
                className="w-full rounded-sm bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white border border-slate-200 transition-all"
              />
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <button className="relative p-2 rounded-sm bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-rose-500 border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">FR</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
