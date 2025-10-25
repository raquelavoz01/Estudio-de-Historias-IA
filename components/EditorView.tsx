import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Book, PageView, Chapter } from '../types';
import { useToast } from '../toast';
import { Button } from './common/Button';
import { SparklesIcon, ChevronLeftIcon, ClipboardDocumentListIcon } from './icons';
import { continueWriting, completeChapterContent } from '../services/geminiService';
import { useBooks } from '../contexts/BookContext';

interface EditorViewProps {
    book: Book;
    onNavigate: (page: PageView) => void;
}

const EditorView: React.FC<EditorViewProps> = ({ book, onNavigate }) => {
    const [chapters, setChapters] = useState<Chapter[]>(book.chapters);
    const [isSaving, setIsSaving] = useState(false);
    const [isAiWriting, setIsAiWriting] = useState(false);
    const [aiCompletingIndex, setAiCompletingIndex] = useState<number | null>(null);
    const toast = useToast();
    const { updateBook } = useBooks();

    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setChapters(book.chapters);
    }, [book.chapters]);

    const handleContentChange = (index: number, content: string) => {
        const newChapters = [...chapters];
        newChapters[index] = { ...newChapters[index], content };
        setChapters(newChapters);
    };

    const handleSave = () => {
        setIsSaving(true);
        updateBook({ ...book, chapters });
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Manuscrito salvo com sucesso (no navegador)!");
        }, 500);
    };
    
    const handleContinueWriting = async () => {
        if (chapters.length === 0) return;

        setIsAiWriting(true);
        toast.info("IA está continuando a história...");
        try {
            const lastChapterIndex = chapters.length - 1;
            const lastChapterContent = chapters[lastChapterIndex].content || '';
            const precedingText = lastChapterContent.slice(-2000); // Envia os últimos 2000 caracteres como contexto
            
            const newText = await continueWriting(book, precedingText);
            
            const newChapters = [...chapters];
            newChapters[lastChapterIndex].content += newText;
            setChapters(newChapters);
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar continuação.");
        } finally {
            setIsAiWriting(false);
        }
    };

    const handleCompleteChapter = async (index: number) => {
        setAiCompletingIndex(index);
        toast.info(`IA está completando o Capítulo ${index + 1}...`);
        try {
            const chapterToComplete = chapters[index];
            const newText = await completeChapterContent(book, index, chapterToComplete.content);
            
            const newChapters = [...chapters];
            newChapters[index].content += newText;
            setChapters(newChapters);
            toast.success(`Capítulo ${index + 1} completado!`);
        } catch (error) {
            console.error(error);
            toast.error(`Falha ao completar o Capítulo ${index + 1}.`);
        } finally {
            setAiCompletingIndex(null);
        }
    };

    const handleExportToGoogleDocs = () => {
        if (chapters.length === 0) {
            toast.error("Não há capítulos para exportar.");
            return;
        }

        try {
            const fullManuscriptText = chapters.map((chapter, index) => {
                return `# Capítulo ${index + 1}: ${chapter.title}\n\n${chapter.content}\n\n---\n\n`;
            }).join('');
            
            navigator.clipboard.writeText(fullManuscriptText);
            toast.success("Manuscrito copiado! Agora, abra um novo Google Doc e cole o conteúdo.");
        } catch (error) {
            console.error("Failed to copy manuscript to clipboard:", error);
            toast.error("Não foi possível copiar o manuscrito. Por favor, tente novamente.");
        }
    };

    const scrollToChapter = (index: number) => {
        const chapterElement = document.getElementById(`chapter-editor-${index}`);
        chapterElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="flex h-screen bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800/50 p-4 flex-shrink-0 flex flex-col border-r border-slate-700">
                <div className="mb-4">
                    <button onClick={() => onNavigate('bookDetail')} className="flex items-center text-sm text-slate-300 hover:text-white transition-colors">
                        <ChevronLeftIcon className="h-5 w-5 mr-1" /> Voltar para Detalhes
                    </button>
                    <h1 className="text-lg font-bold truncate mt-2">{book.title}</h1>
                </div>

                <nav className="flex-grow overflow-y-auto">
                    <h2 className="text-sm font-semibold uppercase text-slate-400 mb-2">Capítulos</h2>
                    <ul>
                        {chapters.map((chapter, index) => (
                            <li key={index}>
                                <button onClick={() => scrollToChapter(index)} className="w-full text-left p-2 rounded-md text-sm hover:bg-slate-700 transition-colors truncate">
                                    {`Cap. ${index + 1}: ${chapter.title}`}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Editor */}
            <main ref={editorContainerRef} className="flex-grow flex flex-col overflow-y-auto">
                <div className="p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full" style={{ fontFamily: "'Georgia', serif" }}>
                    {chapters.length > 0 ? chapters.map((chapter, index) => {
                        const wordCount = getWordCount(chapter.content);
                        const targetWordCount = chapter.targetWordCount || 0;
                        const needsCompletion = wordCount < targetWordCount;

                        return (
                            <div key={index} id={`chapter-editor-${index}`} className="mb-12 bg-slate-800/20 rounded-lg shadow">
                                <div className="p-4">
                                    <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-4">
                                        Capítulo {index + 1}: {chapter.title}
                                    </h2>
                                    <textarea
                                        value={chapter.content}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
                                        className="w-full h-auto min-h-[300px] bg-transparent text-slate-200 text-lg leading-relaxed border-none focus:ring-0 resize-y"
                                        placeholder="Comece a escrever este capítulo..."
                                    />
                                </div>
                                <div className="bg-slate-900/50 px-4 py-2 rounded-b-lg flex justify-between items-center text-sm">
                                    <span className={`font-mono ${needsCompletion ? 'text-yellow-400' : 'text-green-400'}`}>
                                        Palavras: {wordCount} / {targetWordCount}
                                    </span>
                                    {needsCompletion && (
                                        <Button 
                                            size="sm" 
                                            variant="secondary"
                                            onClick={() => handleCompleteChapter(index)}
                                            isLoading={aiCompletingIndex === index}
                                        >
                                            <SparklesIcon className="h-4 w-4 mr-1" />
                                            Completar com IA
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center text-slate-400 mt-20">
                            <p>Crie um esboço na tela de detalhes do livro para começar a escrever.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* AI Tools & Actions Panel */}
            <aside className="w-80 bg-slate-800/50 p-4 flex-shrink-0 flex flex-col border-l border-slate-700">
                 <div className="flex-grow space-y-4">
                    <h2 className="text-sm font-semibold uppercase text-slate-400">Ferramentas de IA</h2>
                    <Button onClick={handleContinueWriting} isLoading={isAiWriting} className="w-full" disabled={chapters.length === 0}>
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Continuar a Escrita
                    </Button>
                    <p className="text-xs text-slate-400">
                        A IA usará os últimos parágrafos do último capítulo como contexto para continuar a história.
                    </p>

                    <div className="pt-4 border-t border-slate-700">
                         <h2 className="text-sm font-semibold uppercase text-slate-400">Backup e Exportação</h2>
                         <Button onClick={handleExportToGoogleDocs} variant="secondary" className="w-full mt-2" disabled={chapters.length === 0}>
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                            Exportar para Google Docs
                        </Button>
                        <p className="text-xs text-slate-400 mt-2">
                            Copia todo o manuscrito para sua área de transferência para colar em um documento externo. Faça isso regularmente para manter seu trabalho seguro.
                        </p>
                    </div>

                </div>

                <div className="flex-shrink-0">
                    <Button onClick={handleSave} isLoading={isSaving} className="w-full">
                        Salvar Manuscrito
                    </Button>
                </div>
            </aside>
        </div>
    );
};

export default EditorView;