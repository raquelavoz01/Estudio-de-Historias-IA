import React, { useState, useRef } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { ArrowUpTrayIcon, SparklesIcon, ArrowDownTrayIcon } from '../icons';
import { useToast } from '../../toast';
import { generateComposedCoverImage } from '../../services/geminiService';

interface CoverArtPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const CoverArtPanel: React.FC<CoverArtPanelProps> = ({ book, onUpdate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const toast = useToast();
    const foregroundInputRef = useRef<HTMLInputElement>(null);

    const handleForegroundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const base64 = result.split(',')[1];
            onUpdate({
                coverForeground: { data: base64, mimeType: file.type },
                coverImage: null // Redefine a capa final ao carregar nova imagem de destaque
            });
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateCover = async () => {
        if (!book.coverForeground) {
            toast.error("Por favor, carregue uma imagem de destaque primeiro.");
            return;
        }
        setIsGenerating(true);
        toast.info("A IA está criando sua capa, isso pode levar um momento...");
        try {
            const imageB64 = await generateComposedCoverImage(book.coverForeground.data, book.coverForeground.mimeType, book);
            onUpdate({ coverImage: imageB64 });
            toast.success("Capa gerada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar a capa.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadCover = () => {
        if (!book.coverImage) {
            toast.error("Nenhuma capa foi gerada para baixar.");
            return;
        }
    
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${book.coverImage}`;
        // Sanitiza o título para um nome de arquivo seguro
        const fileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cover.jpeg`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download da capa iniciado!");
    };

    return (
        <Card title="Capa do Livro">
            <p className="text-xs text-slate-400 -mt-3 mb-3">Otimizado para as dimensões do Wattpad (aprox. 512x800).</p>
            <div className="space-y-4">
                <div className="relative aspect-[9/16] bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                    {book.coverImage ? (
                        <img src={`data:image/jpeg;base64,${book.coverImage}`} alt="Capa final do livro" className="w-full h-full object-cover"/>
                    ) : (
                        <>
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400">
                                <span>Fundo será gerado pela IA</span>
                            </div>
                            {book.coverForeground && (
                                <img src={`data:${book.coverForeground.mimeType};base64,${book.coverForeground.data}`} alt="Destaque da capa" className="absolute inset-0 w-full h-full object-contain z-10"/>
                            )}
                        </>
                    )}
                </div>
                <div className="space-y-2">
                     <Button variant="secondary" onClick={() => foregroundInputRef.current?.click()} className="w-full">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" /> Carregar Destaque
                    </Button>
                     <Button onClick={handleGenerateCover} isLoading={isGenerating} className="w-full">
                        <SparklesIcon className="h-5 w-5 mr-2" /> Gerar Capa com IA
                    </Button>
                     <Button onClick={handleDownloadCover} disabled={!book.coverImage} variant="secondary" className="w-full">
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Baixar Capa
                    </Button>
                </div>
                <input type="file" ref={foregroundInputRef} onChange={handleForegroundFileChange} accept="image/*" className="hidden" />
            </div>
        </Card>
    );
};