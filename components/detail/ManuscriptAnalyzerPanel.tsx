import React, { useState } from 'react';
import { Book } from '../../types';
import { Card } from './Card';
import { Button } from '../common/Button';
import { useToast } from '../../toast';
import { analyzeManuscript } from '../../services/geminiService';
import { DocumentMagnifyingGlassIcon } from '../icons';
import { Spinner } from '../common/Spinner';

interface AnalysisResult {
    summary: string;
    strengths: string[];
    improvements: string[];
    repeatedWords: { word: string; count: number; }[];
}

export const ManuscriptAnalyzerPanel: React.FC<{ book: Book }> = ({ book }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const toast = useToast();

    const handleAnalyze = async () => {
        const fullText = book.chapters.map(c => c.content).join('\n\n');
        if (fullText.trim().length < 200) { // arbitrary length check
            toast.error("O manuscrito é muito curto para uma análise significativa. Escreva mais conteúdo nos capítulos.");
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);
        toast.info("A IA está analisando seu manuscrito completo. Isso pode levar alguns minutos...");
        try {
            const result = await analyzeManuscript(fullText, book);
            setAnalysisResult(result);
            toast.success("Análise do manuscrito concluída!");
        } catch (error) {
            console.error(error);
            toast.error("Falha ao analisar o manuscrito.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Analisador de Manuscrito com IA">
            <p className="text-sm text-slate-400 mb-4 -mt-3">
                Obtenha um feedback editorial completo sobre sua história, identificando pontos fortes, áreas para melhoria e muito mais.
            </p>
             <div className="space-y-4">
                <Button onClick={handleAnalyze} isLoading={isLoading} className="w-full">
                   <DocumentMagnifyingGlassIcon className="mr-2 h-5 w-5" /> Analisar Manuscrito Completo
                </Button>
                
                {isLoading && (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <Spinner />
                    </div>
                )}
                
                {analysisResult && !isLoading && (
                    <div className="pt-4 border-t border-slate-700 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Resumo Geral</h3>
                            <p className="text-slate-300 bg-slate-900/50 p-3 rounded-md">{analysisResult.summary}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-green-400 mb-2">Pontos Fortes</h3>
                                <ul className="list-disc list-inside space-y-2 text-slate-300">
                                    {analysisResult.strengths.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Áreas para Melhoria</h3>
                                <ul className="list-disc list-inside space-y-2 text-slate-300">
                                    {analysisResult.improvements.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-orange-400 mb-2">Palavras Mais Repetidas</h3>
                             <div className="flex flex-wrap gap-2">
                                {analysisResult.repeatedWords.map((item, index) => (
                                    <div key={index} className="bg-slate-700/50 text-slate-300 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                                        <span>{item.word}</span>
                                        <span className="text-xs bg-slate-800/50 text-slate-400 rounded-full px-1.5 py-0.5">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
