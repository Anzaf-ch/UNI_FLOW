import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronRight,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { storageService } from '../services/localStorageService';
import { useAuthStore } from '../store';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white border border-slate-200 p-6 rounded-md shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`}>
      <Icon size={80} />
    </div>
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-sm bg-${color}-50 text-${color}-600`}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
    </div>
    <div className="flex items-end justify-between relative z-10">
      <span className="text-2xl font-black text-slate-800 tracking-tighter">{value}</span>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-black ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'} bg-slate-50 px-2 py-1 rounded-sm`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    revenue: 0,
    studentsByFiliere: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const students = storageService.getAll(storageService.KEYS.STUDENTS);
        const courses = storageService.getAll(storageService.KEYS.COURSES);
        const transactions = storageService.getAll(storageService.KEYS.TRANSACTIONS);

        const income = transactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const filiereCounts: any = {};
        students.forEach((student: any) => {
          filiereCounts[student.filiere] = (filiereCounts[student.filiere] || 0) + 1;
        });
        const pieData = Object.entries(filiereCounts).map(([name, value]) => ({ name, value: value as number }));

        setStats({
          students: students.length,
          courses: courses.length,
          revenue: income,
          studentsByFiliere: pieData.length > 0 ? pieData : [
            { name: 'Génie Logiciel', value: 0 },
            { name: 'Économie', value: 0 },
            { name: 'Communication', value: 0 },
            { name: 'Droit', value: 0 }
          ]
        });
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tighter">Tableau de Bord Stratégique</h2>
           <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Surveillance du Campus en temps réel
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-sm text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <Clock size={14} className="text-indigo-500" />
              Relevé J-{new Date().getDate()}
           </div>
           <button className="bg-indigo-600 text-white rounded-md px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
             Générer Rapport Global
           </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Effectif Étudiant" value={stats.students.toLocaleString()} trend={12} icon={Users} color="indigo" />
        <StatCard title="Unités Enseignement" value={stats.courses} trend={5} icon={BookOpen} color="emerald" />
        <StatCard title="Trésorerie Mensuelle" value={`${(stats.revenue / 1000000).toFixed(1)}M Ar`} trend={8} icon={CreditCard} color="amber" />
        <StatCard title="Indice de Réussite" value="76.4%" trend={-2} icon={TrendingUp} color="indigo" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Statistics and Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-md flex flex-col h-[450px] shadow-sm overflow-hidden transition-all hover:shadow-md">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-800 flex items-center uppercase tracking-[0.1em]">
                  <BarChartIcon size={18} className="mr-3 text-indigo-500" />
                  Répartition Dynamique par Filière
                </h3>
                <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Détails Expert</button>
             </div>
             <div className="flex-1 p-8">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={stats.studentsByFiliere}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.1em] flex items-center gap-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   Performance des Pôles Académiques
                </h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {(stats.studentsByFiliere || []).slice(0, 4).map((f, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[11px] font-black uppercase">
                        <span className="text-slate-400 tracking-widest">{f.name}</span>
                        <span className="text-slate-900">{(f.value / stats.students * 100).toFixed(1)}%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-md overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(f.value / stats.students * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-indigo-500" 
                        />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* AI & Right Sidebar Section */}
        <div className="space-y-8">
          <div className="bg-[#1e1b4b] p-8 rounded-md flex flex-col relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 p-4">
               <Sparkles size={100} className="text-white/5 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xs font-black text-indigo-100 flex items-center uppercase tracking-[0.2em]">
                <Sparkles size={18} className="mr-3 text-indigo-400" />
                UniFlow Intelligence
              </h3>
              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-black tracking-widest">LIVE</span>
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-colors">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Analyse Étudiante</p>
                <p className="text-sm text-white font-bold leading-tight">Hausse exponentielle de 14% des admissions en Filière Tech.</p>
              </div>
              <div className="p-4 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-colors">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Indicateur Financier</p>
                <p className="text-sm text-white font-bold leading-tight">Le taux de recouvrement atteint un niveau historique (92%).</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-md flex flex-col shadow-sm">
            <h3 className="text-xs font-black text-slate-800 mb-8 uppercase tracking-[0.1em] flex items-center gap-3">
               <PieChartIcon size={18} className="text-indigo-500" />
               Répartition Statistique
            </h3>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.studentsByFiliere}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {stats.studentsByFiliere.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="white"
                          strokeWidth={4}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="mt-8 grid grid-cols-1 gap-4">
                  {stats.studentsByFiliere.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[120px]">{f.name}</span>
                       </div>
                       <span className="text-xs font-black text-slate-900">{f.value}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

