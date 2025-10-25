import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateVideo } from '../../services/geminiService';
import { Spinner } from '../common/Spinner';
import { ArrowUpTrayIcon, SparklesIcon } from '../icons';

interface VideoPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({ book, onUpdate }) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState(book.description);
    const [image, setImage] = useState<{ data: string; mimeType: string; } | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            }
        };
        checkApiKey();
    }, []);

    useEffect(() => {
        if (book.videoUrl) {
            let isCancelled = false;
            const fetchVideo = async () => {
                setIsVideoLoading(true);
                setVideoSrc(null);
                try {
                    const response = await fetch(`${book.videoUrl}&key=${process.env.API_KEY}`);
                    if (!response.ok) throw new Error('Falha ao buscar o vídeo');
                    const videoBlob = await response.blob();
                    if (!isCancelled) {
                        const blobUrl = URL.createObjectURL(videoBlob);
                        setVideoSrc(blobUrl);
                    }
                } catch (error) {
                    console.error(error);
                    if (!isCancelled) toast.error("Não foi possível carregar o vídeo gerado.");
                } finally {
                    if (!isCancelled) setIsVideoLoading(false);
                }
            };
            fetchVideo();

            return () => {
                isCancelled = true;
                if(videoSrc) URL.revokeObjectURL(videoSrc);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [book.videoUrl, toast]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true); 
            toast.info("Chave de API selecionada. Você agora pode gerar vídeos.");
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const [, base64] = result.split(',');
            setImage({ data: base64, mimeType: file.type });
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && !image) {
            toast.error("Por favor, insira um prompt ou carregue uma imagem.");
            return;
        }
        setIsGenerating(true);
        toast.info("A geração de vídeo pode levar vários minutos...");
        try {
            const fullPrompt = `Crie um trailer cinematográfico de 10 segundos para um livro. A cena é: "${prompt}". Clima épico e dramático.`;
            const downloadLink = await generateVideo(fullPrompt, image || undefined);
            onUpdate({ videoUrl: downloadLink });
            toast.success("Vídeo gerado com sucesso! Carregando para visualização...");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar o vídeo.");
            if (error instanceof Error && error.message.includes("Requested entity was not found")) {
                 toast.error("Chave de API inválida. Por favor, selecione uma chave válida.");
                 setApiKeySelected(false);
            }
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <Card title="Criação de Vídeo com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Transforme texto ou imagens em conteúdo de vídeo envolvente. A geração pode levar vários minutos.
            </p>
            {!apiKeySelected ? (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-md">
                    <h3 className="font-bold">Ação Necessária: Selecione uma Chave de API</h3>
                    <p className="text-sm mt-1">A geração de vídeo requer uma chave de API do Google AI Studio com faturamento ativado.</p>
                    <p className="text-sm mt-1">Para mais informações sobre cobranças, consulte a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">documentação de faturamento</a>.</p>
                    <Button onClick={handleSelectKey} className="mt-4">Selecionar Chave de API</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {(videoSrc || isVideoLoading) && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Vídeo Gerado</h3>
                            <div className="aspect-video bg-slate-900/50 rounded-md flex items-center justify-center">
                                {isVideoLoading ? <Spinner /> : <video controls src={videoSrc ?? ''} className="w-full rounded-md" />}
                            </div>
                        </div>
                    )}
                    <div className="pt-6 border-t border-slate-700 space-y-4">
                        <h3 className="text-lg font-semibold">{book.videoUrl ? 'Gerar Novo Vídeo (Substituirá o atual)' : 'Gerar Vídeo'}</h3>
                        <div>
                            <label htmlFor="video-prompt" className="block text-sm font-medium text-slate-300 mb-1">Prompt de Texto</label>
                            <textarea id="video-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Um dragão sobrevoando um castelo em chamas..." rows={3} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Imagem Inicial (Opcional)</label>
                            {image ? (
                                <div className="flex items-center space-x-4">
                                    <img src={`data:${image.mimeType};base64,${image.data}`} alt="Pré-visualização" className="h-20 w-auto rounded-md" />
                                    <Button variant="secondary" onClick={() => setImage(null)}>Remover Imagem</Button>
                                </div>
                            ) : (
                                <Button variant="secondary" onClick={() => imageInputRef.current?.click()}>
                                    <ArrowUpTrayIcon className="mr-2 h-5 w-5" /> Carregar Imagem
                                </Button>
                            )}
                            <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </div>
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                           <SparklesIcon className="mr-2 h-5 w-5" /> Gerar Vídeo
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};