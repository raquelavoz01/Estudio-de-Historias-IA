import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, actions }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg shadow-md">
            <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
                {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};
