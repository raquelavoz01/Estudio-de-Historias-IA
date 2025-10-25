import React, { useState } from 'react';
import { Book, ConceptArt } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { SparklesIcon } from '../icons';
import { useToast } from '../../toast';
import { generateConceptArt } from '../../services/geminiService';

interface ConceptArtPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const ConceptArtPanel: React.FC<ConceptArtPanelProps> = ({ book, onUpdate }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt) {
            toast.error("Por favor, descreva a cena para gerar a arte.");
            return;
        }
        setIsGenerating(true);
        try {
            const imageData = await generateConceptArt(prompt, book.coverArtStyle);
            const newArt: ConceptArt = {
                id: crypto.randomUUID(),
                prompt,
                imageData,
            };
            onUpdate({ conceptArt: [...book.conceptArt, newArt] });
            setPrompt('');
            toast.success("Arte conceitual gerada!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar arte conceitual.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <Card title="Galeria de Arte Conceitual">
            <div className="space-y-4">
                <div className="flex space-x-2">
                    <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Descreva a cena, personagem ou objeto..." className="flex-grow bg-slate-700 border-slate-600 rounded-md p-2" />
                    <Button onClick={handleGenerate} isLoading={isGenerating}>
                        <SparklesIcon className="h-5 w-5 mr-2" />Gerar Arte
                    </Button>
                </div>
                <p className="text-xs text-slate-400">A IA usará o "Estilo da Arte da Capa" definido acima para guiar a geração.</p>
                
                {book.conceptArt.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {book.conceptArt.map(art => (
                            <div key={art.id} className="aspect-video bg-slate-700 rounded-md overflow-hidden">
                                <img src={`data:image/jpeg;base64,${art.imageData}`} alt={art.prompt} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-700 rounded-lg">
                        <p>Nenhuma arte conceitual gerada ainda.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
