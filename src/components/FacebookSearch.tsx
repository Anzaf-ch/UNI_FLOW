import React, { useState, useEffect } from 'react';
import { Search, Facebook, ExternalLink, MessageSquare, Trash2, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface SearchHistoryItem {
  id: string;
  name: string;
  timestamp: number;
}

export const FacebookSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('fb_search_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history');
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('fb_search_history', JSON.stringify(history));
  }, [history]);

  const performSearch = (name: string) => {
    const encodedQuery = encodeURIComponent(name.trim());
    const searchUrl = `https://www.facebook.com/search/people/?q=${encodedQuery}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Veuillez entrer un nom pour la recherche');
      return;
    }

    const newSearch: SearchHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: query.trim(),
      timestamp: Date.now()
    };

    // Add to history (limit to 5 items)
    setHistory(prev => {
      const filtered = prev.filter(item => item.name.toLowerCase() !== query.trim().toLowerCase());
      return [newSearch, ...filtered].slice(0, 5);
    });

    performSearch(query);
    setQuery('');
    toast.success(`Recherche lancée pour "${newSearch.name}"`);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info('Historique effacé');
  };

  return (
    <div className="bg-white rounded-md border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-sm">
          <Facebook size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Communication Sociale</h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Rechercher des personnes</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative group transition-all duration-300 transform focus-within:scale-[1.01]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher sur Facebook..."
            className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-sm text-[11px] font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-300"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
        >
          Lancer la recherche
          <ExternalLink size={14} />
        </button>
      </form>

      {/* Recent Searches */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={12} className="text-slate-400" />
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Recherches Récentes</h4>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {history.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-slate-300 font-medium italic py-4"
              >
                Aucune recherche récente
              </motion.p>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-md p-3 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-700 truncate pr-8">{item.name}</span>
                    <button 
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => performSearch(item.name)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-100 rounded-sm text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all"
                    >
                      Profil
                      <ExternalLink size={10} />
                    </button>
                    <button
                      onClick={() => window.open('https://m.me', '_blank')}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-100 rounded-sm text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                    >
                      Contacter
                      <MessageSquare size={10} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-tight">
          <span>Plateforme Sécurisée</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connecté à Meta
          </span>
        </div>
      </div>
    </div>
  );
};
