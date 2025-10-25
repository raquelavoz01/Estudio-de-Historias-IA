import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateYouTubeVideoIdeas } from '../../services/geminiService';
import { ClipboardDocumentIcon, SparklesIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const YouTubeVideoIdeasPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Por favor, insira um tópico para obter ideias de vídeo.");
            return;
        }
        setIsLoading(true);
        setGeneratedIdeas([]);
        toast.info("A IA está buscando inspiração para seus vídeos...");
        try {
            const result = await generateYouTubeVideoIdeas(book, topic);
            setGeneratedIdeas(result);
            toast.success("Ideias de vídeo geradas com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar as ideias de vídeo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Ideia copiada para a área de transferência!");
    };

    return (
        <Card title="Gerador de Ideias para Vídeos do YouTube">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Inspire-se para fazer seu próximo vídeo no YouTube.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="video-idea-topic" className="block text-sm font-medium text-slate-300 mb-1">Qual é o tópico geral?</label>
                    <input
                        id="video-idea-topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Personagens, o mundo do livro, promoção, bastidores..."
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <SparklesIcon className="mr-2 h-5 w-5" /> Gerar Ideias de Vídeo
                </Button>

                {(isLoading || generatedIdeas.length > 0) && (
                    <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-semibold mb-2">Ideias Geradas</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[150px]">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {generatedIdeas.map((idea, index) => (
                                    <div key={index} className="bg-slate-900/50 rounded-md p-3 pr-12 relative flex items-center">
                                        <p className="text-slate-300 flex-grow">{idea}</p>

                                        <button
                                            onClick={() => handleCopyToClipboard(idea)}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors"
                                            aria-label="Copiar ideia"
                                        >
                                            <ClipboardDocumentIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};