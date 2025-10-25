import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateSeoArticle } from '../../services/geminiService';
import { ClipboardDocumentIcon, DocumentMagnifyingGlassIcon } from '../icons';
import { Spinner } from '../common/Spinner';

interface SeoArticleGeneratorPanelProps {
    book: Book;
}

export const SeoArticleGeneratorPanel: React.FC<SeoArticleGeneratorPanelProps> = ({ book }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [generatedArticle, setGeneratedArticle] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!keyword.trim()) {
            toast.error("Por favor, insira um tópico ou palavra-chave para o artigo.");
            return;
        }
        setIsGenerating(true);
        setGeneratedArticle('');
        toast.info("A IA está escrevendo seu artigo otimizado para SEO...");
        try {
            const result = await generateSeoArticle(book, keyword);
            setGeneratedArticle(result);
            toast.success("Artigo gerado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar o artigo.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!generatedArticle) return;
        navigator.clipboard.writeText(generatedArticle);
        toast.success("Artigo copiado para a área de transferência!");
    };
    
    return (
        <Card title="Gerador de Artigos SEO com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie um artigo de blog sobre seu livro com um clique, otimizado para mecanismos de busca.
            </p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="seo-keyword" className="block text-sm font-medium text-slate-300 mb-1">Tópico ou Palavra-chave Principal</label>
                    <input 
                        id="seo-keyword" 
                        type="text"
                        value={keyword} 
                        onChange={(e) => setKeyword(e.target.value)} 
                        placeholder="Ex: o desenvolvimento do protagonista, o sistema de magia, a rivalidade principal..." 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                   <DocumentMagnifyingGlassIcon className="mr-2 h-5 w-5" /> Gerar Artigo com Um Clique
                </Button>
                
                {(isGenerating || generatedArticle) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Resultado Gerado</h3>
                             {generatedArticle && (
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
                                    {generatedArticle}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};