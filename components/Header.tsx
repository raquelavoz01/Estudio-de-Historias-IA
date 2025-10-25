import React, { useState } from 'react';
import { PageView } from '../types';
import { SparklesIcon, LibraryIcon, CurrencyDollarIcon, QuestionMarkCircleIcon, EnvelopeIcon, CogIcon, BellIcon, UserCircleIcon } from './icons';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
    onNavigate: (page: PageView) => void;
}

const planLabels: { [key: string]: string } = {
    free: 'Plano Gratuito',
    writer: 'Plano Escritor',
    architect: 'Plano Arquiteto',
    master: 'Plano Mestre',
};

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const { user, logout } = useUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800">
            <div className="container mx-auto flex items-center justify-between p-4">
                <div className="flex items-center cursor-pointer" onClick={() => onNavigate('library')}>
                    <SparklesIcon className="h-8 w-8 text-cyan-400 mr-2" />
                    <h1 className="text-xl font-bold text-white">Estúdio de Histórias IA</h1>
                </div>
                <nav className="flex items-center space-x-4">
                    <button onClick={() => onNavigate('library')} className="hidden md:flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors"><LibraryIcon className="mr-2 h-5 w-5" /> Biblioteca</button>
                    <button onClick={() => onNavigate('pricing')} className="hidden md:flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors"><CurrencyDollarIcon className="mr-2 h-5 w-5" /> Preços</button>
                    <button onClick={() => onNavigate('faq')} className="hidden md:flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors"><QuestionMarkCircleIcon className="mr-2 h-5 w-5" /> FAQ</button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)} 
                            className="flex items-center p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                        >
                            <UserCircleIcon className="h-7 w-7 text-slate-300" />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
                                <div className="p-4 border-b border-slate-700">
                                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                                    <p className="text-xs text-cyan-400">{planLabels[user?.subscriptionPlan || 'free']}</p>
                                </div>
                                <div className="py-2">
                                     <a onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 cursor-pointer">Configurações</a>
                                     <a onClick={() => { onNavigate('contact'); setIsProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 cursor-pointer">Contato</a>
                                     <a onClick={() => { onNavigate('customerNotices'); setIsProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 cursor-pointer">Avisos</a>
                                </div>
                                <div className="p-2 border-t border-slate-700">
                                    <button 
                                        onClick={() => { logout(); setIsProfileOpen(false); }} 
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md"
                                    >
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;