import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../toast';
import { Button } from './common/Button';
import { SparklesIcon } from './icons';

const AuthView: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login, signUp } = useUser();
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simples validação de e-mail
        if (!email.includes('@')) {
            toast.error("Por favor, insira um e-mail válido.");
            return;
        }
        if (isLogin) {
            login(email);
            toast.success("Login realizado com sucesso!");
        } else {
            if (!name.trim()) {
                toast.error("Por favor, insira seu nome.");
                return;
            }
            signUp(email, name);
            toast.success("Conta criada com sucesso! Bem-vindo(a)!");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <SparklesIcon className="h-12 w-12 mx-auto text-cyan-400 mb-4" />
                    <h1 className="text-3xl font-bold">Bem-vindo ao Estúdio de Histórias IA</h1>
                    <p className="text-slate-400 mt-2">
                        {isLogin ? "Entre na sua conta para continuar." : "Crie uma conta para começar a escrever."}
                    </p>
                </div>

                <div className="bg-slate-800/50 p-8 rounded-lg shadow-2xl border border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
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
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-700 text-white rounded-md border-slate-600 p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            {isLogin ? 'Entrar' : 'Criar Conta'}
                        </Button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline">
                        {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;