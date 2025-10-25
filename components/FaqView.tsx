import React from 'react';

const FaqView: React.FC = () => {
    return (
        <div className="py-8 px-4">
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-cyan-400 mb-4">Perguntas Frequentes (FAQ)</h1>
                <p className="text-lg text-slate-300 mb-10">Encontre respostas para as dúvidas mais comuns sobre o Estúdio de Histórias IA.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h2 className="font-semibold text-xl text-white mb-2">Como a IA gera o conteúdo dos capítulos?</h2>
                    <p className="text-slate-300 leading-relaxed">Nossa IA utiliza o modelo Gemini Pro do Google. Ela analisa o gênero, sinopse, personagens e o esboço que você criou para escrever capítulos que sejam consistentes com a sua visão, mantendo o tom e o estilo da sua história.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h2 className="font-semibold text-xl text-white mb-2">Posso editar o conteúdo gerado pela IA?</h2>
                    <p className="text-slate-300 leading-relaxed">Com certeza! O conteúdo gerado é um ponto de partida. Você tem total controle para editar, reescrever ou adicionar qualquer texto no editor de capítulos. O conteúdo só é salvo quando você o aprova.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h2 className="font-semibold text-xl text-white mb-2">A narração de áudio funciona com qualquer personagem?</h2>
                    <p className="text-slate-300 leading-relaxed">Sim. Ao criar um personagem, você associa uma das vozes pré-definidas a ele. Ao gerar a narração, a IA identifica os diálogos de cada personagem e utiliza a voz correspondente, além de uma voz padrão para o narrador.</p>
                </div>
                 <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h2 className="font-semibold text-xl text-white mb-2">Meus livros e dados estão seguros?</h2>
                    <p className="text-slate-300 leading-relaxed">Sim. Todos os seus dados são salvos localmente no seu navegador usando o localStorage. Nada é enviado para nossos servidores, exceto as solicitações para a API do Gemini. Você pode e deve usar as funções de Exportar/Importar para fazer backups regulares do seu trabalho.</p>
                </div>
            </div>
        </div>
    );
};

export default FaqView;