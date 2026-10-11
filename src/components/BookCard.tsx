import React from 'react';
import { FileText, MoreVertical, BookOpen, Trash2, Download, Star, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Book } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BookCardProps {
  book: Book;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onRead, onDelete, onToggleFavorite }) => {
  const isPdf = book.type === 'pdf';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white border border-slate-100 rounded-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-100/40"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`
            p-3 rounded-xl transition-all group-hover:scale-110
            ${isPdf ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}
          `}>
            <FileText size={28} />
          </div>
          <button 
            onClick={() => onToggleFavorite(book.id)}
            className={`p-2 rounded-full transition-all ${book.favorite ? 'text-amber-400 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'}`}
          >
            <Star size={18} fill={book.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-2 leading-tight min-h-[2.5rem]">
            {book.title}
          </h4>
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <Clock size={10} />
            {format(new Date(book.createdAt), 'dd MMMM yyyy', { locale: fr })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`
              px-2 py-1 rounded-[4px] text-[8px] font-black uppercase tracking-widest
              ${isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}
            `}>
              {book.type}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">
              {(book.size / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-all pointer-events-none" />

      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onRead(book.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-[#1e1b4b] text-[9px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
        >
          <BookOpen size={12} />
          Lire
        </button>
        <button
          onClick={() => onDelete(book.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-all active:scale-[0.98]"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};
