import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { generateScenarios } from '../../services/geminiService';
import { ClipboardDocumentIcon, GlobeAltIcon } from '../icons';
import { Spinner } from '../common/Spinner';

interface Scenario {
    name: string;
    description: string;
}

export const ScenarioGeneratorPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [generatedScenarios, setGeneratedScenarios] = useState<Scenario[]>([]);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Por favor, descreva o tipo de cenário que você deseja.");
            return;
        }
        setIsLoading(true);
        setGeneratedScenarios([]);
        toast.info("A IA está construindo novos locais para o seu mundo...");
        try {
            const result = await generateScenarios(book, prompt);
            setGeneratedScenarios(result);
            toast.success("Cenários gerados com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao gerar os cenários.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = (scenario: Scenario) => {
        const textToCopy = `Nome: ${scenario.name}\nDescrição: ${scenario.description}`;
        navigator.clipboard.writeText(textToCopy);
        toast.success(`"${scenario.name}" copiado para a área de transferência!`);
    };

    return (
        <Card title="Gerador de Cenários e Locais">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Expanda seu universo. Descreva um tipo de local e a IA criará opções detalhadas para enriquecer sua história.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="scenario-prompt" className="block text-sm font-medium text-slate-300 mb-1">Tipo de Local</label>
                    <input
                        id="scenario-prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Uma taverna movimentada, uma ruína antiga, um mercado exótico..."
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                   <GlobeAltIcon className="mr-2 h-5 w-5" /> Gerar Cenários
                </Button>

                {(isLoading || generatedScenarios.length > 0) && (
                    <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-semibold mb-2">Locais Gerados</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[150px]">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {generatedScenarios.map((scenario, index) => (
                                    <div key={index} className="bg-slate-900/50 rounded-md p-3 relative">
                                        <h4 className="font-bold text-cyan-400">{scenario.name}</h4>
                                        <p className="text-slate-300 whitespace-pre-wrap mt-1 text-sm">{scenario.description}</p>
                                        <button
                                            onClick={() => handleCopyToClipboard(scenario)}
                                            className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors"
                                            aria-label="Copiar cenário"
                                        >
                                            <ClipboardDocumentIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};