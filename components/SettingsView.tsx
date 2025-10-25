import React, { useState } from 'react';
import { Button } from './common/Button';
import { useToast } from '../toast';

const SettingsView: React.FC = () => {
    const [clickjackProtectionEnabled, setClickjackProtectionEnabled] = useState(true);
    const toast = useToast();

    const handleSave = () => {
        // Em um aplicativo real, você enviaria essas configurações para um backend.
        toast.success("Configurações salvas com sucesso!");
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-cyan-400 mb-8">Configurações</h1>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Proteção do site</h2>
                    <p className="text-slate-400 mt-1">Gerencie as configurações de segurança do seu site.</p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-md flex items-center justify-between">
                    <div>
                        <label htmlFor="clickjack-toggle" className="font-medium text-white cursor-pointer">Proteção contra clickjack</label>
                        <p className="text-sm text-slate-400 max-w-md">Impede que sites maliciosos se incorporem no seu conteúdo. Se desativado, outros proprietários de sites podem fazer um iframe do seu conteúdo nas páginas deles.</p>
                    </div>
                    <label htmlFor="clickjack-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="clickjack-toggle"
                            className="sr-only peer"
                            checked={clickjackProtectionEnabled}
                            onChange={() => setClickjackProtectionEnabled(!clickjackProtectionEnabled)}
                        />
                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
                
                <div className="pt-4 border-t border-slate-700 flex flex-col items-start">
                     <Button onClick={handleSave}>
                        Salvar Configurações
                    </Button>
                    <p className="text-xs text-slate-500 mt-4">
                        Nota: A aplicação real da proteção contra clickjacking é configurada no lado do servidor (e.g., com cabeçalhos HTTP <code>X-Frame-Options</code> ou <code>Content-Security-Policy</code>).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
