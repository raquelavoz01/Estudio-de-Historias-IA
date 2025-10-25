import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateSeoTitleAndMeta } from '../../services/geminiService';
import { ClipboardDocumentIcon, MagnifyingGlassCircleIcon } from '../icons';
import { Spinner } from '../common/Spinner';

export const SeoMetaGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
    const [generatedMeta, setGeneratedMeta] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!keyword.trim()) {
            toast.error("Por favor, insira um tópico ou palavra-chave principal.");
            return;
        }
        setIsLoading(true);
        setGeneratedTitles([]);
        setGeneratedMeta('');
        toast.info("A IA está otimizando para os mecanismos de busca...");
        try {
            const result = await generateSeoTitleAndMeta(book, keyword);
            setGeneratedTitles(result.titles);
            setGeneratedMeta(result.metaDescription);
            toast.success("Títulos e meta descrição gerados!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar os dados de SEO.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência!");
    };

    return (
        <Card title="Gerador de Título e Meta Descrição SEO">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Coloque seu livro no topo dos mecanismos de busca com títulos e descrições otimizados.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="seo-meta-keyword" className="block text-sm font-medium text-slate-300 mb-1">Palavra-chave Principal</label>
                    <input
                        id="seo-meta-keyword"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Ex: livro de fantasia épica, romance de ficção científica..."
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <MagnifyingGlassCircleIcon className="mr-2 h-5 w-5" /> Gerar Título e Descrição
                </Button>

                {(isLoading || generatedTitles.length > 0) && (
                    <div className="pt-4 border-t border-slate-700 space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[200px]">
                                <Spinner />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Títulos Sugeridos (SEO)</h3>
                                    <div className="space-y-2">
                                        {generatedTitles.map((title, index) => (
                                            <div key={index} className="bg-slate-900/50 rounded-md p-3 pr-12 relative flex items-center">
                                                <p className="text-slate-300 flex-grow">{title}</p>
                                                <button
                                                    onClick={() => handleCopyToClipboard(title)}
                                                    className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors"
                                                    aria-label="Copiar título"
                                                >
                                                    <ClipboardDocumentIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                     <h3 className="text-lg font-semibold mb-2">Meta Descrição Sugerida (SEO)</h3>
                                      <div className="bg-slate-900/50 rounded-md p-3 pr-12 relative">
                                        <p className="text-slate-300 whitespace-pre-wrap">{generatedMeta}</p>
                                        <button
                                            onClick={() => handleCopyToClipboard(generatedMeta)}
                                            className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors"
                                            aria-label="Copiar meta descrição"
                                        >
                                            <ClipboardDocumentIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};