import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateYouTubeDescription } from '../../services/geminiService';
import { ClipboardDocumentIcon, ClipboardDocumentListIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const YouTubeDescriptionGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [videoTopic, setVideoTopic] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [generatedDescription, setGeneratedDescription] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!videoTopic.trim() || !videoTitle.trim()) {
            toast.error("Por favor, preencha o título e o tema do vídeo.");
            return;
        }
        setIsLoading(true);
        setGeneratedDescription('');
        toast.info("A IA está escrevendo a descrição do seu vídeo...");
        try {
            const result = await generateYouTubeDescription(book, videoTopic, videoTitle);
            setGeneratedDescription(result);
            toast.success("Descrição gerada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar a descrição.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!generatedDescription) return;
        navigator.clipboard.writeText(generatedDescription);
        toast.success("Descrição copiada para a área de transferência!");
    };

    return (
        <Card title="Gerador de Descrição para YouTube">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Faça seus vídeos se destacarem e terem boa classificação com ótimas descrições.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="video-title-desc" className="block text-sm font-medium text-slate-300 mb-1">Título do Vídeo</label>
                     <input
                        id="video-title-desc"
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Cole o título do seu vídeo aqui..."
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="video-topic-desc" className="block text-sm font-medium text-slate-300 mb-1">Sobre o que é o seu vídeo?</label>
                    <textarea
                        id="video-topic-desc"
                        value={videoTopic}
                        onChange={(e) => setVideoTopic(e.target.value)}
                        placeholder="Ex: Uma análise do primeiro capítulo, explicando o sistema de magia, o trailer do livro..."
                        rows={3}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <ClipboardDocumentListIcon className="mr-2 h-5 w-5" /> Gerar Descrição
                </Button>

                {(isLoading || generatedDescription) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Descrição Gerada</h3>
                             {generatedDescription && (
                                <Button onClick={handleCopyToClipboard} variant="secondary">
                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                                </Button>
                             )}
                        </div>
                        <div className="w-full min-h-[300px] max-h-[60vh] overflow-y-auto bg-slate-900/50 rounded-md p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full min-h-[200px]">
                                    <Spinner />
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                    {generatedDescription}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};