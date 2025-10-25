import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { summarizeContent } from '../../services/geminiService';
import { ClipboardDocumentIcon, Bars3BottomLeftIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const ContentSummarizerPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [originalText, setOriginalText] = useState('');
    const [summarizedText, setSummarizedText] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!originalText.trim()) {
            toast.error("Por favor, cole o texto que deseja resumir.");
            return;
        }
        setIsGenerating(true);
        setSummarizedText('');
        toast.info("A IA está resumindo seu texto...");
        try {
            const result = await summarizeContent(originalText);
            setSummarizedText(result);
            toast.success("Texto resumido com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao resumir o texto.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!summarizedText) return;
        navigator.clipboard.writeText(summarizedText);
        toast.success("Resumo copiado para a área de transferência!");
    };
    
    return (
        <Card title="Resumo de Conteúdo com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Obtenha os pontos principais de qualquer texto em uma fração de tempo que levaria para lê-lo.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="original-content" className="block text-sm font-medium text-slate-300 mb-1">Texto Original</label>
                    <textarea 
                        id="original-content" 
                        value={originalText} 
                        onChange={(e) => setOriginalText(e.target.value)} 
                        placeholder="Cole um artigo, capítulo, e-mail ou qualquer texto longo aqui..." 
                        rows={8} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <Bars3BottomLeftIcon className="mr-2 h-5 w-5" /> Resumir Texto
                </Button>
                
                {(isGenerating || summarizedText) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Resumo Gerado</h3>
                             {summarizedText && (
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
                                    {summarizedText}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};