import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateBlogPostTitles, generateBlogPostOutline, generateFullBlogPost } from '../../services/geminiService';
import { ClipboardDocumentIcon, ClipboardDocumentListIcon } from '../icons';
import { Spinner } from '../common/Spinner';

type WorkflowStep = 'start' | 'titles' | 'outline' | 'content' | 'finished';

export const BlogPostWorkflowPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [step, setStep] = useState<WorkflowStep>('start');
    const [topic, setTopic] = useState('');
    const [titleOptions, setTitleOptions] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [outline, setOutline] = useState<string[]>([]);
    const [finalPost, setFinalPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleStart = async () => {
        if (!topic.trim()) {
            toast.error("Por favor, insira um tópico para a postagem do blog.");
            return;
        }
        setIsLoading(true);
        try {
            const titles = await generateBlogPostTitles(book, topic);
            setTitleOptions(titles);
            setStep('titles');
            toast.success("Títulos gerados! Escolha o seu favorito.");
        } catch (error) {
            toast.error("Não foi possível gerar os títulos.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTitle = async (title: string) => {
        setSelectedTitle(title);
        setIsLoading(true);
        try {
            const generatedOutline = await generateBlogPostOutline(book, topic, title);
            setOutline(generatedOutline);
            setStep('outline');
            toast.success("Esboço gerado! Revise e aprove.");
        } catch (error) {
            toast.error("Não foi possível gerar o esboço.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePost = async () => {
        setIsLoading(true);
        try {
            const fullPost = await generateFullBlogPost(book, selectedTitle, outline);
            setFinalPost(fullPost);
            setStep('finished');
            toast.success("Sua postagem de blog está pronta!");
        } catch (error) {
            toast.error("Não foi possível gerar a postagem do blog.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setStep('start');
        setTopic('');
        setTitleOptions([]);
        setSelectedTitle('');
        setOutline([]);
        setFinalPost('');
        setIsLoading(false);
    };

    const handleCopyToClipboard = () => {
        if (!finalPost) return;
        navigator.clipboard.writeText(finalPost);
        toast.success("Postagem copiada para a área de transferência!");
    };

    const renderStep = () => {
        switch (step) {
            case 'start':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="blog-topic" className="block text-sm font-medium text-slate-300 mb-1">Etapa 1: Tópico ou Palavra-chave</label>
                            <input id="blog-topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: o sistema de magia do livro..." className="w-full bg-slate-700 border-slate-600 rounded-md p-2" />
                        </div>
                        <Button onClick={handleStart} isLoading={isLoading} className="w-full">
                            Gerar Títulos
                        </Button>
                    </div>
                );
            
            case 'titles':
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">Etapa 2: Escolha o Melhor Título</h3>
                        <div className="space-y-2">
                            {titleOptions.map((title, index) => (
                                <button key={index} onClick={() => handleSelectTitle(title)} className="w-full text-left p-3 bg-slate-700 hover:bg-cyan-800/60 rounded-md transition-colors">
                                    {title}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'outline':
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">Etapa 3: Revise e Aprove o Esboço</h3>
                        <div className="p-3 bg-slate-900/50 rounded-md space-y-2">
                            <p className="font-bold text-cyan-400">{selectedTitle}</p>
                            <ul className="list-disc list-inside text-slate-300">
                                {outline.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                        <Button onClick={handleGeneratePost} isLoading={isLoading} className="w-full">
                            Gerar Postagem Completa
                        </Button>
                    </div>
                );
            
            case 'finished':
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">Etapa 4: Sua Postagem de Blog está Pronta!</h3>
                        <div className="w-full min-h-[300px] max-h-[60vh] overflow-y-auto bg-slate-900/50 rounded-md p-4">
                            <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                {finalPost}
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleCopyToClipboard} variant="secondary" className="flex-grow">
                                <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                            </Button>
                            <Button onClick={handleReset} variant="secondary" className="flex-grow">
                                Começar de Novo
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Card title="Fluxo de Postagem de Blog com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Siga as etapas para gerar uma postagem de blog completa sobre seu livro, do título ao texto final.
            </p>
            {isLoading && (step === 'titles' || step === 'outline' || step === 'finished') ? (
                 <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                    <Spinner />
                    <p className="mt-2 text-slate-400">
                        {step === 'titles' && 'Gerando opções de título...'}
                        {step === 'outline' && 'Criando o esboço...'}
                        {step === 'finished' && 'Escrevendo a postagem completa...'}
                    </p>
                </div>
            ) : renderStep()}
        </Card>
    );
};