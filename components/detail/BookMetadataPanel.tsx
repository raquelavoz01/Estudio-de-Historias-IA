import React from 'react';
import { Book } from '../../types';
import { Card } from './Card';

interface BookMetadataPanelProps {
    book: Book;
    onUpdate: (update: Partial<Book>) => void;
}

export const BookMetadataPanel: React.FC<BookMetadataPanelProps> = ({ book, onUpdate }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onUpdate({ [e.target.name]: e.target.value });
    };

    const genres = [
        "Aventura",
        "Ciberpunk",
        "Comédia",
        "Contos de Fadas",
        "Distopia",
        "Drama",
        "Épico",
        "Fantasia",
        "Ficção Científica",
        "Histórica",
        "Infanto Juvenil",
        "Jovem Adulto (YA)",
        "Mistério",
        "Paranormal",
        "Policial",
        "Pós-Apocalíptico",
        "Romance",
        "Sátira",
        "Steampunk",
        "Suspense",
        "Suspense Sobrenatural",
        "Terror",
        "Urbano",
    ];

    return (
        <Card title="Metadados do Livro">
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300">Título</label>
                    <input type="text" name="title" id="title" value={book.title} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"/>
                </div>
                 <div>
                    <label htmlFor="author" className="block text-sm font-medium text-slate-300">Autor</label>
                    <input type="text" name="author" id="author" value={book.author} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"/>
                </div>
                 <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-slate-300">Gênero / Estilo de Escrita</label>
                    <select name="genre" id="genre" value={book.genre} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2">
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="coverArtStyle" className="block text-sm font-medium text-slate-300">Estilo da Arte da Capa</label>
                    <textarea name="coverArtStyle" id="coverArtStyle" value={book.coverArtStyle} onChange={handleChange} rows={3} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2 resize-none" placeholder="Descreva o estilo visual..."/>
                </div>
            </div>
        </Card>
    );
};