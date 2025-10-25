import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateMusic } from '../../services/geminiService';
import { MusicalNoteIcon, SparklesIcon } from '../icons';

interface MusicPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

const musicGenres = ["Cinematográfica", "Ambiente", "Eletrônica", "Orquestral", "Lo-fi", "Épica", "Suspense", "Aventura"];

export const MusicPanel: React.FC<MusicPanelProps> = ({ book, onUpdate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [genre, setGenre] = useState(musicGenres[0]);
    const [duration, setDuration] = useState(60);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Por favor, insira uma descrição para a música.");
            return;
        }
        setIsGenerating(true);
        toast.info("Gerando trilha sonora com IA...");
        try {
            // A API real retornaria uma URL ou dados de áudio.
            // Por enquanto, ela vai lançar um erro informativo.
            await generateMusic(prompt, genre, duration);
            
            // Este código só será executado quando a API real for implementada.
            // const newTrack: MusicTrack = {
            //     id: crypto.randomUUID(),
            //     prompt,
            //     genre,
            //     durationInSeconds: duration,
            //     audioUrl: 'url_da_api_aqui'
            // };
            // onUpdate({ musicTracks: [...book.musicTracks, newTrack] });
            // toast.success("Trilha sonora gerada com sucesso!");
            
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Ocorreu um erro desconhecido ao gerar a música.");
            }
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <Card title="Trilha Sonora com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie músicas originais que combinem com a atmosfera da sua história.
            </p>
             <div className="space-y-6">
                <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                     <div>
                        <label htmlFor="music-prompt" className="block text-sm font-medium text-slate-300 mb-1">Descrição da Música</label>
                        <textarea id="music-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Uma melodia de piano melancólica para uma cena de chuva..." rows={3} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="music-genre" className="block text-sm font-medium text-slate-300 mb-1">Gênero</label>
                             <select id="music-genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2">
                                {musicGenres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="music-duration" className="block text-sm font-medium text-slate-300 mb-1">Duração (segundos)</label>
                            <input type="number" id="music-duration" value={duration} onChange={e => setDuration(Math.max(10, Number(e.target.value)))} min="10" max="180" className="w-full bg-slate-700 border-slate-600 rounded-md p-2" />
                        </div>
                    </div>
                    <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
                       <SparklesIcon className="mr-2 h-5 w-5" /> Gerar Música
                    </Button>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Biblioteca de Músicas</h3>
                     <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
                        <MusicalNoteIcon className="mx-auto h-10 w-10 text-slate-500 mb-2"/>
                        <p className="text-slate-400">Nenhuma música foi gerada para este livro ainda.</p>
                        <p className="text-xs text-slate-500 mt-1">As músicas que você criar aparecerão aqui.</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};