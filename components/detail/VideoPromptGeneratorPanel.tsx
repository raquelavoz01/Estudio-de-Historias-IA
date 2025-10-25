import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { ClipboardDocumentIcon, VideoCameraIcon } from '../icons';

const cameraOptions = ["Close-up", "Plano médio", "Plano geral", "Plano aéreo (drone)", "Ponto de vista (POV)", "Câmera lenta", "Travelling"];
const styleOptions = ["Cinematográfico", "Realista", "Animação", "Anime", "Documentário", "Fantasia", "Vaporwave", "Cyberpunk", "Vintage"];
const pacingOptions = ["Câmera lenta", "Ação em ritmo acelerado", "Time-lapse", "Movimento suave e fluido", "Cortes rápidos"];

export const VideoPromptGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [subject, setSubject] = useState('');
    const [camera, setCamera] = useState(cameraOptions[0]);
    const [style, setStyle] = useState(styleOptions[0]);
    const [pacing, setPacing] = useState(pacingOptions[0]);
    const [effects, setEffects] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const toast = useToast();

    const handleGenerate = () => {
        if (!subject.trim()) {
            toast.error("Por favor, descreva o assunto ou a cena principal.");
            return;
        }

        let promptParts = [
            `${subject}`,
            `Direção de Câmera: ${camera}`,
            `Estilo Visual: ${style}`,
            `Ritmo: ${pacing}`,
        ];

        if (effects.trim()) {
            promptParts.push(`Efeitos Especiais: ${effects}`);
        }
        
        const fullPrompt = promptParts.join('. ');
        setGeneratedPrompt(fullPrompt);
        toast.success("Prompt de vídeo gerado com sucesso!");
    };

    const handleCopyToClipboard = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt);
        toast.success("Prompt copiado para a área de transferência!");
    };

    return (
        <Card title="Gerador de Prompts de Vídeo">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Gere prompts de vídeo detalhados usando direção de câmera, estilo, ritmo, efeitos especiais e muito mais.
            </p>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="video-prompt-subject" className="block text-sm font-medium text-slate-300 mb-1">Assunto / Cena Principal</label>
                        <textarea
                            id="video-prompt-subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ex: Um cavaleiro enfrentando um dragão em um castelo em ruínas."
                            rows={4}
                            className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                        />
                    </div>
                     <div>
                        <label htmlFor="video-prompt-effects" className="block text-sm font-medium text-slate-300 mb-1">Efeitos Especiais (Opcional)</label>
                        <textarea
                            id="video-prompt-effects"
                            value={effects}
                            onChange={(e) => setEffects(e.target.value)}
                            placeholder="Ex: Partículas de magia brilhantes, reflexo de lente, chuva forte."
                            rows={4}
                            className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                        />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="video-prompt-camera" className="block text-sm font-medium text-slate-300 mb-1">Direção de Câmera</label>
                        <select id="video-prompt-camera" value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2">
                            {cameraOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="video-prompt-style" className="block text-sm font-medium text-slate-300 mb-1">Estilo de Arte</label>
                        <select id="video-prompt-style" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2">
                            {styleOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="video-prompt-pacing" className="block text-sm font-medium text-slate-300 mb-1">Ritmo</label>
                        <select id="video-prompt-pacing" value={pacing} onChange={(e) => setPacing(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2">
                            {pacingOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                <Button onClick={handleGenerate} className="w-full">
                   <VideoCameraIcon className="mr-2 h-5 w-5" /> Gerar Prompt
                </Button>

                {generatedPrompt && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Prompt Gerado</h3>
                            <Button onClick={handleCopyToClipboard} variant="secondary">
                                <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                            </Button>
                        </div>
                        <div className="w-full bg-slate-900/50 rounded-md p-4">
                            <p className="text-slate-300 whitespace-pre-wrap">{generatedPrompt}</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};