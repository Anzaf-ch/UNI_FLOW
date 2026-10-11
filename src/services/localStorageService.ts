
const STORAGE_KEYS = {
  AUTH_USER: 'uniflow_auth_user',
  TEACHERS: 'uniflow_teachers',
  STUDENTS: 'uniflow_students',
  DEPARTMENTS: 'uniflow_departments',
  COURSES: 'uniflow_courses',
  SCHEDULE: 'uniflow_schedule',
  GRADES: 'uniflow_grades',
  FINANCE: 'uniflow_finance',
  TRANSACTIONS: 'uniflow_finance'
};

// Données initiales pour l'Admin
const DEFAULT_ADMIN = {
  uid: 'admin-001',
  email: 'admin@admin.com',
  password: 'admin123',
  displayName: 'Administrateur Local',
  role: 'admin',
  createdAt: new Date().toISOString()
};

export const storageService = {
  // --- AUTHENTICATION ---
  login: (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      const user = { ...DEFAULT_ADMIN };
      delete user.password; // Sécurité : on ne garde pas le mot de passe en session
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  getAuthenticatedUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return user ? JSON.parse(user) : null;
  },

  // --- GENERIC CRUD ---
  getAll: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  getItem: (key, id) => {
    const items = storageService.getAll(key);
    return items.find(item => item.id === id);
  },

  add: (key, item) => {
    const items = storageService.getAll(key);
    const newItem = { 
      ...item, 
      id: item.id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    return newItem;
  },

  update: (key, id, newData) => {
    let items = storageService.getAll(key);
    items = items.map(item => item.id === id ? { ...item, ...newData, updatedAt: new Date().toISOString() } : item);
    localStorage.setItem(key, JSON.stringify(items));
    return items.find(item => item.id === id);
  },

  delete: (key, id) => {
    let items = storageService.getAll(key);
    items = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  },

  // --- DATA SEEDING (Optionnel: pour avoir des données au départ) ---
  seedInitialData: () => {
    if (storageService.getAll(STORAGE_KEYS.DEPARTMENTS).length === 0) {
      storageService.add(STORAGE_KEYS.DEPARTMENTS, { id: 'dept-1', name: 'Informatique & IA', code: 'IT-AI', description: 'Génie logiciel et intelligence artificielle' });
      storageService.add(STORAGE_KEYS.DEPARTMENTS, { id: 'dept-2', name: 'Management & Finance', code: 'BUS', description: 'Gestion d\'entreprise et finance' });
    }
    
    if (storageService.getAll(STORAGE_KEYS.COURSES).length === 0) {
      storageService.add(STORAGE_KEYS.COURSES, { id: 'crs-1', name: 'Algorithmique & C', code: 'INF101', departmentId: 'dept-1', credits: 6, teacherId: 't-1', semester: 1 });
      storageService.add(STORAGE_KEYS.COURSES, { id: 'crs-2', name: 'Base de données SQL', code: 'INF201', departmentId: 'dept-1', credits: 4, teacherId: 't-2', semester: 2 });
    }

    if (storageService.getAll(STORAGE_KEYS.TEACHERS).length === 0) {
      storageService.add(STORAGE_KEYS.TEACHERS, { id: 't-1', firstName: 'Jean', lastName: 'Michel', email: 'jean.michel@uniflow.mg', phone: '+261 34 01 001 01', specialty: 'Algorithmique', subject: 'Informatique', status: 'active' });
      storageService.add(STORAGE_KEYS.TEACHERS, { id: 't-2', firstName: 'Marie', lastName: 'Lova', email: 'marie.lova@uniflow.mg', phone: '+261 34 02 002 02', specialty: 'Base de données', subject: 'Informatique', status: 'active' });
    }

    if (storageService.getAll(STORAGE_KEYS.STUDENTS).length === 0) {
      storageService.add(STORAGE_KEYS.STUDENTS, { id: 's-1', firstName: 'Rakoto', lastName: 'Andry', matricule: 'M-2024-001', classe: '1ère année (L1)', filiere: 'Informatique', status: 'active' });
    }
  },

  resetAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  },
  
  KEYS: STORAGE_KEYS
};
