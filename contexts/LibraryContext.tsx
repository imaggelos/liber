import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export type BookFormat = 'EPUB' | 'PDF' | 'MOBI' | 'CBZ' | 'TXT' | 'Other';

export type Book = {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  fileName?: string;
  uri?: string;
  progress: number;
  addedAt: number;
  isSample?: boolean;
};

type LibraryContextValue = {
  books: Book[];
  isLoaded: boolean;
  importBooks: () => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  updateProgress: (id: string, progress: number) => Promise<void>;
};

const STORAGE_KEY = '@liber/library/v1';

const LibraryContext = createContext<LibraryContextValue | null>(null);

function formatFromName(name: string): BookFormat {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'epub') return 'EPUB';
  if (extension === 'pdf') return 'PDF';
  if (extension === 'mobi' || extension === 'azw' || extension === 'azw3') return 'MOBI';
  if (extension === 'cbz' || extension === 'cbr') return 'CBZ';
  if (extension === 'txt' || extension === 'md') return 'TXT';
  return 'Other';
}

function titleFromName(name: string) {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const restoredBooks = JSON.parse(stored) as Book[];
          setBooks(restoredBooks.filter((book) => !book.isSample && book.id !== 'sample-woolf' && book.id !== 'sample-kafka'));
        }
      })
      .catch(() => {
        Alert.alert('Library unavailable', 'Liber could not restore your local library.');
      })
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books)).catch(() => {
      Alert.alert('Could not save', 'Your library could not be saved on this device.');
    });
  }, [books, isLoaded]);

  const importBooks = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/epub+zip',
        'application/pdf',
        'application/x-mobipocket-ebook',
        'text/plain',
        'application/zip',
      ],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const imported = await Promise.all(result.assets.map(async (asset, index) => {
      const id = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
      const fileName = `${id}-${asset.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const destination = `${FileSystem.documentDirectory}books/${fileName}`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}books`, { intermediates: true });
      await FileSystem.copyAsync({ from: asset.uri, to: destination });
      return {
        id,
        title: titleFromName(asset.name),
        author: 'Imported book',
        format: formatFromName(asset.name),
        fileName: asset.name,
        uri: destination,
        progress: 0,
        addedAt: Date.now() - index,
      } satisfies Book;
    }));

    setBooks((current) => [...imported, ...current]);
  };

  const removeBook = async (id: string) => {
    setBooks((current) => current.filter((book) => book.id !== id));
  };

  const updateProgress = async (id: string, progress: number) => {
    setBooks((current) =>
      current.map((book) => (book.id === id ? { ...book, progress: Math.max(0, Math.min(1, progress)) } : book)),
    );
  };

  const value = useMemo(
    () => ({ books, isLoaded, importBooks, removeBook, updateProgress }),
    [books, isLoaded],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error('useLibrary must be used inside LibraryProvider');
  return value;
}
