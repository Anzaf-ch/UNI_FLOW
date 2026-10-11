import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Loader2,
  AlertCircle,
  Menu,
  X,
  Highlighter,
  Underline as UnderlineIcon,
  Trash2,
  Bookmark,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bookStorage } from '../utils/bookStorage';
import { Book, Annotation, Chapter } from '../types';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import { toast } from 'sonner';

// Set up worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export const Reader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordContent, setWordContent] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: 'Jaune', value: '#fef08a', class: 'bg-yellow-200' },
    { name: 'Vert', value: '#bbf7d0', class: 'bg-green-200' },
    { name: 'Bleu', value: '#bfdbfe', class: 'bg-blue-200' },
    { name: 'Rose', value: '#fbcfe8', class: 'bg-pink-200' },
  ];

  // PDF state
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    const fetchBookAndAnnotations = async () => {
      if (!id) return;
      try {
        const [bookData, annoData] = await Promise.all([
          bookStorage.getById(id),
          bookStorage.getAnnotations(id)
        ]);

        if (bookData) {
          setBook(bookData);
          setAnnotations(annoData);
          if (bookData.type === 'doc' || bookData.type === 'docx') {
            await processWordFile(bookData.file);
          }
        } else {
          toast.error('Livre introuvable');
          navigate('/library');
        }
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndAnnotations();
  }, [id]);

  const processWordFile = async (base64: string) => {
    try {
      const base64Data = base64.split(',')[1];
      const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, 'text/html');
      
      // Look for H1, H2, H3 and also bold paragraphs that look like titles
      const possibleTitles = doc.querySelectorAll('h1, h2, h3, p strong');
      const detectedChapters: Chapter[] = [];

      possibleTitles.forEach((header, index) => {
        const text = header.textContent?.trim();
        if (!text || text.length < 3) return;
        
        // If it's a strong inside p, we treat the whole p as title if it's short
        const targetElement = header.tagName === 'STRONG' ? (header.parentElement as HTMLElement) : (header as HTMLElement);
        
        const chapterId = `chapter-${index}`;
        targetElement.id = chapterId;
        detectedChapters.push({
          id: chapterId,
          title: text,
          elementId: chapterId
        });
      });

      setChapters(detectedChapters);
      setWordContent(doc.body.innerHTML);
    } catch (error) {
      console.error(error);
      toast.error('Erreur de conversion Word');
    }
  };


  // Re-apply annotations to Word content
  useEffect(() => {
    if (wordContent && annotations.length > 0 && book?.type !== 'pdf') {
      const timer = setTimeout(() => {
        annotations.forEach(anno => applyAnnotationToDOM(anno));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [wordContent, annotations, book]);

  const applyAnnotationToDOM = (anno: Annotation) => {
    if (!contentRef.current) return;
    if (contentRef.current.querySelector(`[data-id="${anno.id}"]`)) return;

    const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walker.nextNode()) {
      const text = node.nodeValue || '';
      if (text.includes(anno.text)) {
        const parent = node.parentNode;
        if (!parent || (parent as HTMLElement).dataset?.id) continue;
        const parts = text.split(anno.text);
        const fragment = document.createDocumentFragment();
        parts.forEach((part, i) => {
          fragment.appendChild(document.createTextNode(part));
          if (i < parts.length - 1) {
            const span = document.createElement('span');
            if (anno.type === 'highlight') {
              span.style.backgroundColor = anno.color || '#fef08a';
              span.style.padding = '2px';
              span.style.borderRadius = '2px';
            } else {
              span.style.textDecoration = 'underline';
              span.style.textDecorationColor = '#1e1b4b';
              span.style.textDecorationThickness = '2px';
            }
            span.style.cursor = 'help';
            span.dataset.id = anno.id;
            span.textContent = anno.text;
            span.onclick = (e) => {
              e.stopPropagation();
              removeAnnotation(anno.id);
            };
            fragment.appendChild(span);
          }
        });
        parent.replaceChild(fragment, node);
        break;
      }
    }
  };

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString());
      setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 50 });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [handleSelection]);

  const applyAnnotation = async (type: 'highlight' | 'underline', color?: string) => {
    if (!book || !selectedText) return;
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      bookId: book.id,
      type,
      text: selectedText,
      color,
      createdAt: new Date().toISOString()
    };
    try {
      await bookStorage.addAnnotation(annotation);
      setAnnotations(prev => [...prev, annotation]);
      toast.success(type === 'highlight' ? 'Surligné' : 'Souligné');
      if (book.type !== 'pdf') applyAnnotationToDOM(annotation);
      setShowToolbar(false);
      setShowColorPicker(false);
      window.getSelection()?.removeAllRanges();
    } catch (error) { toast.error('Erreur'); }
  };

  const removeAnnotation = async (annoId: string) => {
    if (confirm('Supprimer cette annotation ?')) {
      try {
        await bookStorage.deleteAnnotation(annoId);
        setAnnotations(prev => prev.filter(a => a.id !== annoId));
        const elements = document.querySelectorAll(`[data-id="${annoId}"]`);
        elements.forEach(el => {
          const parent = el.parentNode;
          if (parent) {
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
          }
        });
        toast.success('Supprimé');
      } catch (error) { toast.error('Erreur'); }
    }
  };

  const navigateToChapter = (chapter: Chapter) => {
    if (chapter.elementId) {
      const el = document.getElementById(chapter.elementId);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (chapter.pageNumber) {
      setPageNumber(chapter.pageNumber);
    }
    setIsSidebarOpen(false);
  };

  const onItemClick = ({ pageNumber }: { pageNumber: number }) => {
    setPageNumber(pageNumber);
  };

  const onDocumentLoadSuccess = async (pdf: any) => {
    setNumPages(pdf.numPages);
    setPageNumber(1);
    
    try {
      const outline = await pdf.getOutline();
      if (outline && outline.length > 0) {
        const toc: Chapter[] = outline.map((item: any, index: number) => ({
          id: `toc-${index}`,
          title: item.title,
          pageNumber: typeof item.dest === 'string' ? 1 : undefined, // Simplification, destinations are complex in PDF.js
          dest: item.dest
        }));
        setChapters(toc);
      } else {
        // Fallback to pages if no outline
        const pdfChapters: Chapter[] = Array.from({ length: pdf.numPages }, (_, i) => ({
          id: `page-${i + 1}`,
          title: `Page ${i + 1}`,
          pageNumber: i + 1
        }));
        setChapters(pdfChapters);
      }
    } catch (error) {
      console.error("Error fetching PDF outline:", error);
    }
  };

  const downloadFile = () => {
    if (!book) return;
    const link = document.createElement('a');
    link.href = book.file;
    link.download = book.fileName;
    link.click();
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Ouverture...</p>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="relative flex flex-col h-[calc(100vh-120px)] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm font-sans">
      <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:text-[#1e1b4b] hover:bg-slate-50 rounded-lg"><Menu size={20} /></button>
          <button onClick={() => navigate('/library')} className="p-2 text-slate-500 hover:text-[#1e1b4b] hover:bg-slate-50 rounded-lg"><ArrowLeft size={20} /></button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-[#1e1b4b] uppercase tracking-tight line-clamp-1 max-w-[200px] md:max-w-md">{book.title}</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded-[4px] bg-slate-100 ${book.type === 'pdf' ? 'text-rose-600' : 'text-blue-600'}`}>{book.type.toUpperCase()}</span>
              • {book.fileName}
            </p>
          </div>
        </div>
        {book.type === 'pdf' && (
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} className="p-2 text-slate-600 hover:bg-white rounded-md disabled:opacity-30"><ChevronLeft size={18} /></button>
            <div className="px-3 py-1 bg-white rounded-md border border-slate-100 shadow-sm hidden md:block">
              <span className="text-[10px] font-black text-slate-800 tracking-widest">Page {pageNumber} / {numPages}</span>
            </div>
            <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} className="p-2 text-slate-600 hover:bg-white rounded-md disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {book.type === 'pdf' && (
            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><ZoomOut size={18} /></button>
              <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><ZoomIn size={18} /></button>
            </div>
          )}
          <button onClick={downloadFile} className="p-2.5 bg-[#1e1b4b] text-white rounded-lg hover:bg-indigo-600 shadow-lg active:scale-95"><Download size={18} /></button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3"><BookOpen size={20} className="text-indigo-600" /><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Sommaire</h3></div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                  {chapters.map((chapter) => (
                    <button key={chapter.id} onClick={() => navigateToChapter(chapter)} className={`w-full p-4 text-left rounded-lg transition-all group border border-transparent ${(chapter.pageNumber === pageNumber) ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50'}`}>
                      <p className={`text-xs font-black uppercase tracking-tight ${chapter.pageNumber === pageNumber ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-600'}`}>{chapter.title}</p>
                    </button>
                  ))}
                </div>
                {annotations.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-4 px-2"><Bookmark size={14} className="text-indigo-600" /><h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Annotations ({annotations.length})</h4></div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {annotations.map(anno => (
                        <div key={anno.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm group">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${anno.type === 'highlight' ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700'}`}>{anno.type === 'highlight' ? 'Surligné' : 'Souligné'}</span>
                            <button onClick={() => removeAnnotation(anno.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                          </div>
                          <p className="text-[10px] font-bold text-slate-600 line-clamp-2 italic">"{anno.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-auto bg-slate-100 custom-scrollbar p-6">
          <div className="max-w-4xl mx-auto pb-20">
            {book.type === 'pdf' ? (
              <div className="flex flex-col items-center">
                <div className="bg-white shadow-2xl rounded-sm overflow-hidden ring-1 ring-slate-200">
                  <Document 
                    file={book.file} 
                    onLoadSuccess={onDocumentLoadSuccess} 
                    onItemClick={onItemClick}
                    onLoadError={() => toast.error('Erreur PDF')} 
                    loading={<div className="p-20 flex flex-col items-center gap-4"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}
                  >
                    <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} loading={null} />
                  </Document>
                </div>
              </div>
            ) : (
              <motion.div ref={contentRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-xl rounded-2xl p-8 md:p-16 prose prose-slate max-w-none border border-slate-200">
                {wordContent ? <div className="reader-word-content text-slate-700 leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: wordContent }} /> : <div className="flex flex-col items-center justify-center py-20 gap-4"><AlertCircle className="text-amber-500" size={48} /><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Contenu vide</p></div>}
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating Annotation Toolbar */}
        <AnimatePresence>
          {showToolbar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              style={{ position: 'fixed', left: toolbarPos.x, top: toolbarPos.y, transform: 'translateX(-50%)' }}
              className="z-50 flex flex-col bg-[#1e1b4b] rounded-2xl shadow-2xl ring-4 ring-white overflow-hidden"
            >
              {!showColorPicker ? (
                <div className="flex items-center gap-1 p-1.5">
                  <button
                    onClick={() => setShowColorPicker(true)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full text-white group"
                  >
                    <Highlighter size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Surligner</span>
                  </button>
                  <div className="w-px h-4 bg-white/20" />
                  <button
                    onClick={() => applyAnnotation('underline')}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full text-white group"
                  >
                    <UnderlineIcon size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Souligner</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 px-4">
                  <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest mr-2">Couleur :</span>
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => applyAnnotation('highlight', c.value)}
                      className="w-6 h-6 rounded-full border-2 border-white/20 hover:scale-110 hover:border-white transition-all"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                  <button 
                    onClick={() => setShowColorPicker(false)}
                    className="ml-2 p-1 text-white/40 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .reader-word-content h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2.5rem; color: #1e1b4b; border-bottom: 4px solid #f1f5f9; padding-bottom: 1rem; line-height: 1.2; }
        .reader-word-content h2 { font-size: 1.75rem; font-weight: 800; margin-top: 3rem; margin-bottom: 1.5rem; color: #1e1b4b; display: block; border-left: 6px solid #4f46e5; padding-left: 1.5rem; }
        .reader-word-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #312e81; }
        .reader-word-content p { margin-bottom: 1.5rem; font-size: 1.15rem; font-family: 'Georgia', serif; line-height: 1.8; color: #334155; }
        .reader-word-content strong { color: #1e1b4b; font-weight: 800; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Animation for smooth scrolling and highlighting */
        .reader-word-content [data-id] {
          transition: all 0.2s ease;
        }
        .reader-word-content [data-id]:hover {
          filter: brightness(0.95);
          outline: 1px solid rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};
