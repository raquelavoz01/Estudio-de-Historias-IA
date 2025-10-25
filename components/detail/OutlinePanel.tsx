import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { SparklesIcon } from '../icons';
import { useToast } from '../../toast';
import { generateBookOutline } from '../../services/geminiService';

interface OutlinePanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const OutlinePanel: React.FC<OutlinePanelProps> = ({ book, onUpdate }) => {
    const [chapterCount, setChapterCount] = useState(10);
    const [targetWordCount, setTargetWordCount] = useState(2500);
    const [isGenerating, setIsGenerating] = useState(false);
    const toast = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const newChapters = await generateBookOutline(book, chapterCount, targetWordCount);
            onUpdate({ chapters: newChapters });
            toast.success("Esboço gerado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar o esboço.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <Card title="Esboço da História">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-3 rounded-md">
                     <div className="flex items-center gap-2">
                        <label htmlFor="chapterCount" className="font-medium whitespace-nowrap">Nº de Capítulos</label>
                        <input type="number" id="chapterCount" value={chapterCount} onChange={(e) => setChapterCount(Math.max(1, Number(e.target.value)))} className="w-20 bg-slate-700 border-slate-600 rounded-md p-2" />
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="wordCount" className="font-medium whitespace-nowrap">Contagem de Palavras por Capítulo</label>
                        <input type="number" id="wordCount" step="100" value={targetWordCount} onChange={(e) => setTargetWordCount(Math.max(100, Number(e.target.value)))} className="w-24 bg-slate-700 border-slate-600 rounded-md p-2" />
                    </div>
                    <Button onClick={handleGenerate} isLoading={isGenerating} className="flex-grow">
                        <SparklesIcon className="mr-2 h-5 w-5"/> Gerar Esboço com IA
                    </Button>
                </div>
                 {book.chapters.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {book.chapters.map((chapter, index) => (
                            <li key={index} className="bg-slate-800 p-3 rounded-md">
                                <h3 className="font-bold">Capítulo {index + 1}: {chapter.title}</h3>
                                <p className="text-sm text-slate-400">{chapter.summary}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-700 rounded-lg">
                        <p>Nenhum esboço gerado ainda.</p>
                        <p className="text-sm">Defina os detalhes acima e clique no botão para criar o esboço da sua história.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};