import { create } from 'zustand';
import { storageService } from '../services/localStorageService';
import { ScheduleSlot } from '../types';
import { toast } from 'sonner';

interface ScheduleState {
  schedules: ScheduleSlot[];
  loading: boolean;
  activeFiliere: string;
  activeClasse: string;
  fetchSchedules: () => Promise<void>;
  setActiveFiliere: (filiere: string) => void;
  setActiveClasse: (classe: string) => void;
  addSchedule: (data: Omit<ScheduleSlot, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSchedule: (id: string, data: Partial<ScheduleSlot>) => Promise<boolean>;
  deleteSchedule: (id: string) => Promise<void>;
  checkConflicts: (data: Omit<ScheduleSlot, 'id' | 'createdAt'>, excludeId?: string) => string | null;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  loading: false,
  activeFiliere: 'Informatique',
  activeClasse: 'Toutes',

  setActiveFiliere: (filiere) => set({ activeFiliere: filiere, activeClasse: 'Toutes' }),
  setActiveClasse: (classe) => set({ activeClasse: classe }),

  fetchSchedules: async () => {
    set({ loading: true });
    try {
      const schedules = storageService.getAll(storageService.KEYS.SCHEDULE);
      // Sort items by startTime asc
      schedules.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
      set({ schedules, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
      toast.error('Erreur lors de la récupération des emplois du temps');
    }
  },

  checkConflicts: (newData, excludeId) => {
    const { schedules } = get();
    const newStart = newData.startTime;
    const newEnd = newData.endTime;

    for (const slot of schedules) {
      if (excludeId && slot.id === excludeId) continue;
      if (slot.dayOfWeek !== newData.dayOfWeek) continue;

      // Overlap check: (StartA < EndB) and (EndA > StartB)
      const isOverlapping = (newStart < slot.endTime) && (newEnd > slot.startTime);

      if (isOverlapping) {
        if (slot.classe === newData.classe && slot.filiere === newData.filiere) {
          return `Conflit: La classe ${newData.classe} a déjà un cours à cette heure (${slot.subject}).`;
        }
        if (slot.roomId === newData.roomId && newData.roomId !== 'N/A') {
          return `Conflit: La salle ${newData.roomId} est occupée par ${slot.subject}.`;
        }
        if (slot.teacherName === newData.teacherName) {
          return `Conflit: Le professeur ${newData.teacherName} a déjà un cours (${slot.subject}).`;
        }
      }
    }
    return null;
  },

  addSchedule: async (data) => {
    const conflict = get().checkConflicts(data);
    if (conflict) {
      toast.error(conflict);
      return false;
    }

    try {
      const newItem = storageService.add(storageService.KEYS.SCHEDULE, data);
      set(state => ({
        schedules: [...state.schedules, newItem as ScheduleSlot]
      }));
      toast.success('Emploi du temps ajouté');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l’ajout');
      return false;
    }
  },

  updateSchedule: async (id, data) => {
    const current = get().schedules.find(s => s.id === id);
    if (!current) return false;

    const merged = { ...current, ...data };
    const conflict = get().checkConflicts(merged, id);
    if (conflict) {
      toast.error(conflict);
      return false;
    }

    try {
      const updated = storageService.update(storageService.KEYS.SCHEDULE, id, data);
      set(state => ({
        schedules: state.schedules.map(s => s.id === id ? { ...s, ...updated } : s)
      }));
      toast.success('Modifié avec succès');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la modification');
      return false;
    }
  },

  deleteSchedule: async (id) => {
    try {
      storageService.delete(storageService.KEYS.SCHEDULE, id);
      set(state => ({
        schedules: state.schedules.filter(s => s.id !== id)
      }));
      toast.success('Supprimé');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    }
  }
}));
