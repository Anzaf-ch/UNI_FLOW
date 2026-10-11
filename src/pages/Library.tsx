import React, { useState, useEffect, useMemo } from 'react';
import { 
  Library as LibraryIcon, 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Book as BookIcon,
  Grid,
  List as ListIcon,
  AlertCircle,
  Loader2,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bookStorage } from '../utils/bookStorage';
import { Book } from '../types';
import { BookCard } from '../components/BookCard';
import { AddBookModal } from '../components/AddBookModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Library: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'doc' | 'docx' | 'favorite'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await bookStorage.getAll();
      setBooks(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filterType === 'all' || 
        (filterType === 'favorite' ? book.favorite : book.type === filterType);
      return matchesSearch && matchesFilter;
    });
  }, [books, searchTerm, filterType]);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      try {
        await bookStorage.delete(id);
        toast.success('Livre supprimé');
        fetchBooks();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await bookStorage.toggleFavorite(id);
      fetchBooks();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section with stats */}
      <div className="relative overflow-hidden bg-[#1e1b4b] rounded-2xl p-8 mb-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 backdrop-blur-md rounded-xl text-indigo-100 ring-1 ring-white/10">
                <LibraryIcon size={24} />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bibliothèque Électronique</h2>
            </div>
            <p className="text-indigo-200/60 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
              <BookIcon size={12} />
              {books.length} Ressources documentaires disponibles offline
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-white px-6 py-4 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] text-[#1e1b4b] hover:bg-slate-100 transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98]"
          >
            <Plus size={18} />
            Ajouter un livre
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 pointer-events-none" />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 border border-slate-100 rounded-sm shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-sm py-3.5 pl-12 pr-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          {(['all', 'pdf', 'doc', 'docx', 'favorite'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-5 py-3.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2
                ${filterType === type 
                  ? 'bg-[#1e1b4b] text-white shadow-lg shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
              `}
            >
              {type === 'favorite' && <Bookmark size={12} />}
              {type === 'all' ? 'Tous' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Initialisation des ressources...</p>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onRead={(id) => navigate(`/library/read/${id}`)}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-slate-100 rounded-3xl"
        >
          <div className="p-6 bg-slate-50 rounded-full text-slate-300 mb-6">
            <LibraryIcon size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
            {searchTerm || filterType !== 'all' ? 'Aucun livre ne correspond' : 'Votre bibliothèque est vide'}
          </h3>
          <p className="text-sm font-bold text-slate-400 max-w-sm mb-8 leading-relaxed">
            {searchTerm || filterType !== 'all' 
              ? 'Essayez d\'ajuster vos filtres ou vos termes de recherche.'
              : 'Commencez par ajouter vos premiers documents PDF ou Word pour les consulter à tout moment.'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 bg-[#1e1b4b] px-8 py-4 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <Plus size={18} />
              Importer mon premier livre
            </button>
          )}
        </motion.div>
      )}

      {/* Stats footer overlay */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-2 rounded-full shadow-2xl flex items-center gap-1">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Database Local IndexedDB</span>
          </div>
        </div>
      </div>

      <AddBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBooks}
      />
    </div>
  );
};
