import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateSeoKeywords } from '../../services/geminiService';
import { ClipboardDocumentIcon, HashtagIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const SeoKeywordsGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            toast.error("Por favor, insira o texto a ser analisado.");
            return;
        }
        setIsLoading(true);
        setGeneratedKeywords([]);
        toast.info("A IA está analisando seu texto para extrair palavras-chave...");
        try {
            const result = await generateSeoKeywords(book, inputText);
            setGeneratedKeywords(result);
            toast.success("Palavras-chave geradas com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar as palavras-chave.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyAll = () => {
        if (generatedKeywords.length === 0) return;
        const keywordsString = generatedKeywords.join(', ');
        navigator.clipboard.writeText(keywordsString);
        toast.success("Todas as palavras-chave copiadas!");
    };

    return (
        <Card title="Gerador de Palavras-chave SEO">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Cole seu texto e a IA extrairá palavras-chave relevantes para aumentar o SEO e a relevância do conteúdo.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="seo-keyword-input" className="block text-sm font-medium text-slate-300 mb-1">Texto de Entrada</label>
                    <textarea
                        id="seo-keyword-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Cole a descrição do seu livro, um capítulo ou qualquer texto relevante aqui..."
                        rows={6}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <HashtagIcon className="mr-2 h-5 w-5" /> Gerar Palavras-chave
                </Button>

                {(isLoading || generatedKeywords.length > 0) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Palavras-chave Sugeridas</h3>
                             {generatedKeywords.length > 0 && (
                                <Button onClick={handleCopyAll} variant="secondary">
                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar Todas
                                </Button>
                             )}
                        </div>
                        <div className="w-full min-h-[100px] bg-slate-900/50 rounded-md p-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full min-h-[100px]">
                                    <Spinner />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {generatedKeywords.map((keyword, index) => (
                                        <span key={index} className="bg-cyan-800/50 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};