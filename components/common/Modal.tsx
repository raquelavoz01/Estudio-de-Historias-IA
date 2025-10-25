import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl h-full max-h-[85vh] flex flex-col border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};
