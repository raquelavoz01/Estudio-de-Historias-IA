import React, { useState, useRef, useEffect } from 'react';
import { Book, SubscriptionPlan } from '../types';
import { useToast } from '../toast';
import { Button } from './common/Button';
import { PlusCircleIcon, SparklesIcon, BookOpenIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, PencilSquareIcon } from './icons';
import { generateConceptionFromSong } from '../services/geminiService';
import { useBooks } from '../contexts/BookContext';
import { useUser } from '../contexts/UserContext';

interface LibraryViewProps {
    onSelectBook: (bookId: string) => void;
    onOpenEditor: (bookId: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onSelectBook, onOpenEditor }) => {
    const [prompt, setPrompt] = useState('');
    const [songLyrics, setSongLyrics] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingFromSong, setIsCreatingFromSong] = useState(false);
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { books, addBook, importBooks } = useBooks();
    const { selectPlan } = useUser();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);

        if (query.get('payment_success')) {
            const pendingPlan = sessionStorage.getItem('pendingPlan') as SubscriptionPlan;
            if (pendingPlan) {
                selectPlan(pendingPlan);
                toast.success("Pagamento concluído com sucesso! Seu plano foi atualizado.");
                sessionStorage.removeItem('pendingPlan');
            } else {
                toast.success("Pagamento concluído com sucesso!");
            }
            // Limpa a URL para que a mensagem não apareça novamente ao atualizar
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [selectPlan, toast]);

    const handleCreateBook = () => {
        if (!prompt.trim()) {
            toast.error("Por favor, insira uma ideia para a história.");
            return;
        }
        setIsCreating(true);

        const newBook: Book = {
            id: crypto.randomUUID(),
            title: "Novo Rascunho",
            author: "Autor",
            genre: "Fantasia",
            coverArtStyle: "Fotografia cinematográfica, iluminação dramática, alta definição, 4k",
            description: prompt,
            tags: [],
            characters: [],
            world: { name: 'Novo Mundo', description: 'Descreva seu mundo aqui...' },
            chapters: [],
            coverImage: null,
            coverBackground: null,
            coverForeground: null,
            logoImage: null,
            conceptArt: [],
            videoUrl: null,
            conversationalVideoUrl: null,
            musicTracks: [],
            soundEffects: [],
            brandVoice: null,
        };
        
        addBook(newBook);
        toast.success("Rascunho criado! Agora, detalhe sua história.");
        onSelectBook(newBook.id);

        setIsCreating(false);
        setPrompt('');
    };
    
    const handleCreateFromSong = async () => {
        if (!songLyrics.trim()) {
            toast.error("Por favor, cole a letra da música.");
            return;
        }
        setIsCreatingFromSong(true);
        toast.info("A IA está analisando a música para criar um conceito...");

        try {
            const conception = await generateConceptionFromSong(songLyrics);
            const newBook: Book = {
                id: crypto.randomUUID(),
                title: conception.title || "Livro Inspirado em Música",
                author: "Autor",
                genre: conception.genre || "Fantasia",
                description: conception.description || "Descrição gerada a partir da música.",
                tags: conception.tags || [],
                coverArtStyle: "Fotografia cinematográfica, iluminação dramática, alta definição, 4k",
                characters: [],
                world: { name: 'Novo Mundo', description: 'Descreva seu mundo aqui...' },
                chapters: [],
                coverImage: null,
                coverBackground: null,
                coverForeground: null,
                logoImage: null,
                conceptArt: [],
                videoUrl: null,
                conversationalVideoUrl: null,
                musicTracks: [],
                soundEffects: [],
                brandVoice: null,
            };
            addBook(newBook);
            toast.success("Conceito de livro criado a partir da música!");
            onSelectBook(newBook.id);
            setSongLyrics('');
        } catch (error) {
            console.error(error);
            toast.error("Não foi possível gerar a história a partir da música.");
        } finally {
            setIsCreatingFromSong(false);
        }
    };


    const handleExportLibrary = () => {
        if (books.length === 0) {
            toast.info("Não há livros para exportar.");
            return;
        }
        const dataStr = JSON.stringify(books, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'biblioteca_ia_historias.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success("Biblioteca exportada com sucesso!");
    };

    const handleImportLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const importedBooks = JSON.parse(text) as Book[];
                // Validação básica
                if (Array.isArray(importedBooks) && importedBooks.every(b => b.id && b.title)) {
                    importBooks(importedBooks);
                    toast.success("Biblioteca importada com sucesso!");
                } else {
                    throw new Error("Formato de arquivo inválido.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Falha ao importar o arquivo. Verifique o formato.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Minha Biblioteca</h1>
                 <div className="flex items-center space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleImportLibrary} accept=".json" className="hidden"/>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}><ArrowUpTrayIcon className="mr-2 h-5 w-5"/> Importar</Button>
                    <Button variant="secondary" onClick={handleExportLibrary}><ArrowDownTrayIcon className="mr-2 h-5 w-5"/> Exportar</Button>
                </div>
            </div>

            {books.length === 0 && !isCreating && (
                <div className="text-center text-slate-400 py-16 border-2 border-dashed border-slate-700 rounded-lg">
                    <BookOpenIcon className="mx-auto h-12 w-12 mb-4" />
                    <h2 className="text-xl font-semibold">Sua biblioteca está vazia</h2>
                    <p>Comece a criar sua primeira história abaixo.</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map(book => (
                    <div key={book.id} className="bg-slate-800 rounded-lg p-4 flex flex-col justify-between hover:bg-slate-700/50 hover:ring-2 hover:ring-cyan-500 transition-all transform hover:-translate-y-1">
                        <div onClick={() => onSelectBook(book.id)} className="cursor-pointer">
                            <h3 className="font-bold truncate text-lg">{book.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-3 h-16">{book.description}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex space-x-2">
                            <Button onClick={() => onSelectBook(book.id)} variant="secondary" className="w-full text-sm">Detalhes</Button>
                            <Button onClick={() => onOpenEditor(book.id)} variant="secondary" className="w-full text-sm">
                                <PencilSquareIcon className="h-4 w-4 mr-2" />
                                Editor
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800">
                 <div className="w-full max-w-2xl mx-auto text-center">
                    <SparklesIcon className="h-12 w-12 mx-auto text-cyan-400 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Começar uma Nova História</h2>
                    <p className="text-lg text-slate-400 mb-6">Comece com a ideia central. Você poderá refinar os detalhes a seguir.</p>
                    <div className="bg-slate-900/50 p-6 rounded-lg shadow-2xl">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Uma guerra secreta entre anjos e demônios em uma metrópole moderna..."
                            className="w-full h-24 p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                        />
                        <Button
                            onClick={handleCreateBook}
                            isLoading={isCreating}
                            className="w-full mt-4"
                        >
                           <PlusCircleIcon className="mr-2 h-6 w-6"/> Criar Rascunho da História
                        </Button>
                    </div>
                </div>
            </div>

             <div className="mt-12 pt-8 border-t border-slate-800">
                 <div className="w-full max-w-2xl mx-auto text-center">
                    <SparklesIcon className="h-12 w-12 mx-auto text-cyan-400 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Criar a partir de uma Música</h2>
                    <p className="text-lg text-slate-400 mb-6">Cole a letra de uma música e a IA irá extrair a essência da história para criar um conceito de livro original.</p>
                    <div className="bg-slate-900/50 p-6 rounded-lg shadow-2xl">
                        <textarea
                            value={songLyrics}
                            onChange={(e) => setSongLyrics(e.target.value)}
                            placeholder="Cole a letra completa da música aqui..."
                            className="w-full h-32 p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"
                        />
                        <Button
                            onClick={handleCreateFromSong}
                            isLoading={isCreatingFromSong}
                            className="w-full mt-4"
                        >
                           <SparklesIcon className="mr-2 h-6 w-6"/> Gerar História da Música
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LibraryView;