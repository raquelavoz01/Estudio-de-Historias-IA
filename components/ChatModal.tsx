import React, { useState, useEffect, useRef } from 'react';
import { Book, ChatMessage } from '../types';
import { Chat } from '@google/genai';
import { initializeChat, sendChatMessage } from '../services/geminiService';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, book }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const session = initializeChat(book);
            setChatSession(session);
            setMessages([{
                role: 'model',
                text: `Olá! Sou seu assistente de IA. Como posso ajudar a desenvolver a história de "${book.title}" hoje? Você pode me pedir para criar descrições, diálogos, ou até mesmo para debatermos ideias.`
            }]);
        } else {
            setMessages([]);
            setUserInput('');
            setChatSession(null);
        }
    }, [isOpen, book]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatSession) return;

        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const responseText = await sendChatMessage(chatSession, userInput);
            const newModelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, newModelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Desculpe, ocorreu um erro ao me comunicar com a IA. Por favor, tente novamente." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Converse com a IA">
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-800' : 'bg-slate-700'}`}>
                                <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="max-w-lg p-3 rounded-lg bg-slate-700 flex items-center">
                                <Spinner className="h-5 w-5 mr-2" />
                                <span className="text-slate-400">Pensando...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex-shrink-0 p-4 border-t border-slate-700 bg-slate-800">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Peça-me para criar uma descrição para a arte conceitual..."
                            className="w-full h-12 p-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                        <Button type="submit" isLoading={isLoading} disabled={!userInput.trim()} className="h-12">
                            Enviar
                        </Button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};
