import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { rewriteParagraph } from '../../services/geminiService';
import { LanguageIcon, ClipboardDocumentIcon } from '../icons';
import { Spinner } from '../common/Spinner';

const goals = [
    "Tornar mais descritivo",
    "Tornar mais conciso",
    "Aumentar a tensão",
    "Adicionar mais emoção",
    "Simplificar a linguagem",
    "Corrigir gramática e estilo",
];

export const ParagraphRewriterPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [originalText, setOriginalText] = useState('');
    const [goal, setGoal] = useState(goals[0]);
    const [rewrittenText, setRewrittenText] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!originalText.trim()) {
            toast.error("Por favor, cole o parágrafo que deseja reescrever.");
            return;
        }
        setIsGenerating(true);
        setRewrittenText('');
        toast.info("A IA está aprimorando seu parágrafo...");
        try {
            const result = await rewriteParagraph(book, originalText, goal);
            setRewrittenText(result);
            toast.success("Parágrafo reescrito com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao reescrever o parágrafo.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!rewrittenText) return;
        navigator.clipboard.writeText(rewrittenText);
        toast.success("Parágrafo copiado para a área de transferência!");
    };
    
    return (
        <Card title="Reescritor de Parágrafos com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Cole um parágrafo do seu texto e escolha um objetivo para a IA aprimorá-lo.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="original-paragraph" className="block text-sm font-medium text-slate-300 mb-1">Parágrafo Original</label>
                    <textarea 
                        id="original-paragraph" 
                        value={originalText} 
                        onChange={(e) => setOriginalText(e.target.value)} 
                        placeholder="Cole o parágrafo aqui..." 
                        rows={5} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <div>
                    <label htmlFor="rewrite-goal" className="block text-sm font-medium text-slate-300 mb-1">Objetivo da Reescrevita</label>
                     <select
                        id="rewrite-goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    >
                        {goals.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <LanguageIcon className="mr-2 h-5 w-5" /> Reescrever com IA
                </Button>
                
                {(isGenerating || rewrittenText) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Parágrafo Aprimorado</h3>
                             {rewrittenText && (
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
                                <p className="text-slate-300 whitespace-pre-wrap">{rewrittenText}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};