import React, { useState } from 'react';
import { Book, World } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { SparklesIcon } from '../icons';
import { useToast } from '../../toast';
import { generateWorld } from '../../services/geminiService';

interface WorldPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const WorldPanel: React.FC<WorldPanelProps> = ({ book, onUpdate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const toast = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const newWorld = await generateWorld(book);
            onUpdate({ world: newWorld });
            toast.success("Mundo gerado com sucesso!");
        } catch (error) {
            toast.error("Falha ao gerar o mundo.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleWorldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({
            world: {
                ...book.world,
                [e.target.name]: e.target.value,
            }
        });
    };

    return (
        <Card title="Cenário / Mundo" actions={<Button onClick={handleGenerate} isLoading={isGenerating}><SparklesIcon className="mr-2 h-4 w-4"/>Gerar com IA</Button>}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="worldName" className="block text-sm font-medium text-slate-300">Nome do Mundo</label>
                    <input type="text" name="name" id="worldName" value={book.world.name} onChange={handleWorldChange} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"/>
                </div>
                <div>
                    <label htmlFor="worldDescription" className="block text-sm font-medium text-slate-300">Descrição do Mundo</label>
                    <textarea name="description" id="worldDescription" value={book.world.description} onChange={handleWorldChange} rows={5} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2 resize-y"/>
                </div>
            </div>
        </Card>
    );
};