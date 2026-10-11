import { create } from 'zustand';
import { storageService } from '../services/localStorageService';
import { Student } from '../types';
import { toast } from 'sonner';

interface StudentState {
  students: Student[];
  loading: boolean;
  filters: {
    search: string;
    filiere: string;
    classe: string;
    sortBy: string;
  };
  setFilter: (key: string, value: string) => void;
  fetchStudents: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'matricule' | 'createdAt'>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  generateMatricule: (filiere: string) => string;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loading: false,
  filters: {
    search: '',
    filiere: 'Toutes',
    classe: 'Toutes',
    sortBy: 'name_asc',
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }));
  },

  fetchStudents: async () => {
    set({ loading: true });
    try {
      const students = storageService.getAll(storageService.KEYS.STUDENTS);
      // Sort items by lastName asc
      students.sort((a: any, b: any) => a.lastName.localeCompare(b.lastName));
      set({ students, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
      toast.error('Erreur lors de la récupération des étudiants');
    }
  },

  generateMatricule: (filiere: string) => {
    const year = new Date().getFullYear();
    const prefix = `${(filiere || 'GEN').toUpperCase().slice(0, 4)}-${year}`;
    const students = storageService.getAll(storageService.KEYS.STUDENTS);
    
    const relevantStudents = students.filter((s: any) => s.filiere === filiere);
    let increment = relevantStudents.length + 1;

    return `${prefix}-${increment.toString().padStart(4, '0')}`;
  },

  addStudent: async (studentData) => {
    try {
      const matricule = get().generateMatricule(studentData.filiere);
      const newStudent = storageService.add(storageService.KEYS.STUDENTS, {
        ...studentData,
        matricule
      });
      
      set((state) => ({
        students: [newStudent as Student, ...state.students]
      }));
      toast.success('Étudiant ajouté avec succès');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l’ajout');
    }
  },

  updateStudent: async (id, data) => {
    try {
      const updated = storageService.update(storageService.KEYS.STUDENTS, id, data);
      set((state) => ({
        students: state.students.map(s => s.id === id ? { ...s, ...updated } : s)
      }));
      toast.success('Modification réussie');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la modification');
    }
  },

  deleteStudent: async (id) => {
    try {
      storageService.delete(storageService.KEYS.STUDENTS, id);
      set((state) => ({
        students: state.students.filter(s => s.id !== id)
      }));
      toast.success('Étudiant supprimé');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    }
  }
}));
