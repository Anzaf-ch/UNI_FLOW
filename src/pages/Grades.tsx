import React, { useState, useEffect } from 'react';
import { storageService } from '../services/localStorageService';
import { useAuthStore } from '../store';
import { GraduationCap, TrendingUp, Sparkles, FileDown } from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Grades: React.FC = () => {
  const { user } = useAuthStore();
  const [grades, setGrades] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allGrades = storageService.getAll(storageService.KEYS.GRADES);
        // Filtrer par étudiant localement
        const studentGrades = allGrades.filter((g: any) => g.studentId === user?.uid);
        setGrades(studentGrades);

        const allCourses = storageService.getAll(storageService.KEYS.COURSES);
        setCourses(allCourses);
      } catch (error) {
        console.error(error);
      }
    };
    if (user) fetchData();
  }, [user]);

  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || 'Cours inconnu';

  const average = grades.length > 0 
    ? grades.reduce((acc, curr) => acc + (curr.score * (curr.coefficient || 1)), 0) / grades.reduce((acc, curr) => acc + (curr.coefficient || 1), 0)
    : 0;

  const askAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/recommend-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades, department: user?.departmentId || 'Général' })
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Relevé de Notes - UniFlow', 14, 15);
    doc.text(`Étudiant: ${user?.displayName}`, 14, 25);
    doc.text(`Moyenne Générale: ${average.toFixed(2)}/20`, 14, 35);

    autoTable(doc, {
      startY: 45,
      head: [['Matière', 'Note', 'Coefficient', 'Session']],
      body: grades.map(g => [getCourseName(g.courseId), `${g.score}/${g.maxScore}`, g.coefficient, g.term])
    });

    doc.save(`releve-notes-${user?.uid}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tighter">Relevé de Notes & Diagnostic IA</h2>
           <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">Audit académique en temps réel • UniFlow Analysis</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-slate-600"
        >
          <FileDown size={18} className="text-indigo-500" />
          Exporter le Relevé (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6">
           <div className="bg-[#1e1b4b] p-6 rounded-md shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                 <GraduationCap size={80} className="text-white" />
              </div>
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] relative z-10">Moyenne Générale</span>
              <div className="mt-4 flex items-baseline gap-2 relative z-10">
                 <span className="text-4xl font-black text-white tracking-tighter">{average.toFixed(2)}</span>
                 <span className="text-xs text-indigo-400 uppercase font-black">/ 20.00</span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] text-emerald-400 font-black relative z-10 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-full">
                 <TrendingUp size={14} />
                 <span className="tracking-widest uppercase">SYSTÈME ADMIS</span>
              </div>
           </div>

           <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Crédits ECTS Validés</span>
              <div className="mt-2 text-2xl font-black text-[#1e1b4b] tracking-tighter">45 <span className="text-slate-300 text-lg">/ 60</span></div>
              <div className="mt-4 h-2.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '75%' }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-emerald-500 rounded-sm" 
                 />
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-widest text-center">Taux de complétion : 75.0%</p>
           </div>

           <div className="bg-[#f5f3ff] p-6 rounded-md border border-indigo-100 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <Sparkles size={40} className="text-indigo-200 group-hover:rotate-12 transition-transform" />
              </div>
              <h3 className="text-[11px] font-black text-indigo-900 flex items-center uppercase tracking-[0.1em] mb-4 relative z-10">
                UniFlow Academic Coach
              </h3>
              {loadingAI ? (
                <div className="py-6 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mx-auto h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-sm shadow-lg" />
                  <p className="text-[9px] font-black text-indigo-400 uppercase mt-4 animate-pulse tracking-widest">Analyse neuronale...</p>
                </div>
              ) : recommendation ? (
                <div className="bg-white/80 p-4 rounded-md border border-indigo-100/50 backdrop-blur-sm relative z-10">
                   <p className="text-[11px] text-indigo-800 leading-relaxed font-bold italic">"{recommendation}"</p>
                </div>
              ) : (
                <button 
                  onClick={askAI}
                  className="w-full h-14 bg-indigo-600 text-white rounded-md text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all relative z-10"
                >
                  Diagnostic IA Stratégique
                </button>
              )}
           </div>
        </div>

        <div className="md:col-span-3">
           <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm transition-all hover:shadow-md">
              <table className="w-full text-left">
                <thead className="bg-[#1e1b4b] text-[10px] text-indigo-200 uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-5">Unité d'Enseignement</th>
                    <th className="px-8 py-5">Coefficient</th>
                    <th className="px-8 py-5">Notation</th>
                    <th className="px-8 py-5">Session d'Examen</th>
                    <th className="px-8 py-5 text-right">Décision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-bold uppercase tracking-widest text-[10px]">Aucun résultat académique enregistré pour l'année en cours.</td>
                    </tr>
                  )}
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-5">
                         <div className="text-[12px] font-black text-[#1e1b4b] uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{getCourseName(grade.courseId)}</div>
                         <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Code Module: REF-{(grade.id?.slice(0, 4) || 'IDX').toUpperCase()}</div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="h-8 w-8 bg-slate-100 rounded-sm flex items-center justify-center text-[11px] font-black text-slate-600">
                            {grade.coefficient}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`text-sm font-black ${grade.score >= 10 ? 'text-emerald-600' : 'text-rose-600'} flex items-baseline gap-1`}>
                          {grade.score.toFixed(1)} 
                          <span className="text-[10px] opacity-40">/ 20.0</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest w-fit">
                            {grade.term || 'Session Normale'}
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {grade.score >= 10 ? (
                          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-[0.1em] border border-emerald-100 shadow-sm">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             Validé
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-[0.1em] border border-rose-100 shadow-sm">
                             <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                             Échec
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};
