import React, { useState } from 'react';
import { Button } from './common/Button';
import { useToast } from '../toast';

const ContactForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }
        setIsSubmitting(true);
        
        // Simula o envio de uma API
        setTimeout(() => {
            toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
            setName('');
            setEmail('');
            setMessage('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-cyan-400 mb-4">Formulário de Contato</h1>
                <p className="text-lg text-slate-300 mb-8">Tem alguma dúvida, sugestão ou feedback? Adoraríamos ouvir de você!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-slate-800/50 p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Seu Nome</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="João Silva"
                        className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Seu E-mail</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@exemplo.com"
                        className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                 <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">Sua Mensagem</label>
                    <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Deixe sua mensagem aqui..."
                        className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"
                    />
                </div>
                <div>
                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Enviar Mensagem
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
