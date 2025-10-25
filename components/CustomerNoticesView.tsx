import React, { useState, useRef } from 'react';
import { Button } from './common/Button';
import { useToast } from '../toast';
import { PhotoIcon } from './icons';

const CustomerNoticesView: React.FC = () => {
    const [logo, setLogo] = useState<string | null>(null);
    const [primaryColor, setPrimaryColor] = useState('#4f46e5');
    const [emailSubject, setEmailSubject] = useState('Novo Livro Publicado: {{bookTitle}}');
    const [emailBody, setEmailBody] = useState(
`Olá {{userName}},

Uma nova obra-prima foi adicionada à nossa biblioteca!

"{{bookTitle}}" já está disponível. Mergulhe nesta nova aventura.

Atenciosamente,
O Autor`
    );
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Alterações salvas com sucesso!");
        }, 1500);
    };
    
    const handlePreview = () => {
        // Simple preview alert for now
        alert(`
            Pré-visualização do E-mail:
            ---------------------------
            Cor Principal: ${primaryColor}
            Logo: ${logo ? 'Carregado' : 'Nenhum'}
            ---------------------------
            Assunto: ${emailSubject.replace('{{bookTitle}}', 'O Último Dragão')}
            ---------------------------
            Corpo:
            ${emailBody.replace('{{userName}}', 'Leitor Fiel').replace('{{bookTitle}}', 'O Último Dragão')}
        `);
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-cyan-400 mb-4">Editor de Avisos ao Cliente</h1>
                <p className="text-lg text-slate-300 mb-8">Facilitamos o envio dos e-mails transacionais com a sua marca para os clientes.</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-8">
                {/* Branding Section */}
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-4">Branding</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Logo da Marca</label>
                            <div 
                                onClick={() => logoInputRef.current?.click()}
                                className="mt-1 flex justify-center items-center h-32 px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md cursor-pointer hover:border-cyan-500 bg-slate-900/50"
                            >
                                {logo ? (
                                    <img src={logo} alt="Pré-visualização do Logo" className="max-h-28 object-contain" />
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                                        <p className="text-sm text-slate-400">Clique para carregar</p>
                                    </div>
                                )}
                            </div>
                            <input ref={logoInputRef} onChange={handleLogoUpload} type="file" accept="image/*" className="hidden" />
                        </div>
                        <div>
                             <label htmlFor="primaryColor" className="block text-sm font-medium text-slate-300 mb-1">Cor Principal</label>
                             <div className="flex items-center space-x-2 mt-1">
                                 <input 
                                     type="color" 
                                     id="primaryColor"
                                     value={primaryColor} 
                                     onChange={(e) => setPrimaryColor(e.target.value)} 
                                     className="p-0 h-10 w-10 block bg-slate-700 border border-slate-600 cursor-pointer rounded-md"
                                 />
                                 <input 
                                     type="text"
                                     value={primaryColor}
                                     onChange={(e) => setPrimaryColor(e.target.value)}
                                     className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                 />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Email Template Section */}
                <div className="pt-6 border-t border-slate-700">
                    <h2 className="text-2xl font-semibold text-white mb-4">Template do E-mail</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="emailSubject" className="block text-sm font-medium text-slate-300 mb-1">Assunto do E-mail</label>
                            <input
                                type="text"
                                id="emailSubject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="emailBody" className="block text-sm font-medium text-slate-300 mb-1">Corpo do E-mail</label>
                            <textarea
                                id="emailBody"
                                rows={10}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y font-mono text-sm"
                            />
                             <p className="text-xs text-slate-400 mt-2">Use variáveis como <code>{'{{bookTitle}}'}</code> e <code>{'{{userName}}'}</code> para personalizar.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
                <Button variant="secondary" onClick={handlePreview}>Pré-visualizar</Button>
                <Button onClick={handleSaveChanges} isLoading={isSaving}>Salvar Alterações</Button>
            </div>
        </div>
    );
};

export default CustomerNoticesView;
