import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Book } from '../types';
import { useUser } from './UserContext'; // Importar o contexto do usuário

const BASE_STORAGE_KEY = 'ia-story-studio-books';

interface BookContextType {
    books: Book[];
    activeBook: Book | null;
    addBook: (book: Book) => void;
    updateBook: (updatedBook: Book) => void;
    importBooks: (importedBooks: Book[]) => void;
    selectBook: (bookId: string) => void;
    clearActiveBook: () => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [activeBookId, setActiveBookId] = useState<string | null>(null);
    const { user, isAuthenticated } = useUser(); // Obter o usuário atual

    // Chave de armazenamento dinâmica baseada no ID do usuário
    const getStorageKey = () => user ? `${BASE_STORAGE_KEY}-${user.id}` : null;

    // Carregar livros quando o usuário muda (login/logout)
    useEffect(() => {
        if (!isAuthenticated) {
            setBooks([]); // Limpa os livros ao fazer logout
            return;
        }
        const storageKey = getStorageKey();
        if (storageKey) {
            try {
                const storedBooks = localStorage.getItem(storageKey);
                if (storedBooks) {
                    setBooks(JSON.parse(storedBooks));
                } else {
                    setBooks([]); // Garante que a lista esteja vazia se não houver nada armazenado
                }
            } catch (error) {
                console.error("Failed to load books from localStorage", error);
                setBooks([]);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    // Salvar livros sempre que eles mudarem E houver um usuário logado
    useEffect(() => {
        const storageKey = getStorageKey();
        if (storageKey) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(books));
            } catch (error) {
                console.error("Failed to save books to localStorage", error);
            }
        }
    }, [books, user]);

    const addBook = (book: Book) => {
        setBooks(currentBooks => [...currentBooks, book]);
    };

    const updateBook = (updatedBook: Book) => {
        setBooks(currentBooks =>
            currentBooks.map(b => b.id === updatedBook.id ? updatedBook : b)
        );
    };
    
    const importBooks = (importedBooks: Book[]) => {
        setBooks(importedBooks);
    }

    const selectBook = (bookId: string) => {
        setActiveBookId(bookId);
    };

    const clearActiveBook = () => {
        setActiveBookId(null);
    };

    const activeBook = books.find(b => b.id === activeBookId) || null;

    const value = {
        books,
        activeBook,
        addBook,
        updateBook,
        importBooks,
        selectBook,
        clearActiveBook,
    };

    return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

export const useBooks = (): BookContextType => {
    const context = useContext(BookContext);
    if (!context) {
        throw new Error('useBooks must be used within a BookProvider');
    }
    return context;
};