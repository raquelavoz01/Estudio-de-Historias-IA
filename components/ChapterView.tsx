import React, { useState, useEffect, useRef } from 'react';
import { Book, Chapter, SpeakerConfig } from '../types';
import { generateChapterContent, generateNarration, generateMultiSpeakerNarration } from '../services/geminiService';
import { playAudio, stopAudio } from '../services/audioService';
import { decode } from '../utils/audio';
import { createWavBlob } from '../utils/wav';
import { useToast } from '../toast';
import { Button } from './common/Button';
import { PlayCircleIcon, StopCircleIcon, SparklesIcon, MicrophoneIcon, ArrowDownTrayIcon } from './icons';
import { PomodoroTimer } from './common/PomodoroTimer';
import { useBooks } from '../contexts/BookContext';

interface ChapterViewProps {
    book: Book;
}

const aiVoices = [
    { id: 'Puck', name: 'Puck (Masculino)' },
    { id: 'Kore', name: 'Kore (Feminino)' },
    { id: 'Charon', name: 'Charon (Masculino)' },
    { id: 'Fenrir', name: 'Fenrir (Masculino)' },
    { id: 'Zephyr', name: 'Zephyr (Feminino)' },
];

const narrationTones = [
    "Neutro", "Alegre", "Triste", "Emocional", "Épico", "Sussurrante",
    "Energético", "Calmo", "Misterioso", "Moderno", "Formal", "Antigo"
];

type NarrationMode = 'single' | 'multi';

const ChapterView: React.FC<ChapterViewProps> = ({ book }) => {
    const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Estados da narração
    const [narrationMode, setNarrationMode] = useState<NarrationMode>('single');
    const [speakers, setSpeakers] = useState<SpeakerConfig[]>([]);
    const [newSpeakerName, setNewSpeakerName] = useState('');
    const [newSpeakerVoice, setNewSpeakerVoice] = useState(aiVoices[0].id);
    const [selectedVoice, setSelectedVoice] = useState(aiVoices[0].id);
    const [selectedTone, setSelectedTone] = useState(narrationTones[0]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const toast = useToast();
    const { updateBook } = useBooks();

    const selectedChapter = book.chapters[selectedChapterIndex];

     // Inicializa os narradores com os personagens do livro
    useEffect(() => {
        const initialSpeakers = book.characters.map((char, index) => ({
            name: char.name,
            voice: aiVoices[index % aiVoices.length].id, // Distribui as vozes
        }));
        // Adiciona um narrador padrão
        if (!initialSpeakers.some(s => s.name.toLowerCase() === 'narrador')) {
            initialSpeakers.unshift({ name: 'Narrador', voice: aiVoices[0].id });
        }
        setSpeakers(initialSpeakers);
    }, [book.characters]);

    useEffect(() => {
        return () => {
            stopAudio();
            setIsPlaying(false);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, [selectedChapterIndex]);
    
    const updateChapter = (index: number, updatedChapter: Chapter) => {
        const newChapters = [...book.chapters];
        newChapters[index] = updatedChapter;
        updateBook({ ...book, chapters: newChapters });
    };

    const handleGenerateContent = async () => {
        if (selectedChapter.content && !window.confirm("Este capítulo já tem conteúdo. Deseja substituí-lo? Todo o trabalho não salvo será perdido.")) {
            return;
        }

        setIsGeneratingContent(true);
        toast.info("A IA está escrevendo, isso pode levar alguns minutos...");
        try {
            const content = await generateChapterContent(book, selectedChapterIndex);
            updateChapter(selectedChapterIndex, { ...selectedChapter, content, audioData: null });
            toast.success(`Conteúdo do Capítulo ${selectedChapterIndex + 1} gerado!`);
        } catch (error) {
            console.error(error);
            toast.error(`Falha ao gerar conteúdo para o Capítulo ${selectedChapterIndex + 1}.`);
        } finally {
            setIsGeneratingContent(false);
        }
    };
    
    const handleGenerateAI = async () => {
        if (!selectedChapter.content) return;
        setIsGeneratingAI(true);
        toast.info(`Gerando narração com IA...`);
        try {
            let base64Audio: string;
            if (narrationMode === 'multi') {
                base64Audio = await generateMultiSpeakerNarration(selectedChapter.content, speakers);
            } else {
                base64Audio = await generateNarration(selectedChapter.content, selectedVoice, selectedTone);
            }
            const audioBytes = decode(base64Audio);
            updateChapter(selectedChapterIndex, { ...selectedChapter, audioData: { data: audioBytes } });
            toast.success("Narração por IA gerada!");
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Falha ao gerar narração com IA.";
            toast.error(errorMessage);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleDownloadChapterNarration = () => {
        if (!selectedChapter?.audioData?.data) {
            toast.error("Nenhuma narração gerada para este capítulo.");
            return;
        }
    
        try {
            // Os dados de áudio da IA são PCM brutos de 16 bits
            const pcmData = new Int16Array(selectedChapter.audioData.data.buffer);
            const sampleRate = 24000;
            
            const wavBlob = createWavBlob(pcmData, 1, sampleRate);
            
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const safeChapterTitle = selectedChapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.download = `${safeTitle}_cap${selectedChapterIndex + 1}_${safeChapterTitle}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success("Download da narração do capítulo iniciado!");
    
        } catch (error) {
            console.error("Falha ao criar o arquivo WAV:", error);
            toast.error("Ocorreu um erro ao preparar o arquivo para download.");
        }
    };


    const handleToggleRecording = async () => {
        //... (código inalterado)
    };

    const handleTogglePlayback = () => {
        //... (código inalterado)
    };

    const handleAddSpeaker = () => {
        if (newSpeakerName && !speakers.some(s => s.name === newSpeakerName)) {
            setSpeakers([...speakers, { name: newSpeakerName, voice: newSpeakerVoice }]);
            setNewSpeakerName('');
        } else {
            toast.error("O nome do narrador não pode estar vazio ou ser duplicado.");
        }
    };

    const handleRemoveSpeaker = (name: string) => {
        setSpeakers(speakers.filter(s => s.name !== name));
    };

    if (book.chapters.length === 0) {
        return <p className="text-slate-400">Por favor, gere um esboço primeiro na tela de detalhes do livro.</p>;
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            <nav className="w-full md:w-1/3 md:max-w-xs pr-4 border-r-0 md:border-r border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Capítulos</h2>
                </div>
                <ul className="space-y-2">
                    {book.chapters.map((chapter, index) => (
                        <li key={index}>
                            <button
                                onClick={() => setSelectedChapterIndex(index)}
                                className={`w-full text-left p-2 rounded-md transition-colors ${selectedChapterIndex === index ? 'bg-cyan-800/60' : 'hover:bg-slate-700/50'}`}
                            >
                                <span className="font-semibold">Cap. {index + 1}: {chapter.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex-grow">
                <h3 className="text-2xl font-bold text-cyan-400 mb-1">{selectedChapter.title}</h3>
                <p className="text-slate-400 italic mb-6">{selectedChapter.summary}</p>

                {selectedChapter.content ? (
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                            <h4 className="font-bold text-lg text-white">Ferramentas de Narração</h4>
                             <div className="flex items-center space-x-2 bg-slate-700/50 p-1 rounded-full w-fit">
                                <button onClick={() => setNarrationMode('single')} className={`px-4 py-1 text-sm rounded-full ${narrationMode === 'single' ? 'bg-cyan-600 text-white' : ''}`}>Narração Única</button>
                                <button onClick={() => setNarrationMode('multi')} className={`px-4 py-1 text-sm rounded-full ${narrationMode === 'multi' ? 'bg-cyan-600 text-white' : ''}`}>Múltiplos Narradores</button>
                            </div>

                            {narrationMode === 'single' ? (
                                <div className="flex flex-wrap items-center gap-4">
                                    <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md p-2 text-sm">
                                        {aiVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                    <select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md p-2 text-sm">
                                        {narrationTones.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-400">Defina o elenco da sua história. No editor, use "Nome: texto..." para que a IA use a voz correta.</p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {speakers.map(s => (
                                            <div key={s.name} className="flex items-center gap-2 bg-slate-700/50 p-2 rounded">
                                                <span className="font-semibold flex-grow">{s.name}</span>
                                                <span className="text-xs text-slate-400">{aiVoices.find(v => v.id === s.voice)?.name}</span>
                                                <button onClick={() => handleRemoveSpeaker(s.name)} className="text-red-400 hover:text-red-300">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                                        <input type="text" value={newSpeakerName} onChange={e => setNewSpeakerName(e.target.value)} placeholder="Nome do Narrador" className="bg-slate-700 border-slate-600 rounded-md p-1.5 text-sm flex-grow"/>
                                        <select value={newSpeakerVoice} onChange={e => setNewSpeakerVoice(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md p-1.5 text-sm">
                                            {aiVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                        <Button onClick={handleAddSpeaker} variant="secondary" size="sm">Add</Button>
                                    </div>
                                </div>
                            )}

                             <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700">
                                <Button onClick={handleGenerateAI} isLoading={isGeneratingAI} variant="secondary"><SparklesIcon className="mr-2 h-4 w-4"/>Gerar Narração do Capítulo</Button>
                                <Button onClick={handleToggleRecording} variant={isRecording ? 'danger' : 'secondary'} size="sm">
                                    <MicrophoneIcon className="mr-2 h-4 w-4"/> {isRecording ? 'Parar Gravação' : 'Gravar Manualmente'}
                                </Button>
                             </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 items-center">
                            {selectedChapter.audioData && (
                                <div className="flex items-center gap-4">
                                     <Button onClick={handleTogglePlayback} variant="secondary">
                                        {isPlaying ? <><StopCircleIcon className="mr-2"/> Parar</> : <><PlayCircleIcon className="mr-2"/> Ouvir Narração</>}
                                    </Button>
                                    <Button onClick={handleDownloadChapterNarration} variant="secondary">
                                        <ArrowDownTrayIcon className="mr-2 h-5 w-5"/> Baixar Capítulo
                                    </Button>
                                    <span className="text-sm text-slate-400">
                                        Fonte: {selectedChapter.audioData.mimeType ? 'Sua Gravação' : 'IA Gerada'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-grow min-w-[280px]">
                                <PomodoroTimer />
                            </div>
                        </div>
                        <div className="prose prose-invert max-w-none bg-slate-800/50 p-4 rounded-md mt-4">
                            <textarea 
                                className="w-full h-[60vh] bg-transparent text-slate-300 leading-relaxed border-none focus:ring-0 resize-y p-2"
                                value={selectedChapter.content}
                                onChange={(e) => updateChapter(selectedChapterIndex, {...selectedChapter, content: e.target.value, audioData: null})}
                            />
                        </div>
                    </div>
                ) : (
                    <Button onClick={handleGenerateContent} isLoading={isGeneratingContent}>
                        <SparklesIcon className="mr-2"/> Gerar Conteúdo do Capítulo
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ChapterView;