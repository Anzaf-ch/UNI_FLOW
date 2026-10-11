import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Wallet,
  PieChart as PieIcon,
  BarChart as BarIcon,
  LineChart as LineIcon,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { storageService } from '../services/localStorageService';
import { Student, Teacher, Transaction } from '../types';
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
  Cell, 
  LineChart, 
  Line,
  Legend
} from 'recharts';

export const Statistics: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const sData = storageService.getAll(storageService.KEYS.STUDENTS);
        const tData = storageService.getAll(storageService.KEYS.TEACHERS);
        const trData = storageService.getAll(storageService.KEYS.TRANSACTIONS);
        
        setStudents(sData);
        setTeachers(tData);
        setTransactions(trData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const financialStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const subjectData = useMemo(() => {
    const stats: Record<string, number> = {};
    students.forEach(s => {
      stats[s.filiere] = (stats[s.filiere] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [students]);

  const staffDistribution = useMemo(() => {
    const stats: Record<string, number> = {
      'Enseignants': teachers.length,
      'Administratif': 0,
      'Support': 0
    };
    
    // Check salary transactions for other roles
    transactions.forEach(t => {
      if (t.category === 'salary' && t.staffInfo) {
        const pos = t.staffInfo.position;
        if (pos !== 'Professeur') {
          stats[pos] = (stats[pos] || 0) + 1;
        }
      }
    });

    return Object.entries(stats)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [teachers, transactions]);

  const totalPersonnelCount = useMemo(() => {
    const uniqueStaff = new Set(teachers.map(t => `${t.firstName} ${t.lastName}`));
    transactions.forEach(t => {
      if (t.category === 'salary' && t.staffInfo) {
        uniqueStaff.add(t.staffInfo.name);
      }
    });
    return uniqueStaff.size;
  }, [teachers, transactions]);

  const financialTrend = useMemo(() => {
    const months: Record<string, { month: string, income: number, expense: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleDateString('fr-FR', { month: 'short' });
    }).reverse();

    last6Months.forEach(m => months[m] = { month: m, income: 0, expense: 0 });

    transactions.forEach(t => {
      const m = new Date(t.createdAt).toLocaleDateString('fr-FR', { month: 'short' });
      if (months[m]) {
        if (t.type === 'income') months[m].income += t.amount;
        else months[m].expense += t.amount;
      }
    });

    return Object.values(months);
  }, [transactions]);

  const COLORS = ['#4f46e5', '#1e1b4b', '#f43f5e', '#10b981', '#f59e0b', '#6366f1'];

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-md border border-slate-100 shadow-sm relative overflow-hidden"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-sm opacity-5 ${color}`} />
      <div className="relative z-10">
        <div className={`h-12 w-12 rounded-sm flex items-center justify-center mb-6 text-white shadow-xl ${color}`}>
           <Icon size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
           <h3 className="text-2xl font-black text-[#1e1b4b] tracking-tighter">{value}</h3>
           {trend && (
             <span className={`text-[10px] font-black uppercase ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
               {trend > 0 ? '+' : ''}{trend}%
             </span>
           )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10 pb-12">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-[#1e1b4b] uppercase tracking-tighter">Observatoire Analytique</h2>
           <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Données consolidées & indicateurs de performance.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-sm border border-indigo-100">
           <Clock size={14} className="text-indigo-600" />
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Temps de réponse: 42ms</span>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard title="Total Étudiants" value={students.length} icon={GraduationCap} color="bg-indigo-600" trend={12} />
         <StatCard title="Personnel Global" value={totalPersonnelCount} icon={Users} color="bg-[#1e1b4b]" />
         <StatCard title="Total Enseignants" value={teachers.length} icon={Users} color="bg-blue-600" />
         <StatCard title="Solde Net (MGA)" value={financialStats.balance.toLocaleString()} icon={Wallet} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Bar Chart: Distribution par Matière */}
         <div className="bg-white p-8 rounded-md border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-600/5">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xs font-black text-[#1e1b4b] uppercase tracking-widest flex items-center gap-2">
                     <BarIcon size={16} className="text-indigo-600" />
                     Distribution par Filière
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Volume d'inscrits par programme</p>
               </div>
            </div>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                       dy={10}
                     />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0/0.1)', fontSize: '10px', fontWeight: 900 }}
                     />
                     <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Pie Chart: Distribution du Personnel */}
         <div className="bg-white p-8 rounded-md border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-600/5">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xs font-black text-[#1e1b4b] uppercase tracking-widest flex items-center gap-2">
                     <PieIcon size={16} className="text-rose-500" />
                     Répartition Personnel
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Structure des ressources humaines</p>
               </div>
            </div>
            <div className="h-[350px] flex items-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={staffDistribution}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={120}
                       paddingAngle={10}
                       dataKey="value"
                     >
                       {staffDistribution.map((_, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0/0.1)', fontSize: '10px', fontWeight: 900 }}
                     />
                     <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Line Chart: Evolution Financière */}
      <div className="bg-[#1e1b4b] p-10 rounded-md shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={200} />
         </div>
         <div className="relative z-10 space-y-10">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                     <LineIcon size={24} className="text-indigo-400" />
                     Trajectoire de Croissance
                  </h3>
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mt-1">Suivi mensuel des flux consolidés</p>
               </div>
            </div>
            
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialTrend}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                     <XAxis 
                       dataKey="month" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 11, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }} 
                       dy={10}
                     />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 900, color: 'white' }}
                       itemStyle={{ color: 'white' }}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="income" 
                       stroke="#6366f1" 
                       strokeWidth={4} 
                       dot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} 
                       activeDot={{ r: 8, fill: '#fff', strokeWidth: 0 }}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="expense" 
                       stroke="#f43f5e" 
                       strokeWidth={4} 
                       dot={{ r: 6, fill: '#f43f5e', strokeWidth: 0 }} 
                       activeDot={{ r: 8, fill: '#fff', strokeWidth: 0 }}
                     />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};
