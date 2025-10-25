import React, { useCallback, useState } from 'react';
import { Book, PageView } from '../types';
import { BookMetadataPanel } from './detail/BookMetadataPanel';
import { CoverArtPanel } from './detail/CoverArtPanel';
import { DescriptionPanel } from './detail/SynopsisPanel';
import { CharactersPanel } from './detail/CharactersPanel';
import { WorldPanel } from './detail/WorldPanel';
import { BrandVoicePanel } from './detail/BrandVoicePanel';
import { CustomTextGeneratorPanel } from './detail/CustomTextGeneratorPanel';
import { SeoArticleGeneratorPanel } from './detail/SeoArticleGeneratorPanel';
import { MagicToolPanel } from './detail/MagicToolPanel';
import { ConceptArtPanel } from './detail/ConceptArtPanel';
import { OutlinePanel } from './detail/OutlinePanel';
import { VideoPanel } from './detail/VideoPanel';
import ChapterView from './ChapterView';
import { ChatBubbleOvalLeftEllipsisIcon, PencilSquareIcon, SparklesIcon, BookOpenIcon, QueueListIcon, MegaphoneIcon } from './icons';
import { ChatModal } from './ChatModal';
import { ConversationalVideoPanel } from './detail/ConversationalVideoPanel';
import { MusicPanel } from './detail/MusicPanel';
import { SoundEffectsPanel } from './detail/SoundEffectsPanel';
import { BlogPostWorkflowPanel } from './detail/BlogPostWorkflowPanel';
import { InstagramCaptionPanel } from './detail/InstagramCaptionPanel';
import { Button } from './common/Button';
import { ParagraphWriterPanel } from './detail/ParagraphWriterPanel';
import { ParagraphRewriterPanel } from './detail/ParagraphRewriterPanel';
import { AiTextHumanizerPanel } from './detail/AiTextHumanizerPanel';
import { SeoMetaGeneratorPanel } from './detail/SeoMetaGeneratorPanel';
import { SeoKeywordsGeneratorPanel } from './detail/SeoKeywordsGeneratorPanel';
import { FacebookPostGeneratorPanel } from './detail/FacebookPostGeneratorPanel';
import { AboutUsPageGeneratorPanel } from './detail/AboutUsPageGeneratorPanel';
import { ContentSummarizerPanel } from './detail/ContentSummarizerPanel';
import { GrammarCorrectorPanel } from './detail/GrammarCorrectorPanel';
import { MarketingCampaignGeneratorPanel } from './detail/MarketingCampaignGeneratorPanel';
import { YouTubeTitleGeneratorPanel } from './detail/YouTubeTitleGeneratorPanel';
import { YouTubeDescriptionGeneratorPanel } from './detail/YouTubeDescriptionGeneratorPanel';
import { YouTubeVideoIdeasPanel } from './detail/YouTubeVideoIdeasPanel';
import { FanficGeneratorPanel } from './detail/FanficGeneratorPanel';
import { VideoPromptGeneratorPanel } from './detail/VideoPromptGeneratorPanel';
import { ScenarioGeneratorPanel } from './detail/ScenarioGeneratorPanel';
import { LogoGeneratorPanel } from './detail/LogoGeneratorPanel';
import { useBooks } from '../contexts/BookContext';
import { ManuscriptAnalyzerPanel } from './detail/ManuscriptAnalyzerPanel';

interface BookDetailViewProps {
    book: Book;
    onNavigate: (page: PageView) => void;
}

type ActiveTab = 'conception' | 'structure' | 'writingTools' | 'multimedia';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center text-center px-4 py-3 font-semibold border-b-2 transition-all duration-300 w-full md:w-auto
      ${isActive
        ? 'border-cyan-400 text-cyan-400'
        : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
      }`}
  >
    {icon}
    {label}
  </button>
);


export const BookDetailView: React.FC<BookDetailViewProps> = ({ book, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('conception');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { updateBook } = useBooks();
    
    const handlePartialUpdate = useCallback((update: Partial<Book>) => {
        updateBook({ ...book, ...update });
    }, [book, updateBook]);
    
    const renderContent = () => {
        switch (activeTab) {
            case 'conception':
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-8">
                            <BookMetadataPanel book={book} onUpdate={handlePartialUpdate} />
                            <CoverArtPanel book={book} onUpdate={handlePartialUpdate} />
                        </div>
                        <div className="lg:col-span-2 space-y-8">
                            <DescriptionPanel book={book} onUpdate={handlePartialUpdate} />
                            <CharactersPanel book={book} onUpdate={handlePartialUpdate} />
                            <WorldPanel book={book} onUpdate={handlePartialUpdate} />
                             <ScenarioGeneratorPanel book={book} />
                        </div>
                    </div>
                );
            case 'structure':
                return (
                    <div className="space-y-8">
                        <OutlinePanel book={book} onUpdate={handlePartialUpdate} />
                        <div className="pt-8 border-t border-slate-800">
                             <ChapterView book={book} />
                        </div>
                    </div>
                );
            case 'writingTools':
                 return (
                    <div className="space-y-8">
                        <BrandVoicePanel book={book} onUpdate={handlePartialUpdate} />
                        <CustomTextGeneratorPanel book={book} />
                        <ParagraphWriterPanel book={book} />
                        <ParagraphRewriterPanel book={book} />
                        <AiTextHumanizerPanel book={book} />
                        <ContentSummarizerPanel book={book} />
                        <GrammarCorrectorPanel book={book} />
                        <ManuscriptAnalyzerPanel book={book} />
                        <MagicToolPanel book={book} />
                        <FanficGeneratorPanel book={book} />
                    </div>
                );
            case 'multimedia':
                return (
                    <div className="space-y-8">
                        <LogoGeneratorPanel book={book} onUpdate={handlePartialUpdate} />
                        <BlogPostWorkflowPanel book={book} />
                        <InstagramCaptionPanel book={book} />
                        <FacebookPostGeneratorPanel book={book} />
                        <AboutUsPageGeneratorPanel book={book} />
                        <MarketingCampaignGeneratorPanel book={book} />
                        <SeoArticleGeneratorPanel book={book} />
                        <SeoMetaGeneratorPanel book={book} />
                        <SeoKeywordsGeneratorPanel book={book} />
                        <YouTubeVideoIdeasPanel book={book} />
                        <YouTubeTitleGeneratorPanel book={book} />
                        <YouTubeDescriptionGeneratorPanel book={book} />
                        <ConceptArtPanel book={book} onUpdate={handlePartialUpdate} />
                        <VideoPromptGeneratorPanel book={book} />
                        <VideoPanel book={book} onUpdate={handlePartialUpdate} />
                        <ConversationalVideoPanel book={book} onUpdate={handlePartialUpdate} />
                        <MusicPanel book={book} onUpdate={handlePartialUpdate} />
                        <SoundEffectsPanel book={book} onUpdate={handlePartialUpdate} />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <>
            <div className="space-y-8">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-700 pb-4">
                    <h1 className="text-3xl font-bold text-cyan-400">{book.title}</h1>
                    <Button onClick={() => onNavigate('editor')}>
                        <PencilSquareIcon className="h-5 w-5 mr-2" />
                        Abrir no Editor de Formato Longo
                    </Button>
                </div>
                
                 {/* Abas de Navegação */}
                <div className="border-b border-slate-700 -mt-4">
                    <nav className="flex flex-col md:flex-row -mb-px">
                        <TabButton label="Concepção" isActive={activeTab === 'conception'} onClick={() => setActiveTab('conception')} icon={<BookOpenIcon className="mr-2 h-5 w-5"/>} />
                        <TabButton label="Estrutura e Capítulos" isActive={activeTab === 'structure'} onClick={() => setActiveTab('structure')} icon={<QueueListIcon className="mr-2 h-5 w-5"/>} />
                        <TabButton label="Ferramentas de Escrita" isActive={activeTab === 'writingTools'} onClick={() => setActiveTab('writingTools')} icon={<SparklesIcon className="mr-2 h-5 w-5"/>}/>
                        <TabButton label="Marketing e Multimídia" isActive={activeTab === 'multimedia'} onClick={() => setActiveTab('multimedia')} icon={<MegaphoneIcon className="mr-2 h-5 w-5"/>}/>
                    </nav>
                </div>

                <div className="mt-6">
                    {renderContent()}
                </div>

            </div>
            
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-8 right-8 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 z-30"
                aria-label="Converse com a IA"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
            </button>

            <ChatModal 
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                book={book}
            />
        </>
    );
};

export default BookDetailView;