import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { MegaphoneIcon } from '../icons';

interface BrandVoicePanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const BrandVoicePanel: React.FC<BrandVoicePanelProps> = ({ book, onUpdate }) => {
    const [trainingText, setTrainingText] = useState(book.brandVoice || '');
    const toast = useToast();

    const handleTrain = () => {
        if (trainingText.trim().length < 100) { // Pequena validação
            toast.error("Por favor, forneça um texto de amostra mais longo para melhores resultados.");
            return;
        }
        onUpdate({ brandVoice: trainingText });
        toast.success("Voz da Marca atualizada! A IA agora usará este estilo como referência.");
    };

    const statusText = book.brandVoice ? "Treinado" : "Não treinado";
    const statusColor = book.brandVoice ? "text-green-400" : "text-yellow-400";
    
    return (
        <Card title="Voz da Marca com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Ensine a IA a escrever como você. Cole uma amostra do seu texto e todas as gerações de conteúdo seguirão seu estilo.
            </p>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="brand-voice-text" className="block text-sm font-medium text-slate-300">Seu Texto de Amostra</label>
                        <span className={`text-sm font-semibold ${statusColor}`}>Status: {statusText}</span>
                    </div>
                    <textarea 
                        id="brand-voice-text" 
                        value={trainingText} 
                        onChange={(e) => setTrainingText(e.target.value)} 
                        placeholder="Cole aqui um exemplo do seu texto (recomendamos pelo menos 500 palavras) para que a IA aprenda seu estilo." 
                        rows={8} 
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 resize-y"
                    />
                </div>
                <Button onClick={handleTrain} className="w-full">
                   <MegaphoneIcon className="mr-2 h-5 w-5" /> Treinar IA com este Estilo
                </Button>
            </div>
        </Card>
    );
};