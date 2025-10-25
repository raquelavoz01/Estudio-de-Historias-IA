import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { correctGrammar } from '../../services/geminiService';
import { ClipboardDocumentIcon, DocumentCheckIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const GrammarCorrectorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [originalText, setOriginalText] = useState('');
    const [correctedText, setCorrectedText] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!originalText.trim()) {
            toast.error("Por favor, cole o texto que deseja corrigir.");
            return;
        }
        setIsGenerating(true);
        setCorrectedText('');
        toast.info("A IA está revisando seu texto...");
        try {
            const result = await correctGrammar(originalText);
            setCorrectedText(result);
            toast.success("Texto corrigido com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao corrigir o texto.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!correctedText) return;
        navigator.clipboard.writeText(correctedText);
        toast.success("Texto corrigido copiado para a área de transferência!");
    };
    
    return (
        <Card title="Corretor Gramatical com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Certifique-se de que sua escrita não tenha erros. Cole seu texto abaixo e deixe a IA aprimorá-lo.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="original-grammar-text" className="block text-sm font-medium text-slate-300 mb-1">Texto Original</label>
                    <textarea 
                        id="original-grammar-text" 
                        value={originalText} 
                        onChange={(e) => setOriginalText(e.target.value)} 
                        placeholder="Cole um parágrafo, diálogo ou qualquer texto que precise de revisão..." 
                        rows={8} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <DocumentCheckIcon className="mr-2 h-5 w-5" /> Corrigir Texto
                </Button>
                
                {(isGenerating || correctedText) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Texto Corrigido</h3>
                             {correctedText && (
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
                                    {correctedText}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};