import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateMarketingCoreMessage, generateMarketingCampaignAssets } from '../../services/geminiService';
import { ClipboardDocumentIcon, BullhornIcon } from '../icons';
import { Spinner } from '../common/Spinner';

type WorkflowStep = 'start' | 'slogans' | 'assets';

interface CampaignAssets {
    emailTemplate: { subject: string; body: string; };
    socialMediaPosts: { platform: string; content: string; }[];
    blogPostIdeas: string[];
    videoScript: string;
}

export const MarketingCampaignGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [step, setStep] = useState<WorkflowStep>('start');
    const [goal, setGoal] = useState('');
    const [audience, setAudience] = useState('');
    const [coreMessage, setCoreMessage] = useState('');
    const [sloganOptions, setSloganOptions] = useState<string[]>([]);
    const [selectedSlogan, setSelectedSlogan] = useState('');
    const [assets, setAssets] = useState<CampaignAssets | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleStart = async () => {
        if (!goal.trim() || !audience.trim()) {
            toast.error("Por favor, defina o objetivo e o público-alvo da campanha.");
            return;
        }
        setIsLoading(true);
        try {
            const { coreMessage, slogans } = await generateMarketingCoreMessage(book, goal, audience);
            setCoreMessage(coreMessage);
            setSloganOptions(slogans);
            setStep('slogans');
            toast.success("Estratégia inicial definida! Escolha um slogan.");
        } catch (error) {
            toast.error("Não foi possível gerar a estratégia de campanha.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSlogan = async (slogan: string) => {
        setSelectedSlogan(slogan);
        setIsLoading(true);
        try {
            const generatedAssets = await generateMarketingCampaignAssets(book, goal, audience, slogan);
            setAssets(generatedAssets);
            setStep('assets');
            toast.success("Seu kit de marketing está pronto!");
        } catch (error) {
            toast.error("Não foi possível gerar os ativos de marketing.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setStep('start');
        setGoal('');
        setAudience('');
        setCoreMessage('');
        setSloganOptions([]);
        setSelectedSlogan('');
        setAssets(null);
        setIsLoading(false);
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência!");
    };

    const renderStep = () => {
        if (isLoading) {
            return (
                 <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                    <Spinner />
                    <p className="mt-2 text-slate-400">
                        {step === 'start' && 'Criando estratégia de campanha...'}
                        {step === 'slogans' && 'Gerando todos os ativos de marketing...'}
                    </p>
                </div>
            );
        }

        switch (step) {
            case 'start':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="campaign-goal" className="block text-sm font-medium text-slate-300 mb-1">Etapa 1: Objetivo da Campanha</label>
                            <input id="campaign-goal" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex: Lançamento do Livro, Promoção de Pré-venda..." className="w-full bg-slate-700 border-slate-600 rounded-md p-2" />
                        </div>
                        <div>
                            <label htmlFor="target-audience" className="block text-sm font-medium text-slate-300 mb-1">Etapa 2: Público-Alvo</label>
                            <textarea id="target-audience" value={audience} onChange={(e) => setAudience(e.target.value)} rows={3} placeholder="Ex: Fãs de fantasia épica com protagonistas femininas fortes, 18-35 anos..." className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y" />
                        </div>
                        <Button onClick={handleStart} isLoading={isLoading} className="w-full">
                            Definir Estratégia e Gerar Slogans
                        </Button>
                    </div>
                );
            
            case 'slogans':
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">Etapa 3: Escolha o Slogan da Campanha</h3>
                        <div className="p-3 bg-slate-900/50 rounded-md">
                            <p className="text-sm font-bold text-cyan-400">Mensagem Central</p>
                            <p className="text-slate-300">{coreMessage}</p>
                        </div>
                        <div className="space-y-2">
                            {sloganOptions.map((slogan, index) => (
                                <button key={index} onClick={() => handleSelectSlogan(slogan)} className="w-full text-left p-3 bg-slate-700 hover:bg-cyan-800/60 rounded-md transition-colors">
                                    {slogan}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'assets':
                return assets && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-white">Etapa 4: Seus Ativos de Marketing</h3>
                             <Button onClick={handleReset} variant="secondary">Começar de Novo</Button>
                        </div>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Email */}
                            <div className="bg-slate-900/50 rounded-md p-3">
                                <h4 className="font-bold text-cyan-400 mb-2">Template de E-mail</h4>
                                <p className="text-sm font-semibold">Assunto: {assets.emailTemplate.subject}</p>
                                <hr className="border-slate-700 my-2"/>
                                <p className="text-slate-300 whitespace-pre-wrap text-sm">{assets.emailTemplate.body}</p>
                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleCopyToClipboard(`Assunto: ${assets.emailTemplate.subject}\n\n${assets.emailTemplate.body}`)}><ClipboardDocumentIcon className="h-4 w-4 mr-1"/> Copiar E-mail</Button>
                            </div>
                             {/* Social Media */}
                            {assets.socialMediaPosts.map((post, index) => (
                                <div key={index} className="bg-slate-900/50 rounded-md p-3">
                                    <h4 className="font-bold text-cyan-400 mb-2">Post para {post.platform}</h4>
                                    <p className="text-slate-300 whitespace-pre-wrap text-sm">{post.content}</p>
                                    <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleCopyToClipboard(post.content)}><ClipboardDocumentIcon className="h-4 w-4 mr-1"/> Copiar Post</Button>
                                </div>
                            ))}
                             {/* Blog Ideas */}
                             <div className="bg-slate-900/50 rounded-md p-3">
                                <h4 className="font-bold text-cyan-400 mb-2">Ideias para Blog</h4>
                                <ul className="list-disc list-inside text-slate-300 text-sm">
                                    {assets.blogPostIdeas.map((idea, index) => <li key={index}>{idea}</li>)}
                                </ul>
                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleCopyToClipboard(assets.blogPostIdeas.join('\n'))}><ClipboardDocumentIcon className="h-4 w-4 mr-1"/> Copiar Ideias</Button>
                            </div>
                            {/* Video Script */}
                            <div className="bg-slate-900/50 rounded-md p-3">
                                <h4 className="font-bold text-cyan-400 mb-2">Roteiro de Vídeo Curto</h4>
                                <p className="text-slate-300 whitespace-pre-wrap text-sm">{assets.videoScript}</p>
                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleCopyToClipboard(assets.videoScript)}><ClipboardDocumentIcon className="h-4 w-4 mr-1"/> Copiar Roteiro</Button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Card title="Gerador de Campanhas de Marketing com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie campanhas de marketing personalizadas e adaptadas ao seu público-alvo e aos seus objetivos.
            </p>
            {renderStep()}
        </Card>
    );
};