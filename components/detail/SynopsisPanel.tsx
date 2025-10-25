import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { SparklesIcon } from '../icons';
import { useToast } from '../../toast';
import { generateDescriptionAndTags } from '../../services/geminiService';

interface DescriptionPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const DescriptionPanel: React.FC<DescriptionPanelProps> = ({ book, onUpdate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [newTag, setNewTag] = useState('');
    const toast = useToast();
    
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const { description, tags } = await generateDescriptionAndTags(book);
            onUpdate({ description, tags });
            toast.success("Descrição e tags geradas com sucesso!");
        } catch (error) {
            toast.error("Falha ao gerar descrição e tags.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddTag = () => {
        if (newTag && !book.tags.includes(newTag)) {
            onUpdate({ tags: [...book.tags, newTag] });
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onUpdate({ tags: book.tags.filter(tag => tag !== tagToRemove) });
    };

    return (
        <Card title="Descrição e Tags" actions={<Button onClick={handleGenerate} isLoading={isGenerating}><SparklesIcon className="mr-2 h-4 w-4"/>Gerar com IA</Button>}>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300">Descrição (para o público)</label>
                    <textarea name="description" id="description" value={book.description} onChange={(e) => onUpdate({description: e.target.value})} rows={6} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2 resize-y"/>
                </div>
                 <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-slate-300">Tags (Palavras-chave)</label>
                    <div className="mt-1 flex space-x-2">
                        <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTag()} className="flex-grow bg-slate-700 border-slate-600 rounded-md p-2 sm:text-sm" placeholder="Ex: Fantasia, Aventura"/>
                        <Button onClick={handleAddTag} variant="secondary">Adicionar</Button>
                    </div>
                     <div className="mt-2 flex flex-wrap gap-2">
                        {book.tags.map(tag => (
                            <span key={tag} className="flex items-center bg-cyan-800/50 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-cyan-200 hover:text-white">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};