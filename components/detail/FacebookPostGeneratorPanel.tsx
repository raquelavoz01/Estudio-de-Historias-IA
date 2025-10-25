import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateFacebookPosts } from '../../services/geminiService';
import { ClipboardDocumentIcon, ChatBubbleLeftRightIcon } from '../icons';
import { Spinner } from '../common/Spinner';

const tones = ["Misterioso", "Animado", "Inspirador", "Engraçado", "Épico", "Romântico", "Informativo"];

export const FacebookPostGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [postDescription, setPostDescription] = useState('');
    const [tone, setTone] = useState(tones[0]);
    const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!postDescription.trim()) {
            toast.error("Por favor, descreva o conteúdo da sua postagem.");
            return;
        }
        setIsLoading(true);
        setGeneratedPosts([]);
        toast.info("A IA está criando suas postagens para o Facebook...");
        try {
            const result = await generateFacebookPosts(book, postDescription, tone);
            setGeneratedPosts(result);
            toast.success("Postagens geradas com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar as postagens.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Postagem copiada para a área de transferência!");
    };

    return (
        <Card title="Gerador de Postagens para Facebook">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie facilmente postagens exclusivas e de alta qualidade para sua página do Facebook com apenas um clique.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="fb-post-description" className="block text-sm font-medium text-slate-300 mb-1">Sobre o que é a postagem?</label>
                    <textarea
                        id="fb-post-description"
                        value={postDescription}
                        onChange={(e) => setPostDescription(e.target.value)}
                        placeholder="Ex: Anúncio da capa do livro, uma citação do personagem principal, bastidores da escrita..."
                        rows={3}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <div>
                    <label htmlFor="fb-caption-tone" className="block text-sm font-medium text-slate-300 mb-1">Qual o tom da postagem?</label>
                    <select
                        id="fb-caption-tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    >
                        {tones.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5" /> Gerar Postagens
                </Button>

                {(isLoading || generatedPosts.length > 0) && (
                    <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-semibold mb-2">Opções Geradas</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[150px]">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {generatedPosts.map((post, index) => (
                                    <div key={index} className="bg-slate-900/50 rounded-md p-3 pr-12 relative">
                                        <p className="text-slate-300 whitespace-pre-wrap">{post}</p>
                                        <button
                                            onClick={() => handleCopyToClipboard(post)}
                                            className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors"
                                            aria-label="Copiar postagem"
                                        >
                                            <ClipboardDocumentIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};