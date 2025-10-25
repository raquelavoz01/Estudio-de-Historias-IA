import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { SubscriptionPlan } from '../types';
import { CheckoutButton } from './common/CheckoutButton';
import { useToast } from '../../toast';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

// =================================================================================
// IMPORTANTE: Substitua estes IDs de placeholder pelos seus IDs de Preço de PRODUÇÃO
// que você criou no seu Painel Stripe.
// =================================================================================
const priceIds = {
    monthly: {
        writer: 'price_1SLrDpC20dVkUbxZvb2RHW4q',
        architect: 'price_1SLvsQC20dVkUbxZVgYiWguG',
        master: 'price_1SLrKtC20dVkUbxZbLCSu5Rc',
    },
    annual: {
        writer: 'price_1SLvtSC20dVkUbxZD6xOe7aQ',
        architect: 'price_1SLrJIC20dVkUbxZOMXwAcn3',
        master: 'price_1SLvpoC20dVkUbxZ7aUhb8bS',
    }
};

const PricingView: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const { user } = useUser();
    const toast = useToast();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('payment_cancelled')) {
            toast.info("A compra foi cancelada. Você pode tentar novamente a qualquer momento.");
            // Limpa a URL para que a mensagem não apareça novamente ao atualizar
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [toast]);

    const plans = {
        monthly: [
            { 
                id: 'writer' as SubscriptionPlan,
                name: 'Escritor', 
                price: 'R$ 39', 
                priceId: priceIds.monthly.writer,
                popular: false, 
                description: 'Para o autor que está começando. As ferramentas essenciais para transformar ideias em histórias estruturadas.',
                featureGroups: [
                    {
                        title: 'Essencial da Escrita',
                        features: [
                            'Até 5 livros na biblioteca',
                            'Geração de Conceito (Ideia, Música)',
                            'Geração de Personagens e Mundo',
                            'Geração de Esboço de Capítulos',
                            'Geração de Conteúdo de Capítulo (até 40.000 palavras/mês)',
                            'Corretor Gramatical e Resumidor',
                        ]
                    },
                    {
                        title: 'Ferramentas de Suporte',
                        features: [
                            'Editor de Formato Longo',
                            'Assistente de Chat com IA (contexto do livro)',
                            'Backup (Importar/Exportar)',
                        ]
                    }
                ],
            },
            { 
                id: 'architect' as SubscriptionPlan,
                name: 'Arquiteto', 
                price: 'R$ 79', 
                priceId: priceIds.monthly.architect,
                popular: true, 
                description: 'Para o autor dedicado. Construa universos ricos, profissionalize sua escrita e comece a divulgar seu trabalho.',
                featureGroups: [
                     {
                        title: 'Tudo do plano Escritor, e mais:',
                        features: [
                            'Livros Ilimitados',
                            'Geração de Palavras Ilimitada',
                            'Voz da Marca com IA (Treine a IA com seu estilo)',
                            'Ferramentas Avançadas de Escrita (Reescritor, Humanizador)',
                        ]
                    },
                    {
                        title: 'Ferramentas Visuais e de Áudio',
                        features: [
                            'Gerador de Capas com IA',
                            'Galeria de Arte Conceitual',
                            'Narração de Áudio com IA (Vozes Padrão)',
                        ]
                    },
                    {
                        title: 'Marketing e SEO',
                        features: [
                            'Gerador de Artigos SEO',
                            'Gerador de Legendas (Instagram, Facebook)',
                            'Fluxo de Postagem de Blog com IA',
                        ]
                    }
                ],
            },
            { 
                id: 'master' as SubscriptionPlan,
                name: 'Mestre', 
                price: 'R$ 129', 
                priceId: priceIds.monthly.master,
                popular: false, 
                description: 'A suíte completa para o autor-empreendedor. Domine a criação, o marketing e a produção de multimídia.',
                 featureGroups: [
                     {
                        title: 'Tudo do plano Arquiteto, e mais:',
                        features: [
                            'Ferramenta de IA Mágica (Crie suas próprias ferramentas)',
                            'Acesso Antecipado a novas funcionalidades',
                            'Suporte Prioritário',
                        ]
                    },
                    {
                        title: 'Produção Multimídia Avançada',
                        features: [
                            'Gerador de Vídeo-Trailer com IA (Veo)',
                            'Gerador de Vídeo de Conversa com IA (Veo)',
                            'Gerador de Prompt de Vídeo',
                        ]
                    },
                    {
                        title: 'Marketing de Conteúdo Completo',
                        features: [
                           'Gerador de Campanhas de Marketing Completas',
                           'Gerador de Títulos, Descrições e Ideias para YouTube',
                           'Gerador de Página "Sobre Nós"',
                           'Criador de Fanfics com IA',
                        ]
                    }
                ],
            },
        ],
        annual: [
             { 
                id: 'writer' as SubscriptionPlan,
                name: 'Escritor', 
                price: 'R$ 390', 
                priceId: priceIds.annual.writer,
                popular: false, 
                description: 'Para o autor que está começando. As ferramentas essenciais para transformar ideias em histórias estruturadas.',
                featureGroups: [
                    {
                        title: 'Essencial da Escrita',
                        features: [
                            'Até 5 livros na biblioteca',
                            'Geração de Conceito (Ideia, Música)',
                            'Geração de Personagens e Mundo',
                            'Geração de Esboço de Capítulos',
                            'Geração de Conteúdo de Capítulo (até 40.000 palavras/mês)',
                            'Corretor Gramatical e Resumidor',
                        ]
                    },
                    {
                        title: 'Ferramentas de Suporte',
                        features: [
                            'Editor de Formato Longo',
                            'Assistente de Chat com IA (contexto do livro)',
                            'Backup (Importar/Exportar)',
                        ]
                    }
                ],
            },
            { 
                id: 'architect' as SubscriptionPlan,
                name: 'Arquiteto', 
                price: 'R$ 790', 
                priceId: priceIds.annual.architect,
                popular: true, 
                description: 'Para o autor dedicado. Construa universos ricos, profissionalize sua escrita e comece a divulgar seu trabalho.',
                 featureGroups: [
                     {
                        title: 'Tudo do plano Escritor, e mais:',
                        features: [
                            'Livros Ilimitados',
                            'Geração de Palavras Ilimitada',
                            'Voz da Marca com IA (Treine a IA com seu estilo)',
                            'Ferramentas Avançadas de Escrita (Reescritor, Humanizador)',
                        ]
                    },
                    {
                        title: 'Ferramentas Visuais e de Áudio',
                        features: [
                            'Gerador de Capas com IA',
                            'Galeria de Arte Conceitual',
                            'Narração de Áudio com IA (Vozes Padrão)',
                        ]
                    },
                    {
                        title: 'Marketing e SEO',
                        features: [
                            'Gerador de Artigos SEO',
                            'Gerador de Legendas (Instagram, Facebook)',
                            'Fluxo de Postagem de Blog com IA',
                        ]
                    }
                ],
            },
            { 
                id: 'master' as SubscriptionPlan,
                name: 'Mestre', 
                price: 'R$ 1290', 
                priceId: priceIds.annual.master,
                popular: false, 
                description: 'A suíte completa para o autor-empreendedor. Domine a criação, o marketing e a produção de multimídia.',
                 featureGroups: [
                     {
                        title: 'Tudo do plano Arquiteto, e mais:',
                        features: [
                            'Ferramenta de IA Mágica (Crie suas próprias ferramentas)',
                            'Acesso Antecipado a novas funcionalidades',
                            'Suporte Prioritário',
                        ]
                    },
                    {
                        title: 'Produção Multimídia Avançada',
                        features: [
                            'Gerador de Vídeo-Trailer com IA (Veo)',
                            'Gerador de Vídeo de Conversa com IA (Veo)',
                            'Gerador de Prompt de Vídeo',
                        ]
                    },
                    {
                        title: 'Marketing de Conteúdo Completo',
                        features: [
                           'Gerador de Campanhas de Marketing Completas',
                           'Gerador de Títulos, Descrições e Ideias para YouTube',
                           'Gerador de Página "Sobre Nós"',
                           'Criador de Fanfics com IA',
                        ]
                    }
                ],
            },
        ]
    };

    const currentPlans = plans[billingCycle];

    return (
        <div className="py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-cyan-400 sm:text-5xl">Escolha o Plano Perfeito para Sua Jornada Criativa</h1>
                    <p className="mt-4 text-xl text-slate-300">Do primeiro rascunho à obra-prima narrada, temos o plano ideal para cada etapa da sua história.</p>
                    <p className="mt-2 text-sm text-slate-400">Todos os planos são assinaturas, sem contrato de fidelidade. Cancele quando quiser.</p>
                </div>

                <div className="mt-10 flex justify-center items-center">
                    <div className="bg-slate-800 p-1 rounded-full flex items-center space-x-1">
                        <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${billingCycle === 'monthly' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Mensal</button>
                        <button onClick={() => setBillingCycle('annual')} className={`px-6 py-2 text-sm font-medium rounded-full transition-colors relative ${billingCycle === 'annual' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            Anual
                             <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Economize 2 meses!</span>
                        </button>
                    </div>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                    {currentPlans.map(plan => (
                        <div key={plan.name} className={`relative flex flex-col bg-slate-800/50 border ${user?.subscriptionPlan === plan.id ? 'border-cyan-500 ring-2 ring-cyan-500/50' : 'border-slate-700'} rounded-2xl shadow-lg p-6`}>
                            {plan.popular && user?.subscriptionPlan !== plan.id && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">O Mais Popular</span>}
                            {user?.subscriptionPlan === plan.id && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Plano Atual</span>}
                            
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold text-white text-center">{plan.name}</h3>
                                <div className="mt-4 text-center">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-base font-medium text-slate-400">/ {billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
                                </div>
                                <p className="mt-4 text-slate-300 text-center text-sm h-20">{plan.description}</p>

                                <div className="mt-6 space-y-5">
                                    {plan.featureGroups.map(group => (
                                        <div key={group.title}>
                                            <h4 className="font-semibold text-cyan-300 text-sm mb-2">{group.title}</h4>
                                            <ul className="space-y-3">
                                                {group.features.map(feature => (
                                                    <li key={feature} className="flex items-start">
                                                        <div className="flex-shrink-0 mt-1">
                                                            <CheckIcon />
                                                        </div>
                                                        <p className="ml-3 text-slate-300 text-sm">{feature}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <CheckoutButton 
                                    priceId={plan.priceId}
                                    planName={plan.name}
                                    variant={plan.popular ? 'primary' : 'secondary'}
                                    isCurrentPlan={user?.subscriptionPlan === plan.id}
                                    planId={plan.id}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingView;
