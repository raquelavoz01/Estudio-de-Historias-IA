import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateCustomText } from '../../services/geminiService';
import { SparklesIcon, ClipboardDocumentIcon } from '../icons';
import { Spinner } from '../common/Spinner';

interface CustomTextGeneratorPanelProps {
    book: Book;
    onUpdate?: (update: Partial<Book>) => void; // Optional, not used here but good practice
}

export const CustomTextGeneratorPanel: React.FC<CustomTextGeneratorPanelProps> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Por favor, insira um comando para a IA.");
            return;
        }
        setIsGenerating(true);
        setGeneratedText('');
        toast.info("A IA está processando seu pedido...");
        try {
            const result = await generateCustomText(prompt, book);
            setGeneratedText(result);
            toast.success("Texto gerado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar o texto.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        toast.success("Texto copiado para a área de transferência!");
    };
    
    return (
        <Card title="Gerador de Texto Personalizado com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Use o poder da IA para criar qualquer tipo de texto para sua história.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="custom-prompt" className="block text-sm font-medium text-slate-300 mb-1">Seu Comando</label>
                    <textarea 
                        id="custom-prompt" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        placeholder="Ex: Crie um poema sobre o protagonista, escreva um diálogo tenso entre dois personagens, gere a descrição de um item mágico..." 
                        rows={4} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <SparklesIcon className="mr-2 h-5 w-5" /> Gerar Texto
                </Button>
                
                {(isGenerating || generatedText) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Resultado Gerado</h3>
                             {generatedText && (
                                <Button onClick={handleCopyToClipboard} variant="secondary">
                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                                </Button>
                             )}
                        </div>
                        <div className="w-full min-h-[200px] bg-slate-900/50 rounded-md p-3">
                            {isGenerating ? (
                                <div className="flex items-center justify-center h-full">
                                    <Spinner />
                                </div>
                            ) : (
                                <p className="text-slate-300 whitespace-pre-wrap">{generatedText}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};