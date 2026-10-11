import { openDB, IDBPDatabase } from 'idb';
import { Book, Annotation } from '../types';

const DB_NAME = 'uniflow_library';
const STORE_BOOKS = 'books';
const STORE_ANNOTATIONS = 'annotations';
const DB_VERSION = 2;

interface LibraryDB {
  books: {
    key: string;
    value: Book;
  };
  annotations: {
    key: string;
    value: Annotation;
    indexes: { 'by-book': string };
  };
}

let dbPromise: Promise<IDBPDatabase<LibraryDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<LibraryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_BOOKS)) {
          db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ANNOTATIONS)) {
          const annotationStore = db.createObjectStore(STORE_ANNOTATIONS, { keyPath: 'id' });
          annotationStore.createIndex('by-book', 'bookId');
        }
      },
    });
  }
  return dbPromise;
};

export const bookStorage = {
  async getAll(): Promise<Book[]> {
    const db = await getDB();
    return db.getAll(STORE_BOOKS);
  },

  async getById(id: string): Promise<Book | undefined> {
    const db = await getDB();
    return db.get(STORE_BOOKS, id);
  },

  async add(book: Book): Promise<void> {
    const db = await getDB();
    await db.add(STORE_BOOKS, book);
  },

  async update(book: Book): Promise<void> {
    const db = await getDB();
    await db.put(STORE_BOOKS, book);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction([STORE_BOOKS, STORE_ANNOTATIONS], 'readwrite');
    await tx.objectStore(STORE_BOOKS).delete(id);
    
    // Cleanup annotations
    const index = tx.objectStore(STORE_ANNOTATIONS).index('by-book');
    const keys = await index.getAllKeys(id);
    for (const key of keys) {
      await tx.objectStore(STORE_ANNOTATIONS).delete(key);
    }
    await tx.done;
  },

  async toggleFavorite(id: string): Promise<void> {
    const book = await this.getById(id);
    if (book) {
      book.favorite = !book.favorite;
      await this.update(book);
    }
  },

  // Annotations
  async getAnnotations(bookId: string): Promise<Annotation[]> {
    const db = await getDB();
    return db.getAllFromIndex(STORE_ANNOTATIONS, 'by-book', bookId);
  },

  async addAnnotation(annotation: Annotation): Promise<void> {
    const db = await getDB();
    await db.add(STORE_ANNOTATIONS, annotation);
  },

  async deleteAnnotation(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_ANNOTATIONS, id);
  }
};
