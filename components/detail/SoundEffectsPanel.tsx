import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateSoundEffect } from '../../services/geminiService';
import { SparklesIcon, SpeakerWaveIcon } from '../icons';

interface SoundEffectsPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const SoundEffectsPanel: React.FC<SoundEffectsPanelProps> = ({ book, onUpdate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Por favor, descreva o efeito sonoro que você deseja criar.");
            return;
        }
        setIsGenerating(true);
        toast.info("Gerando efeito sonoro com IA...");
        try {
            // A API real retornaria uma URL ou dados de áudio.
            // Por enquanto, ela vai lançar um erro informativo.
            await generateSoundEffect(prompt);
            
            // Este código só será executado quando a API real for implementada.
            // const newEffect: SoundEffect = {
            //     id: crypto.randomUUID(),
            //     prompt,
            //     audioUrl: 'url_da_api_aqui'
            // };
            // onUpdate({ soundEffects: [...book.soundEffects, newEffect] });
            // toast.success("Efeito sonoro gerado com sucesso!");
            
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Ocorreu um erro desconhecido ao gerar o efeito sonoro.");
            }
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <Card title="Efeitos Sonoros com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie efeitos sonoros únicos para dar vida a momentos específicos da sua história.
            </p>
             <div className="space-y-6">
                <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                     <div>
                        <label htmlFor="sfx-prompt" className="block text-sm font-medium text-slate-300 mb-1">Descrição do Efeito Sonoro</label>
                        <textarea id="sfx-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Passos em uma floresta, chuva leve, porta rangendo..." rows={3} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"/>
                    </div>
                    <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                       <SparklesIcon className="mr-2 h-5 w-5" /> Gerar Efeito Sonoro
                    </Button>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Biblioteca de Efeitos Sonoros</h3>
                     <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
                        <SpeakerWaveIcon className="mx-auto h-10 w-10 text-slate-500 mb-2"/>
                        <p className="text-slate-400">Nenhum efeito sonoro foi gerado para este livro ainda.</p>
                        <p className="text-xs text-slate-500 mt-1">Os sons que você criar aparecerão aqui.</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};