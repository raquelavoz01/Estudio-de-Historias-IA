import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { humanizeAiText } from '../../services/geminiService';
import { UserCircleIcon, ClipboardDocumentIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const AiTextHumanizerPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [originalText, setOriginalText] = useState('');
    const [humanizedText, setHumanizedText] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!originalText.trim()) {
            toast.error("Por favor, cole o texto gerado por IA que deseja humanizar.");
            return;
        }
        setIsGenerating(true);
        setHumanizedText('');
        toast.info("A IA está adicionando um toque humano ao seu texto...");
        try {
            const result = await humanizeAiText(book, originalText);
            setHumanizedText(result);
            toast.success("Texto humanizado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao humanizar o texto.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!humanizedText) return;
        navigator.clipboard.writeText(humanizedText);
        toast.success("Texto copiado para a área de transferência!");
    };
    
    return (
        <Card title="Humanizador de Texto IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Transforme texto gerado por IA para que soe mais humano e ignore a detecção de IA.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="original-ai-text" className="block text-sm font-medium text-slate-300 mb-1">Texto Gerado por IA</label>
                    <textarea 
                        id="original-ai-text" 
                        value={originalText} 
                        onChange={(e) => setOriginalText(e.target.value)} 
                        placeholder="Cole o texto gerado por IA aqui..." 
                        rows={6} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <UserCircleIcon className="mr-2 h-5 w-5" /> Humanizar Texto com IA
                </Button>
                
                {(isGenerating || humanizedText) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Texto Humanizado</h3>
                             {humanizedText && (
                                <Button onClick={handleCopyToClipboard} variant="secondary">
                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                                </Button>
                             )}
                        </div>
                        <div className="w-full min-h-[150px] bg-slate-900/50 rounded-md p-3">
                            {isGenerating ? (
                                <div className="flex items-center justify-center h-full min-h-[100px]">
                                    <Spinner />
                                </div>
                            ) : (
                                <p className="text-slate-300 whitespace-pre-wrap">{humanizedText}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};