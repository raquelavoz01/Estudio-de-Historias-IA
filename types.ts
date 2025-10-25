export interface Character {
  name: string;
  description: string;
}

export interface World {
  name: string;
  description: string;
}

export interface Chapter {
  title: string;
  summary: string;
  content: string;
  targetWordCount?: number; // Contagem de palavras desejada
  audioData: {
    data: Uint8Array;
    mimeType?: string; // se indefinido, é PCM bruto da IA. Se definido, é uma gravação do usuário.
  } | null;
}

export interface SpeakerConfig {
  name: string;
  voice: string;
}

export interface ConceptArt {
  id: string;
  prompt: string;
  imageData: string; // Base64 string
}

export interface MusicTrack {
  id: string;
  prompt: string;
  genre: string;
  durationInSeconds: number;
  // audioUrl: string | null; // Será adicionado quando a API estiver disponível
}

export interface SoundEffect {
  id: string;
  prompt: string;
  // audioUrl: string | null; // Será adicionado quando a API estiver disponível
}

export interface Book {
  id: string; // UUID for unique identification
  title: string;
  author: string;
  genre: string;
  coverArtStyle: string;
  description: string;
  tags: string[];
  characters: Character[];
  world: World;
  chapters: Chapter[];
  coverImage: string | null; // Base64 string for the final cover
  coverBackground: string | null; // Base64 for the background layer
  coverForeground: { data: string; mimeType: string; } | null; // Base64 for the foreground layer with mimeType
  logoImage: string | null; // Base64 string for the logo
  conceptArt: ConceptArt[];
  videoUrl: string | null; // URL for the generated video
  conversationalVideoUrl: string | null; // URL for the generated conversational video
  musicTracks: MusicTrack[];
  soundEffects: SoundEffect[];
  brandVoice: string | null; // Texto de amostra para treinar o estilo da IA
}

// Represents the main pages of the application
export type PageView = 'library' | 'bookDetail' | 'pricing' | 'faq' | 'contact' | 'settings' | 'customerNotices' | 'editor';

// Represents the tabs within the book detail view
export type BookDetailViewType = 'conception' | 'outline' | 'chapters' | 'multimedia';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- Novos tipos para Autenticação e Assinaturas ---

export type SubscriptionPlan = 'free' | 'writer' | 'architect' | 'master';

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: SubscriptionPlan;
}