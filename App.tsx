import React, { useState, useEffect } from 'react';
import { PageView } from './types';
import Header from './components/Header';
import LibraryView from './components/LibraryView';
import BookDetailView from './components/BookDetailView';
import EditorView from './components/EditorView';
import PricingView from './components/PricingView';
import FaqView from './components/FaqView';
import ContactForm from './components/ContactForm';
import SettingsView from './components/SettingsView';
import SplashScreen from './components/SplashScreen';
import CustomerNoticesView from './components/CustomerNoticesView';
import AuthView from './components/AuthView'; // Importa a nova visualização de autenticação
import { useBooks } from './contexts/BookContext';
import { useUser } from './contexts/UserContext'; // Importa o novo contexto do usuário

const App: React.FC = () => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [page, setPage] = useState<PageView>('library');
    const { activeBook, selectBook, clearActiveBook } = useBooks();
    const { isAuthenticated, isAuthLoading } = useUser(); // Obtém o estado de autenticação

    // Simula o carregamento inicial de dados
    useEffect(() => {
        setTimeout(() => {
            setIsAppLoading(false);
        }, 1500);
    }, []);
    
    // Efeito para garantir que não fiquemos em uma página de detalhes/editor sem um livro ativo.
    useEffect(() => {
        if ((page === 'bookDetail' || page === 'editor') && !activeBook) {
            setPage('library');
        }
    }, [page, activeBook]);


    const handleNavigate = (targetPage: PageView) => {
        // Se não estivermos indo para uma visualização que precise de um livro ativo, limpe-o.
        if (targetPage !== 'bookDetail' && targetPage !== 'editor') {
            clearActiveBook();
        }
        setPage(targetPage);
    };

    const handleSelectBook = (bookId: string) => {
        selectBook(bookId);
        setPage('bookDetail');
    };

    const handleOpenEditor = (bookId: string) => {
        selectBook(bookId);
        setPage('editor');
    };

    const renderPage = () => {
        switch (page) {
            case 'library':
                return <LibraryView onSelectBook={handleSelectBook} onOpenEditor={handleOpenEditor} />;
            case 'bookDetail':
                return activeBook ? <BookDetailView book={activeBook} onNavigate={handleNavigate} /> : null;
            case 'editor':
                return activeBook ? <EditorView book={activeBook} onNavigate={handleNavigate} /> : null;
            case 'pricing':
                return <PricingView />;
            case 'faq':
                return <FaqView />;
            case 'contact':
                return <ContactForm />;
            case 'settings':
                return <SettingsView />;
            case 'customerNotices':
                return <CustomerNoticesView />;
            default:
                return <LibraryView onSelectBook={handleSelectBook} onOpenEditor={handleOpenEditor}/>;
        }
    };

    if (isAppLoading || isAuthLoading) {
        return <SplashScreen />;
    }

    // Se o usuário não estiver autenticado, mostra a tela de login/cadastro.
    if (!isAuthenticated) {
        return <AuthView />;
    }
    
    // O layout principal agora é renderizado de forma diferente para a visualização do editor para permitir tela cheia.
    if (page === 'editor') {
        return renderPage();
    }

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans flex flex-col">
            <Header onNavigate={handleNavigate} />
            <main className="flex-grow container mx-auto p-4 md:p-6">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;