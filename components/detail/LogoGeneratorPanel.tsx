import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { SparklesIcon, ArrowDownTrayIcon } from '../icons';
import { useToast } from '../../toast';
import { generateLogo } from '../../services/geminiService';
import { Spinner } from '../common/Spinner';

interface LogoGeneratorPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const LogoGeneratorPanel: React.FC<LogoGeneratorPanelProps> = ({ book, onUpdate }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt) {
            toast.error("Por favor, descreva o conceito do seu logo.");
            return;
        }
        setIsGenerating(true);
        toast.info("A IA está desenhando seu logo...");
        try {
            const imageData = await generateLogo(prompt);
            onUpdate({ logoImage: imageData });
            toast.success("Logo gerado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar o logo.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadLogo = () => {
        if (!book.logoImage) {
            toast.error("Nenhum logo foi gerado para baixar.");
            return;
        }
    
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${book.logoImage}`;
        const fileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_logo.jpeg`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download do logo iniciado!");
    };
    
    return (
        <Card title="Gerador de Logo com IA">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="logo-prompt" className="block text-sm font-medium text-slate-300 mb-1">Descreva seu Logo</label>
                        <textarea 
                            id="logo-prompt"
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)} 
                            placeholder="Ex: Uma raposa astuta lendo um livro sob a lua, um cérebro estilizado com uma pena de escrever, uma espada brilhante em uma bigorna..." 
                            rows={4} 
                            className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                        />
                    </div>
                    <div className="space-y-2">
                        <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                            <SparklesIcon className="h-5 w-5 mr-2" />Gerar Logo
                        </Button>
                        <Button onClick={handleDownloadLogo} disabled={!book.logoImage} variant="secondary" className="w-full">
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Baixar Logo
                        </Button>
                    </div>
                </div>
                 <div className="aspect-square bg-slate-700/50 rounded-md flex items-center justify-center overflow-hidden border border-slate-700">
                    {isGenerating ? (
                        <Spinner />
                    ) : book.logoImage ? (
                        <img src={`data:image/jpeg;base64,${book.logoImage}`} alt="Logo gerado" className="w-full h-full object-contain p-2"/>
                    ) : (
                        <div className="text-center text-slate-400 p-4">
                            <p>Seu logo aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};