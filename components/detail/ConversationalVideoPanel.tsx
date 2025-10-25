import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateConversationalVideo } from '../../services/geminiService';
import { Spinner } from '../common/Spinner';
import { ArrowUpTrayIcon, SparklesIcon } from '../icons';

interface ConversationalVideoPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const ConversationalVideoPanel: React.FC<ConversationalVideoPanelProps> = ({ book, onUpdate }) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [dialogue, setDialogue] = useState('');
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
        if (book.conversationalVideoUrl) {
            let isCancelled = false;
            const fetchVideo = async () => {
                setIsVideoLoading(true);
                setVideoSrc(null);
                try {
                    const response = await fetch(`${book.conversationalVideoUrl}&key=${process.env.API_KEY}`);
                    if (!response.ok) throw new Error('Falha ao buscar o vídeo');
                    const videoBlob = await response.blob();
                    if (!isCancelled) {
                        const blobUrl = URL.createObjectURL(videoBlob);
                        setVideoSrc(blobUrl);
                    }
                } catch (error) {
                    console.error(error);
                    if (!isCancelled) toast.error("Não foi possível carregar o vídeo de conversa gerado.");
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
    }, [book.conversationalVideoUrl, toast]);

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
        if (!image) {
            toast.error("Por favor, carregue uma imagem do personagem.");
            return;
        }
        if (!dialogue.trim()) {
            toast.error("Por favor, insira o diálogo para o vídeo.");
            return;
        }
        setIsGenerating(true);
        toast.info("A geração de vídeo pode levar vários minutos...");
        try {
            const downloadLink = await generateConversationalVideo(dialogue, image);
            onUpdate({ conversationalVideoUrl: downloadLink });
            toast.success("Vídeo de conversa gerado com sucesso! Carregando para visualização...");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar o vídeo de conversa.");
            if (error instanceof Error && error.message.includes("Requested entity was not found")) {
                 toast.error("Chave de API inválida. Por favor, selecione uma chave válida.");
                 setApiKeySelected(false);
            }
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <Card title="Vídeos de Conversa com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Carregue a imagem de um personagem, insira o diálogo e crie um vídeo de conversa realista. A geração pode levar vários minutos.
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
                            <h3 className="text-lg font-semibold mb-2">Vídeo de Conversa Gerado</h3>
                            <div className="aspect-[9/16] w-full max-w-sm mx-auto bg-slate-900/50 rounded-md flex items-center justify-center">
                                {isVideoLoading ? <Spinner /> : <video controls src={videoSrc ?? ''} className="w-full h-full rounded-md" />}
                            </div>
                        </div>
                    )}
                    <div className="pt-6 border-t border-slate-700 space-y-4">
                        <h3 className="text-lg font-semibold">{book.conversationalVideoUrl ? 'Gerar Novo Vídeo (Substituirá o atual)' : 'Gerar Vídeo de Conversa'}</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Imagem do Personagem (Obrigatório)</label>
                            {image ? (
                                <div className="flex items-center space-x-4">
                                    <img src={`data:${image.mimeType};base64,${image.data}`} alt="Pré-visualização do Personagem" className="h-20 w-auto rounded-md" />
                                    <Button variant="secondary" onClick={() => setImage(null)}>Remover Imagem</Button>
                                </div>
                            ) : (
                                <Button variant="secondary" onClick={() => imageInputRef.current?.click()}>
                                    <ArrowUpTrayIcon className="mr-2 h-5 w-5" /> Carregar Imagem
                                </Button>
                            )}
                            <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </div>

                        <div>
                            <label htmlFor="dialogue-prompt" className="block text-sm font-medium text-slate-300 mb-1">Diálogo</label>
                            <textarea id="dialogue-prompt" value={dialogue} onChange={(e) => setDialogue(e.target.value)} placeholder="Ex: Eu estive esperando por você..." rows={3} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"/>
                        </div>

                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                           <SparklesIcon className="mr-2 h-5 w-5" /> Gerar Vídeo de Conversa
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};