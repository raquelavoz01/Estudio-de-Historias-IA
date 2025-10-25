import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateParagraph } from '../../services/geminiService';
import { SparklesIcon, ClipboardDocumentIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const ParagraphWriterPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [generatedParagraph, setGeneratedParagraph] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Por favor, insira um tópico para o parágrafo.");
            return;
        }
        setIsGenerating(true);
        setGeneratedParagraph('');
        toast.info("A IA está escrevendo seu parágrafo...");
        try {
            const result = await generateParagraph(book, prompt);
            setGeneratedParagraph(result);
            toast.success("Parágrafo gerado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar o parágrafo.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!generatedParagraph) return;
        navigator.clipboard.writeText(generatedParagraph);
        toast.success("Parágrafo copiado para a área de transferência!");
    };
    
    return (
        <Card title="Escritor de Parágrafos com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Dê à IA um tópico e ela escreverá um parágrafo detalhado no estilo da sua história.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="paragraph-prompt" className="block text-sm font-medium text-slate-300 mb-1">Tópico do Parágrafo</label>
                    <textarea 
                        id="paragraph-prompt" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        placeholder="Ex: O primeiro encontro do herói com o artefato mágico..." 
                        rows={3} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <SparklesIcon className="mr-2 h-5 w-5" /> Gerar Parágrafo
                </Button>
                
                {(isGenerating || generatedParagraph) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Resultado Gerado</h3>
                             {generatedParagraph && (
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
                                <p className="text-slate-300 whitespace-pre-wrap">{generatedParagraph}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};