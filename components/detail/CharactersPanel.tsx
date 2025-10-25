import React, { useState } from 'react';
import { Book, Character } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateCharacters } from '../../services/geminiService';
import { SparklesIcon } from '../icons';

interface CharactersPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const CharactersPanel: React.FC<CharactersPanelProps> = ({ book, onUpdate }) => {
    const [newChar, setNewChar] = useState<Omit<Character, 'id'>>({ name: '', description: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const toast = useToast();

    const handleAddCharacter = () => {
        if (newChar.name && newChar.description) {
            onUpdate({ characters: [...book.characters, newChar] });
            setNewChar({ name: '', description: '' });
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const newCharacters = await generateCharacters(book);
            onUpdate({ characters: [...book.characters, ...newCharacters] });
            toast.success("Novos personagens sugeridos pela IA!");
        } catch (error) {
            toast.error("Falha ao sugerir personagens.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <Card 
            title="Personagens"
            actions={<Button onClick={handleGenerate} isLoading={isGenerating}><SparklesIcon className="mr-2 h-4 w-4"/>Sugerir com IA</Button>}
        >
            <div className="space-y-4">
                {book.characters.map((char, index) => (
                    <div key={index} className="bg-slate-700/50 p-3 rounded-md">
                        <h3 className="font-bold text-cyan-300">{char.name}</h3>
                        <p className="text-slate-300 text-sm">{char.description}</p>
                    </div>
                ))}
                
                <div className="pt-4 border-t border-slate-700/50 space-y-2">
                    <h3 className="font-semibold">Adicionar Novo Personagem</h3>
                    <input type="text" placeholder="Nome" value={newChar.name} onChange={(e) => setNewChar({...newChar, name: e.target.value})} className="block w-full bg-slate-700 border-slate-600 rounded-md p-2 text-sm" />
                    <textarea placeholder="Descrição" value={newChar.description} onChange={(e) => setNewChar({...newChar, description: e.target.value})} rows={2} className="block w-full bg-slate-700 border-slate-600 rounded-md p-2 text-sm resize-none" />
                    <Button onClick={handleAddCharacter} variant="secondary" className="w-full">Adicionar Personagem</Button>
                </div>
            </div>
        </Card>
    );
};