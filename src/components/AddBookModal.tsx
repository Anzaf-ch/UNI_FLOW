import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bookStorage } from '../utils/bookStorage';
import { Book } from '../types';
import { toast } from 'sonner';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const type = selectedFile.name.split('.').pop()?.toLowerCase();
      if (type === 'pdf' || type === 'doc' || type === 'docx') {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.split('.').slice(0, -1).join('.'));
        }
      } else {
        toast.error('Format non supporté. PDF ou Word uniquement.');
        setFile(null);
      }
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const base64File = await readFileAsBase64(file);
      const newBook: Book = {
        id: crypto.randomUUID(),
        title,
        file: base64File,
        fileName: file.name,
        type: file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'doc' | 'docx',
        createdAt: new Date().toISOString(),
        size: file.size,
        favorite: false
      };

      await bookStorage.add(newBook);
      toast.success('Livre ajouté avec succès');
      onSuccess();
      onClose();
      setTitle('');
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'ajout du livre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Ajouter un livre</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">PDF ou Word uniquement</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titre du livre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-sm py-4 px-4 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  placeholder="Ex: Manuel de Génie Logiciel"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fichier</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    cursor-pointer border-2 border-dashed rounded-lg p-8 transition-all
                    flex flex-col items-center justify-center gap-3
                    ${file ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
                  `}
                >
                  {file ? (
                    <>
                      <FileText className="text-indigo-600" size={40} />
                      <div className="text-center">
                        <p className="text-xs font-black text-indigo-900 line-clamp-1 px-4">{file.name}</p>
                        <p className="text-[10px] font-bold text-indigo-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-tight">Cliquer pour choisir un fichier</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Glisser-déposer aussi disponible</p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                  Le fichier sera stocké localement dans la base de données de votre navigateur (IndexedDB). 
                  Il ne quittera jamais votre ordinateur.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !title || !file}
                className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#1e1b4b] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Ajouter à la bibliothèque
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
