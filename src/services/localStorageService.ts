const STORAGE_KEYS = {
  AUTH_USER: 'uniflow_auth_user',
  USERS: 'uniflow_users',
  TEACHERS: 'uniflow_teachers',
  STUDENTS: 'uniflow_students',
  DEPARTMENTS: 'uniflow_departments',
  COURSES: 'uniflow_courses',
  SCHEDULE: 'uniflow_schedule',
  GRADES: 'uniflow_grades',
  FINANCE: 'uniflow_finance',
  TRANSACTIONS: 'uniflow_transactions'
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
  register: (email: string, password: string, displayName: string): { user?: any; error?: string } => {
    const users = storageService.getAll(STORAGE_KEYS.USERS);
    const normalized = String(email).trim().toLowerCase();
    const exists =
      normalized === DEFAULT_ADMIN.email ||
      users.some((u: any) => String(u.email).toLowerCase() === normalized);
    if (exists) return { error: 'Cet email est déjà utilisé' };

    const account = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      email: String(email).trim(),
      password,
      displayName,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(account);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const user = { ...account } as any;
    delete user.password;
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    return { user };
  },

  login: (email: string, password: string) => {
    const normalized = String(email).trim().toLowerCase();
    const users = storageService.getAll(STORAGE_KEYS.USERS);
    const match = users.find(
      (u: any) => String(u.email).toLowerCase() === normalized && u.password === password
    );
    if (match) {
      const user = { ...match };
      delete user.password;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      return user;
    }
    if (normalized === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      const user = { ...DEFAULT_ADMIN } as any;
      delete user.password;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  changePassword: (uid: string, oldPassword: string, newPassword: string): { ok?: boolean; error?: string } => {
    if (uid === DEFAULT_ADMIN.uid) {
      return { error: 'Le mot de passe du compte administrateur par défaut ne peut pas être modifié.' };
    }
    const users = storageService.getAll(STORAGE_KEYS.USERS);
    const index = users.findIndex((u: any) => u.uid === uid);
    if (index === -1) return { error: 'Compte introuvable.' };
    if (users[index].password !== oldPassword) return { error: 'Ancien mot de passe incorrect.' };
    users[index].password = newPassword;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { ok: true };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  getAuthenticatedUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return user ? JSON.parse(user) : null;
  },

  // --- GENERIC CRUD ---
  getAll: (key: string): any[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  getItem: (key: string, id: string) => {
    const items = storageService.getAll(key);
    return items.find(item => item.id === id);
  },

  add: (key: string, item: any) => {
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

  update: (key: string, id: string, newData: any) => {
    let items = storageService.getAll(key);
    items = items.map(item => item.id === id ? { ...item, ...newData, updatedAt: new Date().toISOString() } : item);
    localStorage.setItem(key, JSON.stringify(items));
    return items.find(item => item.id === id);
  },

  delete: (key: string, id: string) => {
    let items = storageService.getAll(key);
    items = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  },

  // --- DATA SEEDING (données de démonstration au premier lancement) ---
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
      storageService.add(STORAGE_KEYS.STUDENTS, { id: 's-2', firstName: 'Rasoa', lastName: 'Naivo', matricule: 'M-2024-002', classe: '2ème année (L2)', filiere: 'Informatique', status: 'active' });
    }
  },

  resetAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  },

  KEYS: STORAGE_KEYS
};
