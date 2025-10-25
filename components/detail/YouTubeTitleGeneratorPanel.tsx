import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateYouTubeTitles } from '../../services/geminiService';
import { ClipboardDocumentIcon, YoutubeIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const YouTubeTitleGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [videoTopic, setVideoTopic] = useState('');
    const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!videoTopic.trim()) {
            toast.error("Por favor, descreva sobre o que é o vídeo.");
            return;
        }
        setIsLoading(true);
        setGeneratedTitles([]);
        toast.info("A IA está criando títulos para o seu vídeo...");
        try {
            const result = await generateYouTubeTitles(book, videoTopic);
            setGeneratedTitles(result);
            toast.success("Títulos gerados com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar os títulos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Título copiado para a área de transferência!");
    };

    return (
        <Card title="Gerador de Títulos para YouTube">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie títulos atraentes para seus vídeos do YouTube em segundos para aumentar as visualizações.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="video-topic" className="block text-sm font-medium text-slate-300 mb-1">Sobre o que é o seu vídeo?</label>
                    <textarea
                        id="video-topic"
                        value={videoTopic}
                        onChange={(e) => setVideoTopic(e.target.value)}
                        placeholder="Ex: Uma análise do primeiro capítulo, explicando o sistema de magia, o trailer do livro..."
                        rows={3}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <YoutubeIcon className="mr-2 h-5 w-5" /> Gerar Títulos
                </Button>

                {(isLoading || generatedTitles.length > 0) && (
                    <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-semibold mb-2">Títulos Sugeridos</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[150px]">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {generatedTitles.map((title, index) => (
                                    <div key={index} className="bg-slate-900/50 rounded-md p-3 pr-12 relative flex items-center">
                                        <p className="text-slate-300 flex-grow">{title}</p>
                                        <button
                                            onClick={() => handleCopyToClipboard(title)}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors"
                                            aria-label="Copiar título"
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