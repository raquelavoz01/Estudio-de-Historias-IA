import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateMagicToolResponse } from '../../services/geminiService';
import { ClipboardDocumentIcon, WrenchScrewdriverIcon } from '../icons';
import { Spinner } from '../common/Spinner';

interface MagicToolPanelProps {
    book: Book;
}

export const MagicToolPanel: React.FC<MagicToolPanelProps> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Por favor, descreva a ferramenta de IA que você deseja criar.");
            return;
        }
        setIsGenerating(true);
        setGeneratedText('');
        toast.info("A IA está construindo sua ferramenta mágica...");
        try {
            const result = await generateMagicToolResponse(prompt, book);
            setGeneratedText(result);
            toast.success("Sua ferramenta de IA mágica respondeu!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao usar a ferramenta mágica.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        toast.success("Resultado copiado para a área de transferência!");
    };
    
    return (
        <Card title="Ferramenta de IA Mágica">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie qualquer ferramenta de IA que você precisar com um único prompt. A IA agirá como a ferramenta que você descrever.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="magic-tool-prompt" className="block text-sm font-medium text-slate-300 mb-1">Descreva sua Ferramenta</label>
                    <textarea 
                        id="magic-tool-prompt" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        placeholder="Ex: Um gerador de nomes de cidades fantásticas, um analisador de ritmo de capítulo, um gerador de reviravoltas na trama..." 
                        rows={4} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <WrenchScrewdriverIcon className="mr-2 h-5 w-5" /> Gerar Ferramenta
                </Button>
                
                {(isGenerating || generatedText) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Resultado da Ferramenta</h3>
                             {generatedText && (
                                <Button onClick={handleCopyToClipboard} variant="secondary">
                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                                </Button>
                             )}
                        </div>
                        <div className="w-full min-h-[200px] max-h-[60vh] overflow-y-auto bg-slate-900/50 rounded-md p-4">
                            {isGenerating ? (
                                <div className="flex items-center justify-center h-full min-h-[150px]">
                                    <Spinner />
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                    {generatedText}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};