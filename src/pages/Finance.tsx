import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/localStorageService';
import { useAuthStore } from '../store';
import { 
  Wallet, 
  CreditCard, 
  History, 
  Briefcase, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Printer, 
  User, 
  Hash, 
  GraduationCap,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart,
  Legend
} from 'recharts';

// --- Constants ---

const PRICING: Record<string, number> = {
  '1ère année (L1)': 100000,
  '2ème année (L2)': 120000,
  '3ème année (L3)': 130000,
  'Master 1 (M1)': 160000,
  'Master 2 (M2)': 200000,
};

const CLASSES = Object.keys(PRICING);

// --- Sub-components ---

const StatCard = ({ title, amount, icon: Icon, type }: { title: string, amount: number, icon: any, type: 'income' | 'expense' | 'balance' }) => (
  <div className="bg-white p-6 rounded-md border border-slate-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform ${
      type === 'income' ? 'bg-emerald-500' : type === 'expense' ? 'bg-rose-500' : 'bg-indigo-500'
    }`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-sm ${
        type === 'income' ? 'bg-emerald-50 text-emerald-600' : type === 'expense' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
      }`}>
        <Icon size={20} />
      </div>
      {type !== 'balance' && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
          type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {type === 'income' ? 'Flux Entrant' : 'Flux Sortant'}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
      <h3 className={`text-2xl font-black mt-2 tracking-tighter ${
        type === 'income' ? 'text-emerald-700' : type === 'expense' ? 'text-rose-700' : 'text-[#1e1b4b]'
      }`}>
        {amount.toLocaleString()} <span className="text-xs uppercase opacity-50 ml-1">Ar</span>
      </h3>
    </div>
  </div>
);

// --- Main Page ---

export const Finance: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Form States (Tuition)
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    matricule: '',
    filiere: 'Informatique',
    classe: '1ère année (L1)',
    amount: PRICING['1ère année (L1)'].toString(),
    paymentType: 'monthly' as any,
    method: 'cash' as any,
    date: new Date().toISOString().split('T')[0]
  });

  // Form States (Salary)
  const [salaryForm, setSalaryForm] = useState({
    name: '',
    position: 'Professeur',
    baseSalary: '',
    bonus: '',
    deductions: '',
    method: 'cash' as any,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const data = storageService.getAll(storageService.KEYS.TRANSACTIONS);
      
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(sortedData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la récupération des transactions');
    }
  };

  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
  [transactions]);

  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  [transactions]);

  const balanceValue = totalIncome - totalExpense;

  
  const chartData = useMemo(() => {
    const months: Record<string, { month: string, income: number, expense: number, balance: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }).reverse();

    last6Months.forEach(m => {
      months[m] = { month: m, income: 0, expense: 0, balance: 0 };
    });

    transactions.forEach(t => {
      const m = new Date(t.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      if (months[m]) {
        if (t.type === 'income') months[m].income += t.amount;
        else months[m].expense += t.amount;
        months[m].balance = months[m].income - months[m].expense;
      }
    });

    return Object.values(months);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    const now = new Date();
    if (period === 'today') {
      filtered = filtered.filter(t => new Date(t.createdAt).toDateString() === now.toDateString());
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.createdAt) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.createdAt) >= monthAgo);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [transactions, filterType, sortOrder, period]);

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const newTxFormData: Omit<Transaction, 'id' | 'createdAt'> = {
        userId: user.uid,
        amount: Number(schoolForm.amount),
        method: schoolForm.method,
        status: 'completed',
        type: 'income',
        category: 'tuition',
        studentInfo: {
          name: schoolForm.name,
          matricule: schoolForm.matricule,
          filiere: schoolForm.filiere,
          paymentType: schoolForm.paymentType
        }
      };

      const newItem = storageService.add(storageService.KEYS.TRANSACTIONS, {
        ...newTxFormData,
        createdAt: schoolForm.date // Use form date
      });

      setTransactions([newItem as Transaction, ...transactions]);
      toast.success('Paiement écolage enregistré avec succès');
      setShowSchoolModal(false);
      resetSchoolForm();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const base = Number(salaryForm.baseSalary);
      const bonus = Number(salaryForm.bonus || 0);
      const deductions = Number(salaryForm.deductions || 0);
      const total = base + bonus - deductions;

      const newTxFormData: Omit<Transaction, 'id' | 'createdAt'> = {
        userId: user.uid,
        amount: total,
        method: salaryForm.method,
        status: 'completed',
        type: 'expense',
        category: 'salary',
        staffInfo: {
          name: salaryForm.name,
          position: salaryForm.position,
          baseSalary: base,
          bonus: bonus,
          deductions: deductions,
          notes: salaryForm.notes
        }
      };

      const newItem = storageService.add(storageService.KEYS.TRANSACTIONS, {
        ...newTxFormData,
        createdAt: salaryForm.date
      });

      setTransactions([newItem as Transaction, ...transactions]);
      toast.success('Paiement salaire personnel enregistré');
      setShowSalaryModal(false);
      resetSalaryForm();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const resetSchoolForm = () => setSchoolForm({
    name: '', matricule: '', filiere: 'Informatique', classe: '1ère année (L1)', amount: PRICING['1ère année (L1)'].toString(), paymentType: 'monthly', method: 'cash', date: new Date().toISOString().split('T')[0]
  });

  const resetSalaryForm = () => setSalaryForm({
    name: '', position: 'Professeur', baseSalary: '', bonus: '', deductions: '', method: 'cash', date: new Date().toISOString().split('T')[0], notes: ''
  });

  const handleLevelChange = (classe: string) => {
    setSchoolForm(prev => ({
      ...prev,
      classe,
      amount: PRICING[classe].toString()
    }));
  };

  const generateReceiptPDF = (tx: Transaction, autoPrint = false) => {
    const doc = new jsPDF();
    const isIncome = tx.type === 'income';
    
    // Header
    doc.setFillColor(30, 27, 75);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIFLOW ACADEMY', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('RECU DE PAIEMENT OFFICIEL', 105, 30, { align: 'center' });

    // Content
    doc.setTextColor(30, 27, 75);
    doc.setFontSize(12);
    doc.text(`Ref Transaction: TX-${(tx.id || '').slice(0, 10).toUpperCase()}`, 20, 60);
    doc.text(`Date: ${new Date(tx.createdAt).toLocaleDateString()}`, 20, 70);

    const tableData = isIncome ? [
      ['Libellé', 'Détails'],
      ['Type', 'Frais de scolarité'],
      ['Étudiant', tx.studentInfo?.name || 'N/A'],
      ['Matricule', tx.studentInfo?.matricule || 'N/A'],
      ['Filière', tx.studentInfo?.filiere || 'N/A'],
      ['Type de paiement', tx.studentInfo?.paymentType || 'N/A'],
      ['Méthode', tx.method === 'mobile_money' ? 'Mobile Money' : (tx.method || '').toUpperCase()],
      ['Montant Total', `${tx.amount.toLocaleString()} Ar`],
    ] : [
      ['Libellé', 'Détails'],
      ['Type', 'Paiement Salaire'],
      ['Bénéficiaire', tx.staffInfo?.name || 'N/A'],
      ['Poste', tx.staffInfo?.position || 'N/A'],
      ['Salaire de base', `${tx.staffInfo?.baseSalary.toLocaleString()} Ar`],
      ['Bonus', `${tx.staffInfo?.bonus.toLocaleString()} Ar`],
      ['Déductions', `${tx.staffInfo?.deductions.toLocaleString()} Ar`],
      ['Méthode', (tx.method || '').toUpperCase()],
      ['Montant Net', `${tx.amount.toLocaleString()} Ar`],
    ];

    autoTable(doc, {
      startY: 80,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFontSize(10);
    doc.text('Signature de la caisse', 20, finalY + 30);
    doc.text('..................................', 20, finalY + 40);
    doc.text('Cachet de l\'institution', 140, finalY + 30);
    doc.text('..................................', 140, finalY + 40);

    if (autoPrint) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Recu_${tx.id.slice(0, 8)}.pdf`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tighter">Gestion Financière Applicative</h2>
           <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">Plateforme de Pilotage Budgétaire & Flux Académiques</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <button 
             onClick={() => setShowSchoolModal(true)}
             className="flex items-center gap-3 rounded-sm bg-white border border-indigo-100 px-6 py-3.5 text-[10px] font-black text-indigo-600 shadow-sm hover:bg-indigo-50 transition-all uppercase tracking-[0.2em] group"
           >
             <CreditCard size={16} className="group-hover:rotate-12 transition-transform" />
             💳 Paiement écolage
           </button>
           <button 
             onClick={() => setShowSalaryModal(true)}
             className="flex items-center gap-3 rounded-sm bg-indigo-600 px-6 py-3.5 text-[10px] font-black text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-[0.2em] group"
           >
             <Briefcase size={16} className="group-hover:scale-110 transition-transform" />
             💼 Paiement salaire personnel
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Fonds de l'université (Solde Net)" amount={balanceValue} icon={Wallet} type="balance" />
        <StatCard title="Total des Entrées (Scolarités)" amount={totalIncome} icon={ArrowUpRight} type="income" />
        <StatCard title="Total des Sorties (Salaires)" amount={totalExpense} icon={ArrowDownRight} type="expense" />
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-md border border-slate-100 shadow-sm transition-all hover:shadow-md">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-[#1e1b4b] flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-600" />
                    Flux Mensuels Consolidés
                 </h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Analyse comparative Revenue vs Dépenses</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    <span className="text-[9px] font-black uppercase text-slate-400">Entrées</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span className="text-[9px] font-black uppercase text-slate-400">Sorties</span>
                 </div>
              </div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900 }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '20px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="income" name="Entrées" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="expense" name="Sorties" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line type="monotone" dataKey="balance" name="Solde" stroke="#1e1b4b" strokeWidth={3} dot={{ r: 4, fill: '#1e1b4b', strokeWidth: 2 }} />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#1e1b4b] p-8 rounded-md shadow-xl relative overflow-hidden group">
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-sm blur-3xl" />
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <div className="h-12 w-12 bg-white/10 rounded-sm flex items-center justify-center mb-6">
                    <Receipt size={24} className="text-white" />
                 </div>
                 <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight">Générer un état financier certifié</h3>
                 <p className="text-xs text-indigo-300 font-bold mt-2 opacity-80">Exportez l'ensemble des transactions pour audit comptable.</p>
              </div>
              <button 
                onClick={() => {
                  const doc = new jsPDF();
                  doc.setFontSize(20);
                  doc.text('AUDIT FINANCIER CONSOLIDÉ', 105, 20, { align: 'center' });
                  doc.setFontSize(10);
                  doc.text(`Généré le : ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
                  
                  const data = filteredTransactions.map(tx => [
                    new Date(tx.createdAt).toLocaleDateString(),
                    (tx.category || '').toUpperCase(),
                    tx.studentInfo?.name || tx.staffInfo?.name || 'N/A',
                    tx.type === 'income' ? `+${tx.amount}` : `-${tx.amount}`,
                    (tx.status || '').toUpperCase()
                  ]);

                  autoTable(doc, {
                    startY: 40,
                    head: [['Date', 'Catégorie', 'Nom', 'Montant', 'Statut']],
                    body: data,
                    headStyles: { fillColor: [30, 27, 75] }
                  });

                  doc.save('Audit_Final_UniFlow.pdf');
                  toast.success('Audit financier exporté avec succès');
                }}
                className="w-full bg-white text-[#1e1b4b] py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3 group/btn mt-8"
              >
                 <Printer size={14} className="group-hover/btn:rotate-12 transition-transform" />
                 Imprimer l'audit PDF
              </button>
           </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white border border-slate-100 rounded-md overflow-hidden shadow-sm transition-all hover:shadow-md">
        <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/30">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 rounded-sm flex items-center justify-center text-indigo-600 shadow-inner">
                 <History size={20} />
              </div>
              <div>
                 <h3 className="text-xs font-black uppercase tracking-[0.1em] text-[#1e1b4b]">Historique des Transactions</h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Registre immuable des flux financiers</p>
              </div>
           </div>
           
           <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <div className="flex bg-slate-100 p-1 rounded-sm">
                {(['all', 'income', 'expense'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${
                      filterType === type 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type === 'all' ? 'Tous' : type === 'income' ? 'Entrées' : 'Sorties'}
                  </button>
                ))}
              </div>

              {/* Period Filter */}
              <div className="flex bg-slate-100 p-1 rounded-sm">
                 {(['all', 'today', 'week', 'month'] as const).map(p => (
                   <button
                     key={p}
                     onClick={() => setPeriod(p)}
                     className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest rounded-sm transition-all ${
                       period === p 
                       ? 'bg-white text-indigo-600 shadow-sm' 
                       : 'text-slate-400 hover:text-slate-600'
                     }`}
                   >
                     {p === 'all' ? 'Total' : p === 'today' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
                   </button>
                 ))}
              </div>

              {/* Sort Action */}
              <button 
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-sm text-[9px] font-black uppercase tracking-widest hover:border-indigo-200 transition-all"
              >
                <ArrowUpDown size={12} className="text-indigo-600" />
                {sortOrder === 'desc' ? 'Récent' : 'Ancien'}
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1e1b4b] text-[10px] text-indigo-200 uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Référence / Type</th>
                <th className="px-8 py-5">Bénéficiaire / Donneur</th>
                <th className="px-8 py-5">Méthode</th>
                <th className="px-8 py-5">Montant</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic font-bold uppercase tracking-widest text-[10px]">Aucune transaction ne correspond à vos filtres.</td>
                </tr>
              )}
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5 text-slate-500 text-[11px] font-bold">
                     {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                        TX-{(tx.id || '').slice(0, 10).toUpperCase()}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm w-fit ${
                        tx.category === 'tuition' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {tx.category === 'tuition' ? 'Écolage' : 'Salaire'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-[#1e1b4b] uppercase">{tx.studentInfo?.name || tx.staffInfo?.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{tx.studentInfo?.matricule || tx.staffInfo?.position}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="font-black uppercase text-[10px] text-slate-500 tracking-widest">{tx.method.replace('_', ' ')}</span>
                  </td>
                  <td className="px-8 py-5">
                     <div className={`text-sm font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[10px] opacity-40 uppercase ml-1">Ar</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => generateReceiptPDF(tx, true)}
                      className="p-2.5 rounded-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                      title="Imprimer Direct"
                    >
                      <Printer size={14} />
                    </button>
                    <button 
                      onClick={() => generateReceiptPDF(tx, false)}
                      className="p-2.5 rounded-sm bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm border border-slate-200"
                      title="Détails"
                    >
                      <Receipt size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOdals --- */}

      <AnimatePresence>
        {/* Tuition Modal */}
        {showSchoolModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1e1b4b]/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-md shadow-2xl w-full max-w-xl overflow-hidden border border-white"
            >
              <div className="bg-[#1e1b4b] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-500 rounded-sm flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Encaisser Écolage</h3>
                    <p className="text-[9px] text-indigo-300 font-bold uppercase mt-0.5">Virements entrants certifiés</p>
                  </div>
                </div>
                <button onClick={() => setShowSchoolModal(false)} className="p-2 hover:bg-white/10 rounded-sm transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSchoolSubmit} className="p-8 grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={12} /> Nom complet de l'étudiant
                  </label>
                  <input 
                    required 
                    value={schoolForm.name}
                    onChange={e => setSchoolForm({...schoolForm, name: e.target.value})}
                    className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all outline-none"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Hash size={12} /> Matricule
                  </label>
                  <input 
                    required 
                    value={schoolForm.matricule}
                    onChange={e => setSchoolForm({...schoolForm, matricule: e.target.value})}
                    className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 text-sm font-bold outline-none"
                    placeholder="M-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={12} /> Filière
                  </label>
                  <select 
                    value={schoolForm.filiere}
                    onChange={e => setSchoolForm({...schoolForm, filiere: e.target.value})}
                    className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 text-sm font-bold appearance-none"
                  >
                    <option>Informatique</option>
                    <option>Droit</option>
                    <option>Communication</option>
                    <option>Management</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <GraduationCap size={12} /> Niveau / Classe (Tarification Automatique)
                   </label>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {CLASSES.map(cls => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => handleLevelChange(cls)}
                          className={`py-3 text-[9px] font-black uppercase rounded-sm border-2 transition-all ${
                            schoolForm.classe === cls 
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm font-black' 
                            : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign size={12} /> Montant (Verrouillé)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      readOnly 
                      value={schoolForm.amount}
                      className="w-full rounded-sm bg-slate-100 border border-slate-200 p-4 text-sm font-black text-indigo-600 outline-none cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-slate-400">TARIF FIXE</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Type
                  </label>
                  <select 
                    value={schoolForm.paymentType}
                    onChange={e => setSchoolForm({...schoolForm, paymentType: e.target.value as any})}
                    className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 text-sm font-bold"
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="trimester">Trimestriel</option>
                    <option value="annual">Annuel</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Méthode</label>
                   <div className="flex gap-2">
                     {['cash', 'mobile_money', 'card'].map(m => (
                       <button
                         key={m}
                         type="button"
                         onClick={() => setSchoolForm({...schoolForm, method: m as any})}
                         className={`flex-1 py-3 text-[9px] font-black uppercase rounded-sm border-2 transition-all ${
                           schoolForm.method === m ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-400'
                         }`}
                       >
                         {m.replace('_', ' ')}
                       </button>
                     ))}
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date"
                    value={schoolForm.date}
                    onChange={e => setSchoolForm({...schoolForm, date: e.target.value})}
                    className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 text-sm font-bold"
                  />
                </div>
                <div className="col-span-2 pt-4">
                  <button 
                    disabled={loading}
                    className="w-full bg-[#1e1b4b] text-white py-4 rounded-md text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? 'Traitement...' : 'Enregistrer le Paiement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Salary Modal */}
        {showSalaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1e1b4b]/80 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 30 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 30 }}
               className="bg-white rounded-md shadow-2xl w-full max-w-xl overflow-hidden border border-white"
             >
               <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-white/10 rounded-sm flex items-center justify-center">
                     <Briefcase size={20} />
                   </div>
                   <div>
                     <h3 className="text-sm font-black uppercase tracking-widest">Paiement Salaire</h3>
                     <p className="text-[9px] text-indigo-100 font-bold uppercase mt-0.5">Décaissement certifié du personnel</p>
                   </div>
                 </div>
                 <button onClick={() => setShowSalaryModal(false)} className="p-2 hover:bg-white/10 rounded-sm transition-colors">
                   <X size={20} />
                 </button>
               </div>

               <form onSubmit={handleSalarySubmit} className="p-8 grid grid-cols-2 gap-6">
                 <div className="space-y-2 col-span-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom employé</label>
                   <input required value={salaryForm.name} onChange={e => setSalaryForm({...salaryForm, name: e.target.value})} className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 font-bold outline-none focus:bg-white" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Poste</label>
                   <input required value={salaryForm.position} onChange={e => setSalaryForm({...salaryForm, position: e.target.value})} className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 font-bold outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-600">Salaire de base (Ar)</label>
                   <input required type="number" value={salaryForm.baseSalary} onChange={e => setSalaryForm({...salaryForm, baseSalary: e.target.value})} className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 font-bold outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-indigo-600">Bonus (Ar)</label>
                   <input type="number" value={salaryForm.bonus} onChange={e => setSalaryForm({...salaryForm, bonus: e.target.value})} className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 font-bold outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-600">Déductions (Ar)</label>
                   <input type="number" value={salaryForm.deductions} onChange={e => setSalaryForm({...salaryForm, deductions: e.target.value})} className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 font-bold outline-none" />
                 </div>
                 <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note / Motif</label>
                   <textarea value={salaryForm.notes} onChange={e => setSalaryForm({...salaryForm, notes: e.target.value})} className="w-full rounded-sm bg-slate-50 border border-slate-200 p-4 font-bold h-20 outline-none" />
                 </div>
                 <div className="col-span-2 pt-4">
                   <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-md text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50">
                     {loading ? 'Calcul et validation...' : 'Confirmer le paiement'}
                   </button>
                 </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
