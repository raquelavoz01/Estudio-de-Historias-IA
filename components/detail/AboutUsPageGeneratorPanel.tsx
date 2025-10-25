
import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateAboutUsPage } from '../../services/geminiService';
import { ClipboardDocumentIcon, IdentificationIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const AboutUsPageGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedContent('');
        toast.info("A IA está criando sua página 'Sobre Nós'...");
        try {
            const result = await generateAboutUsPage(book);
            setGeneratedContent(result);
            toast.success("Página 'Sobre Nós' gerada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar a página 'Sobre Nós'.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!generatedContent) return;
        navigator.clipboard.writeText(generatedContent);
        toast.success("Conteúdo copiado para a área de transferência!");
    };
    
    return (
        <Card title="Gerador de Página Sobre Nós">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie uma página "Sobre Nós" profissional para seu site de autor, contando sua história e conectando-se com seus leitores.
            </p>
             <div className="space-y-4">
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <IdentificationIcon className="mr-2 h-5 w-5" /> Gerar Página com Um Clique
                </Button>
                
                {(isGenerating || generatedContent) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Resultado Gerado</h3>
                             {generatedContent && (
                                <Button onClick={handleCopyToClipboard} variant="secondary">
                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                                </Button>
                             )}
                        </div>
                        <div className="w-full min-h-[300px] max-h-[60vh] overflow-y-auto bg-slate-900/50 rounded-md p-4">
                            {isGenerating ? (
                                <div className="flex items-center justify-center h-full min-h-[200px]">
                                    <Spinner />
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                    {generatedContent}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
