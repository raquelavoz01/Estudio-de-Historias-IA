import React from 'react';
import { SparklesIcon } from './icons';
import { Spinner } from './common/Spinner';

const SplashScreen: React.FC = () => {
    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center font-sans">
            <div className="flex items-center text-3xl font-bold mb-4">
                <SparklesIcon className="h-12 w-12 text-cyan-400 mr-3" />
                <h1>Estúdio de Histórias IA</h1>
            </div>
            <Spinner className="h-8 w-8" />
            <p className="mt-4 text-slate-400">Carregando seu universo criativo...</p>
        </div>
    );
};

export default SplashScreen;