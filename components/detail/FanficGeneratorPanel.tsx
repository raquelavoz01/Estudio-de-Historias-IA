import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateFanfic } from '../../services/geminiService';
import { ClipboardDocumentIcon, HeartIcon } from '../icons';
import { Spinner } from '../common/Spinner';

const genres = ["Aventura", "Romance", "Angst", "Comédia", "Drama", "Suspense", "Universo Alternativo"];

export const FanficGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fandom, setFandom] = useState(`O universo de "${book.title}"`);
    const [characters, setCharacters] = useState('');
    const [plot, setPlot] = useState('');
    const [genre, setGenre] = useState(genres[0]);
    const [generatedStory, setGeneratedStory] = useState('');
    const toast = useToast();

    const handleGenerate = async () => {
        if (!fandom.trim() || !characters.trim() || !plot.trim()) {
            toast.error("Por favor, preencha todos os campos para a fanfic.");
            return;
        }
        setIsLoading(true);
        setGeneratedStory('');
        toast.info("A IA está escrevendo sua fanfic...");
        try {
            const result = await generateFanfic(book, fandom, characters, plot, genre);
            setGeneratedStory(result);
            toast.success("Sua fanfic foi gerada!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar a fanfic.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!generatedStory) return;
        navigator.clipboard.writeText(generatedStory);
        toast.success("Fanfic copiada para a área de transferência!");
    };

    return (
        <Card title="Criador de Fanfics com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Crie suas próprias histórias de fanfic com IA. Explore cenários "e se" com seus personagens favoritos ou os de outros universos.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="fanfic-fandom" className="block text-sm font-medium text-slate-300 mb-1">Universo / Fandom</label>
                    <input
                        id="fanfic-fandom"
                        type="text"
                        value={fandom}
                        onChange={(e) => setFandom(e.target.value)}
                        placeholder="Ex: Harry Potter, Star Wars, O universo de..."
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="fanfic-characters" className="block text-sm font-medium text-slate-300 mb-1">Personagens Principais</label>
                    <textarea
                        id="fanfic-characters"
                        value={characters}
                        onChange={(e) => setCharacters(e.target.value)}
                        placeholder="Ex: Personagem A como um herói relutante, Personagem B como seu rival que se torna aliado."
                        rows={2}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                 <div>
                    <label htmlFor="fanfic-plot" className="block text-sm font-medium text-slate-300 mb-1">Enredo / Situação</label>
                    <textarea
                        id="fanfic-plot"
                        value={plot}
                        onChange={(e) => setPlot(e.target.value)}
                        placeholder="Ex: Os personagens ficam presos em uma cabana durante uma nevasca e descobrem um segredo."
                        rows={3}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                 <div>
                    <label htmlFor="fanfic-genre" className="block text-sm font-medium text-slate-300 mb-1">Gênero / Tom</label>
                    <select
                        id="fanfic-genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    >
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <HeartIcon className="mr-2 h-5 w-5" /> Gerar Fanfic
                </Button>

                {(isLoading || generatedStory) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold">Sua História de Fanfic</h3>
                             {generatedStory && (
                                <Button onClick={handleCopyToClipboard} variant="secondary">
                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5" /> Copiar
                                </Button>
                             )}
                        </div>
                        <div className="w-full min-h-[300px] max-h-[60vh] overflow-y-auto bg-slate-900/50 rounded-md p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full min-h-[200px]">
                                    <Spinner />
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                    {generatedStory}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};