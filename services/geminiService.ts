import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Book, Chapter, Character, World, SpeakerConfig } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const conceptionFromSongSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'Um título de livro criativo e evocativo inspirado na essência da música.' },
        description: { type: Type.STRING, description: 'Uma descrição de história original e atraente com cerca de 150-200 palavras, para potenciais leitores, baseada nos temas e emoções da música. NÃO deve citar diretamente nenhuma frase da letra nem revelar o final.' },
        genre: { type: Type.STRING, description: 'O gênero literário mais adequado para a história (ex: Fantasia, Ficção Científica, Romance, etc.).' },
        tags: {
            type: Type.ARRAY,
            description: 'Uma lista de 5 a 7 palavras-chave ou tags relevantes que categorizam a história.',
            items: { type: Type.STRING },
        },
    },
    required: ['title', 'description', 'genre', 'tags'],
};


const worldSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Um nome evocativo e criativo para o mundo ou cenário da história.' },
        description: { type: Type.STRING, description: 'Uma descrição rica e detalhada do cenário, atmosfera e elementos-chave do mundo, com cerca de 100-150 palavras.' },
    },
    required: ['name', 'description'],
};

const charactersSchema = {
    type: Type.ARRAY,
    description: 'Uma lista de 2 a 3 personagens principais interessantes com base no conceito da história.',
    items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Nome completo do personagem.' },
          description: { type: Type.STRING, description: 'Uma descrição concisa da aparência, personalidade, motivações e papel do personagem na história.' },
        },
        required: ['name', 'description'],
    },
};

const scenariosSchema = {
    type: Type.ARRAY,
    description: 'Uma lista de 3 a 5 cenários ou locais detalhados com base na solicitação do usuário.',
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'Um nome criativo e evocativo para o local.' },
            description: { type: Type.STRING, description: 'Uma descrição vívida do local (cerca de 100-150 palavras), incluindo atmosfera, características notáveis e possíveis pontos de interesse para a trama.' },
        },
        required: ['name', 'description'],
    },
};

const outlineSchema = (chapterCount: number) => ({
    type: Type.ARRAY,
    description: `Um esboço de ${chapterCount} capítulos.`,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'O título do capítulo.' },
            summary: { type: Type.STRING, description: 'Um resumo de uma frase dos principais eventos do capítulo.' },
        },
        required: ['title', 'summary'],
    },
});

const descriptionTagsSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: 'Uma descrição de livro reescrita e aprimorada, com cerca de 150 palavras, focada em atrair leitores sem revelar o final.' },
        tags: {
            type: Type.ARRAY,
            description: 'Uma lista de 5 a 7 palavras-chave ou tags relevantes que categorizam a história.',
            items: { type: Type.STRING },
        },
    },
    required: ['description', 'tags'],
};

const blogPostTitlesSchema = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            description: 'Uma lista de 5 títulos de postagem de blog.',
            items: { type: Type.STRING },
        },
    },
    required: ['titles'],
};

const blogPostOutlineSchema = {
    type: Type.OBJECT,
    properties: {
        outline: {
            type: Type.ARRAY,
            description: 'Uma lista de 4 a 6 títulos de seção para o esboço da postagem do blog.',
            items: { type: Type.STRING },
        },
    },
    required: ['outline'],
};

const instagramCaptionsSchema = {
    type: Type.OBJECT,
    properties: {
        captions: {
            type: Type.ARRAY,
            description: 'Uma lista de 3 a 5 legendas para postagem do Instagram.',
            items: { type: Type.STRING },
        },
    },
    required: ['captions'],
};

const facebookPostsSchema = {
    type: Type.OBJECT,
    properties: {
        posts: {
            type: Type.ARRAY,
            description: 'Uma lista de 3 a 5 postagens para o Facebook.',
            items: { type: Type.STRING },
        },
    },
    required: ['posts'],
};


const seoTitleMetaSchema = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            description: 'Uma lista de 3 a 5 títulos otimizados para SEO, cada um com menos de 60 caracteres.',
            items: { type: Type.STRING },
        },
        metaDescription: {
            type: Type.STRING,
            description: 'Uma meta descrição atraente e otimizada para SEO, com menos de 160 caracteres.'
        },
    },
    required: ['titles', 'metaDescription'],
};

const seoKeywordsSchema = {
    type: Type.OBJECT,
    properties: {
        keywords: {
            type: Type.ARRAY,
            description: 'Uma lista de 10 a 15 palavras-chave de SEO relevantes, incluindo termos de cauda curta e longa.',
            items: { type: Type.STRING },
        },
    },
    required: ['keywords'],
};

const marketingCoreMessageSchema = {
    type: Type.OBJECT,
    properties: {
        coreMessage: {
            type: Type.STRING,
            description: 'Uma mensagem de marketing central e concisa (1-2 frases) que resume a proposta de valor da campanha.',
        },
        slogans: {
            type: Type.ARRAY,
            description: 'Uma lista de 3 a 5 slogans curtos e cativantes para a campanha.',
            items: { type: Type.STRING },
        },
    },
    required: ['coreMessage', 'slogans'],
};

const marketingAssetsSchema = {
    type: Type.OBJECT,
    properties: {
        emailTemplate: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING, description: 'O assunto do e-mail de anúncio.' },
                body: { type: Type.STRING, description: 'O corpo completo do e-mail de anúncio, com placeholders como [Nome do Leitor].' },
            },
            required: ['subject', 'body'],
        },
        socialMediaPosts: {
            type: Type.ARRAY,
            description: 'Uma lista de 3 postagens para redes sociais, adaptadas para diferentes plataformas.',
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, description: 'A plataforma de rede social (ex: Instagram, Facebook, Twitter/X).' },
                    content: { type: Type.STRING, description: 'O conteúdo da postagem, incluindo texto e hashtags relevantes.' },
                },
                required: ['platform', 'content'],
            },
        },
        blogPostIdeas: {
            type: Type.ARRAY,
            description: 'Uma lista de 2 a 3 ideias de títulos para postagens de blog que apoiam a campanha.',
            items: { type: Type.STRING },
        },
        videoScript: {
            type: Type.STRING,
            description: 'Um roteiro curto (30-60 segundos) para um vídeo promocional (ex: Reels, Shorts, TikTok).',
        },
    },
    required: ['emailTemplate', 'socialMediaPosts', 'blogPostIdeas', 'videoScript'],
};

const youtubeTitlesSchema = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            description: 'Uma lista de 5 a 7 títulos de vídeo para o YouTube, cativantes e otimizados para SEO.',
            items: { type: Type.STRING },
        },
    },
    required: ['titles'],
};

const youtubeVideoIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            description: 'Uma lista de 5 a 7 ideias de vídeo para o YouTube, criativas e envolventes.',
            items: { type: Type.STRING },
        },
    },
    required: ['ideas'],
};

const manuscriptAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: 'Um resumo geral do tom, estilo e principais temas do manuscrito. Inclua uma breve análise de sentimento.'
        },
        strengths: {
            type: Type.ARRAY,
            description: 'Uma lista de 3 a 5 pontos fortes da escrita, como desenvolvimento de personagens, construção de mundo, ritmo ou diálogos.',
            items: { type: Type.STRING },
        },
        improvements: {
            type: Type.ARRAY,
            description: 'Uma lista de 3 a 5 sugestões construtivas para melhoria, apontando áreas como clichês, inconsistências no enredo, ritmo lento ou diálogos fracos.',
            items: { type: Type.STRING },
        },
        repeatedWords: {
            type: Type.ARRAY,
            description: 'Uma lista das 10 palavras (não-comuns/stop words) mais repetidas que podem ser excessivamente usadas, junto com sua contagem.',
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                },
                required: ['word', 'count'],
            },
        },
    },
    required: ['summary', 'strengths', 'improvements', 'repeatedWords'],
};


// Helper para adicionar a Voz da Marca aos prompts
const addBrandVoiceToPrompt = (prompt: string, brandVoice: string | null): string => {
    if (brandVoice) {
        return `${prompt}\n
## DIRETRIZES DE ESTILO (VOZ DA MARCA) ##
Adote o seguinte estilo de escrita, tom e voz do autor. Analise o texto de exemplo abaixo e aplique um estilo similar em sua resposta.

### EXEMPLO DE ESCRITA ###
${brandVoice}
##########################`;
    }
    return prompt;
};

export async function generateConceptionFromSong(lyrics: string): Promise<Partial<Book>> {
    const prompt = `
        Você é um escritor criativo e um analista de música especialista. Sua tarefa é ler a letra de uma música e extrair sua essência narrativa para criar um conceito de livro completamente novo e original.

        ## DIRETRIZES IMPORTANTES ##
        1.  **Análise Profunda:** Leia a letra e identifique os temas centrais, a jornada emocional, os personagens implícitos e o cenário.
        2.  **Foco na Descrição:** A "descrição" deve ser um texto de marketing para atrair leitores. Deve apresentar o protagonista, o conflito e criar mistério, mas **NÃO PODE REVELAR O FINAL** ou reviravoltas importantes.
        3.  **PROIBIÇÃO DE CITAÇÃO:** É CRUCIAL que você **NÃO USE OU CITE DIRETAMENTE NENHUMA FRASE OU VERSO DA LETRA DA MÚSICA** na descrição. A descrição deve ser 100% original, apenas inspirada pela música.
        4.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**. A gramática e a ortografia devem ser impecáveis.
        5.  **Criação do Conceito:** Com base na sua análise, gere um título de livro, uma descrição original, um gênero e tags relevantes.

        ## LETRA DA MÚSICA PARA ANÁLISE ##
        ${lyrics}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: conceptionFromSongSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}


export async function generateWorld(book: Book): Promise<World> {
    const prompt = `
        Você é um criador de mundos mestre. Com base no seguinte conceito de livro, gere um nome e uma descrição para o mundo em que a história se passa.
        **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**. A gramática e a ortografia devem ser impecáveis.

        ## DADOS DO LIVRO ##
        Título Provisório: ${book.title}
        Gênero: ${book.genre}
        Descrição: ${book.description}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: worldSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}


export async function generateCharacters(book: Book): Promise<Character[]> {
    const prompt = `
        Você é um desenvolvedor de personagens especialista. Com base no seguinte conceito de livro, gere uma lista de 2 a 3 personagens principais.
        **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**. A gramática e a ortografia devem ser impecáveis.

        ## DADOS DO LIVRO ##
        Título: ${book.title}
        Gênero: ${book.genre}
        Descrição: ${book.description}
        Mundo: ${book.world.name}
        Personagens existentes (se houver, não os repita): ${book.characters.map(c => c.name).join(', ')}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: charactersSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}

export async function generateDescriptionAndTags(book: Book): Promise<{description: string, tags: string[]}> {
    let prompt = `
        Você é um especialista em marketing editorial. Com base no seguinte conceito de livro, gere uma descrição de livro aprimorada e uma lista de tags relevantes.
        
        ## DIRETRIZES PARA A DESCRIÇÃO ##
        1.  **Objetivo:** Atrair leitores e despertar curiosidade.
        2.  **Conteúdo:** Apresente o protagonista, o conflito principal e crie tensão.
        3.  **PROIBIÇÃO DE SPOILERS:** NÃO REVELE o final ou reviravoltas importantes da trama.
        4.  **Tamanho:** Mantenha a descrição concisa, com cerca de 150 palavras.
        5.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**. A gramática e a ortografia devem ser impecáveis.

        ## DADOS DO LIVRO ##
        Título: ${book.title}
        Gênero: ${book.genre}
        Conceito Original: ${book.description}
        Personagens: ${book.characters.map(c => c.name).join(', ')}
        Mundo: ${book.world.name}
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: descriptionTagsSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}


export async function generateBookOutline(conception: Book, chapterCount: number, targetWordCount: number): Promise<Chapter[]> {
    const prompt = `
        Com base no seguinte conceito de história, crie um esboço detalhado de ${chapterCount} capítulos. Para cada capítulo, forneça um título e um resumo de uma frase.
        **Idioma e Ortografia:** Todo o texto gerado DEVE estar exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
        
        ## DADOS DA HISTÓRIA ##
        Título: ${conception.title}
        Descrição: ${conception.description}
        Personagens: ${conception.characters.map(c => `${c.name}: ${c.description}`).join(', ')}
        Mundo: ${conception.world.name}

        A saída deve ser um array de objetos JSON.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: outlineSchema(chapterCount),
        },
    });
    const jsonString = response.text.trim();
    const parsedChapters: Omit<Chapter, 'content' | 'audioData' | 'targetWordCount'>[] = JSON.parse(jsonString);

    return parsedChapters.map(ch => ({
        ...ch,
        content: '',
        audioData: null,
        targetWordCount: targetWordCount,
    }));
}


export async function generateChapterContent(book: Book, chapterIndex: number): Promise<string> {
    const chapter = book.chapters[chapterIndex];
    const previousChaptersContext = book.chapters.slice(0, chapterIndex)
        .map((c, i) => `Resumo do Capítulo ${i + 1} (${c.title}): ${c.summary}`)
        .join('\n');

    let prompt = `
      Você é um mestre contador de histórias, um autor de best-sellers especialista em criar narrativas imersivas e emocionantes.
      Sua tarefa é escrever o conteúdo completo para o capítulo "${chapter.title}" do livro "${book.title}".

      ## CONTEXTO DA HISTÓRIA ##
      **Título:** ${book.title}
      **Gênero Literário:** ${book.genre}
      **Descrição Geral:** ${book.description}
      **Personagens Principais:**
      ${book.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
      **Mundo/Cenário:** ${book.world.name}: ${book.world.description}
      **Resumo dos Capítulos Anteriores:**
      ${previousChaptersContext || "Este é o primeiro capítulo."}
      
      ## OBJETIVO DO CAPÍTULO ATUAL ##
      **Título do Capítulo:** ${chapter.title}
      **Resumo do Capítulo:** "${chapter.summary}"

      ## DIRETRIZES DE ESCRITA (MUITO IMPORTANTE) ##
      1.  **Extensão:** Escreva um capítulo substancial e detalhado, com aproximadamente ${chapter.targetWordCount || 2500} palavras.
      2.  **Idioma e Ortografia:** Use exclusivamente o **português do Brasil**. A gramática e a ortografia devem ser impecáveis. Evite erros de digitação e palavras inventadas (ex: "coraran" em vez de "coração").
      3.  **Linguagem:** **NÃO use o pronome 'tu'** ou suas conjugações verbais (ex: 'estais', 'podes', 'falas a mim'). Use 'você' de forma consistente e natural para o português brasileiro.
      4.  **Estilo:** Adapte a prosa, o tom e o ritmo ao gênero especificado (${book.genre}). A escrita deve ser elegante, coesa e coerente.
      5.  **Diálogos:** Formate os diálogos de maneira clara e profissional. Cada fala de um personagem deve começar em um **novo parágrafo**, iniciado por um travessão (—). Não agrupe múltiplas falas no mesmo parágrafo.
          *   **Exemplo Correto:**
              — O que você quer dizer com isso? — perguntou ela, com a voz trêmula.
              — Exatamente o que você ouviu. Não há mais volta.
      6.  **Clareza e Vocabulário:** Mantenha a narrativa fluida e emocionante. Evite ambiguidades e clichês. Use um vocabulário rico, mas que seja compreensível e acessível, sem a necessidade de o leitor consultar um dicionário.
      7.  **Foco:** Concentre-se em desenvolver os eventos descritos no resumo do capítulo, aprofundando as interações dos personagens, as descrições do cenário e o avanço da trama.

      Responda APENAS com o texto completo do capítulo, seguindo todas as diretrizes acima.
    `;
    
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

export async function continueWriting(book: Book, precedingText: string): Promise<string> {
    let prompt = `
      Você é um mestre contador de histórias, um autor de best-sellers especialista em criar narrativas imersivas e emocionantes.
      Sua tarefa é continuar a história de forma natural a partir do texto fornecido, mantendo o estilo, o tom e o contexto.

      ## CONTEXTO DA HISTÓRIA ##
      **Título:** ${book.title}
      **Gênero Literário:** ${book.genre}
      **Descrição Geral:** ${book.description}
      **Personagens Principais:**
      ${book.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
      **Mundo/Cenário:** ${book.world.name}: ${book.world.description}
      
      ## TEXTO PRECEDENTE (NÃO O REPITA NA RESPOSTA) ##
      ...${precedingText}

      ## DIRETRIZES DE ESCRITA (MUITO IMPORTANTE) ##
      1.  **Continuação Natural:** Escreva os próximos um ou dois parágrafos da história, dando continuidade direta ao "TEXTO PRECEDENTE".
      2.  **Idioma e Ortografia:** Use exclusivamente o **português do Brasil**, com gramática e ortografia impecáveis. Evite erros de digitação.
      3.  **Linguagem:** Use 'você' de forma consistente, **NÃO use o pronome 'tu'**.
      4.  **Estilo:** Mantenha a prosa e o tom do texto anterior e do gênero (${book.genre}).
      5.  **Diálogos:** Se criar diálogos, use o formato correto (novo parágrafo para cada fala, começando com travessão —).
      
      Responda APENAS com o novo texto. Não inclua frases como "Claro, aqui está a continuação:" nem repita nenhuma parte do texto fornecido. Comece diretamente com a continuação da história.
    `;
    
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

export async function completeChapterContent(book: Book, chapterIndex: number, currentContent: string): Promise<string> {
    const chapter = book.chapters[chapterIndex];
    const targetWords = chapter.targetWordCount || 2500;
    const currentWords = currentContent.trim().split(/\s+/).length;
    const wordsNeeded = targetWords - currentWords;

    if (wordsNeeded <= 0) {
        return ""; // Já atingiu a meta
    }

    const precedingText = currentContent.slice(-2000); // Usa os últimos 2000 caracteres como contexto

    let prompt = `
        Você é um mestre contador de histórias, um autor de best-sellers especialista em criar narrativas imersivas e emocionantes.
        Sua tarefa é continuar a escrita de um capítulo para que ele atinja a contagem de palavras desejada.

        ## CONTEXTO DA HISTÓRIA ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}

        ## OBJETIVO ##
        O capítulo tem atualmente ${currentWords} palavras. A meta é ${targetWords} palavras.
        Escreva aproximadamente **${wordsNeeded} palavras adicionais** para completar o capítulo.

        ## TEXTO EXISTENTE (NÃO REPITA NA SUA RESPOSTA) ##
        ...${precedingText}

        ## DIRETRIZES DE ESCRITA (MUITO IMPORTANTE) ##
        1.  **Continuação Direta:** Continue a história de forma natural a partir do texto existente. Não comece com introduções como "Continuando a história...".
        2.  **Consistência:** Mantenha o tom, o estilo e o ritmo do texto fornecido.
        3.  **Foco:** Desenvolva a cena atual ou avance para a próxima batida da trama de forma lógica.
        4.  **Idioma e Ortografia:** Use exclusivamente o **português do Brasil**, com o pronome "você" e ortografia impecável.

        Responda APENAS com o novo texto.
    `;
    
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}


export async function generateNarration(text: string, voiceName: string = 'Puck', tone: string): Promise<string> {
    const prompt = `Aja como um contador de histórias experiente. Narre o texto a seguir em um tom ${tone}, usando pausas naturais para ênfase e permitindo que o ouvinte absorva a história. O texto é: ${text}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            console.error("API Response missing audio data:", JSON.stringify(response, null, 2));
            throw new Error("Nenhum dado de áudio retornado da API. A resposta pode ter sido bloqueada por segurança.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error in generateNarration API call:", error);
        throw error; // Re-lança o erro original após o log
    }
}

export async function generateMultiSpeakerNarration(text: string, speakers: SpeakerConfig[]): Promise<string> {
    const prompt = `Narração com múltiplos locutores. O texto a seguir contém diálogos. Use a voz correspondente para cada locutor, identificado por 'Nome:'. Texto: ${text}`;

    const speakerVoiceConfigs = speakers.map(s => ({
        speaker: s.name,
        voiceConfig: { prebuiltVoiceConfig: { voiceName: s.voice } }
    }));

    if (speakerVoiceConfigs.length < 2) {
         throw new Error("A narração com múltiplos locutores requer pelo menos 2 narradores definidos.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: speakerVoiceConfigs
                    }
                }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            console.error("API Response missing audio data (multi-speaker):", JSON.stringify(response, null, 2));
            throw new Error("Nenhum dado de áudio retornado da API para múltiplos locutores. Verifique a formatação do texto (ex: 'Nome: ...')");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error in generateMultiSpeakerNarration API call:", error);
        throw error;
    }
}


export async function generateCoverImage(book: Book): Promise<string> {
    const finalPrompt = `
        Crie uma capa de livro para a plataforma Wattpad. A imagem deve ser visualmente atraente e profissional.

        ## TEXTO OBRIGATÓRIO NA CAPA (ORTOGRAFIA EXATA) ##
        - Título do Livro: "${book.title}"
        - Nome do Autor: "${book.author}"

        ## DIRETRIZES DE DESIGN ##
        1.  **Título:** O texto do título deve ser GRANDE, CLARO e fácil de ler, mesmo em miniaturas.
        2.  **Autor:** O nome do autor deve ser menor que o título, mas ainda legível.
        3.  **Imagem de Fundo:** A arte deve refletir a descrição da história ("${book.description}") e o estilo de arte ("${book.coverArtStyle}").
        4.  **Idioma:** TODO o texto na capa deve estar em **português do Brasil**, com a ortografia exata fornecida acima. A ortografia deve ser PERFEITA.
    `;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '9:16', // Alterado de '3:4' para '9:16' para melhor corresponder a 512x800
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("Nenhuma imagem retornada da API.");
    }
    return base64ImageBytes;
}

export async function generateComposedCoverImage(base64Foreground: string, mimeType: string, book: Book): Promise<string> {
    const finalPrompt = `
        Você é um designer de capas de livros para Wattpad. Sua tarefa é criar uma capa profissional, garantindo que o texto seja perfeitamente legível e com a ortografia correta.

        ## REGRAS DE DESIGN (MUITO IMPORTANTE) ##
        1.  **Composição:** Use a imagem fornecida como elemento central. Crie um fundo sutil no estilo de "${book.coverArtStyle}" que complemente a imagem principal.
        2.  **Legibilidade do Texto:** O texto deve ter ALTO CONTRASTE com o fundo. Use fontes SANS-SERIF limpas e grandes.
        3.  **Posicionamento do Texto:** Posicione o título e o autor em áreas mais vazias da imagem de destaque (ex: céu, parede), sem cobrir elementos importantes. O texto NÃO PODE tocar ou ultrapassar as bordas da capa.
        4.  **Hierarquia:** O título deve ser maior que o nome do autor.

        ## TEXTO A SER INCLUÍDO (ORTOGRAFIA EXATA) ##
        - **Título:** "${book.title}"
        - **Autor:** "${book.author}"

        ## IDIOMA ##
        O idioma de todo o texto na capa DEVE ser **português do Brasil**. Verifique a ortografia de CADA PALAVRA no título e no nome do autor. A ortografia deve ser PERFEITA.
    `;

    const imagePart = {
      inlineData: {
        mimeType: mimeType, 
        data: base64Foreground,
      },
    };

    const textPart = {
      text: finalPrompt
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const imageOutputPart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imageOutputPart?.inlineData?.data) {
      return imageOutputPart.inlineData.data;
    }
    
    throw new Error("Nenhuma imagem composta retornada da API. A resposta pode ter sido bloqueada ou estar vazia.");
}

export async function generateLogo(prompt: string): Promise<string> {
    const finalPrompt = `
        Crie um logo moderno e minimalista para uma marca ou produto. O logo deve ser um ícone simples, memorável e facilmente reconhecível, adequado para um aplicativo.
        
        ## CONCEITO DO LOGO ##
        "${prompt}"

        ## DIRETRIZES DE DESIGN (MUITO IMPORTANTE) ##
        1.  **Estilo:** Vetor, flat design, limpo.
        2.  **Fundo:** Fundo branco sólido. O logo NÃO deve conter texto.
        3.  **Versatilidade:** O design deve funcionar bem em fundos claros e escuros.
        4.  **Simplicidade:** Evite detalhes excessivos. O logo deve ser claro mesmo em tamanhos pequenos.
    `;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("Nenhuma imagem de logo retornada da API.");
    }
    return base64ImageBytes;
}


export async function generateConceptArt(prompt: string, artStyle: string): Promise<string> {
    const finalPrompt = `Arte conceitual para uma história. A cena é: "${prompt}". O estilo de arte geral é: ${artStyle}.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("Nenhuma imagem retornada da API.");
    }
    return base64ImageBytes;
}


export async function generateVideo(prompt: string, image?: { data: string; mimeType: string; }): Promise<string> {
    const aiWithApiKey = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    };

    if (image) {
        payload.image = {
            imageBytes: image.data,
            mimeType: image.mimeType,
        };
    }

    let operation = await aiWithApiKey.models.generateVideos(payload);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await aiWithApiKey.operations.getVideosOperation({ operation: operation });
    }
  
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Falha ao gerar o vídeo.");
    }
    return downloadLink;
}

export async function generateConversationalVideo(prompt: string, image: { data: string; mimeType: string; }): Promise<string> {
    const aiWithApiKey = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const finalPrompt = `Crie um vídeo de conversa realista e em close-up da pessoa na imagem. A pessoa está dizendo o seguinte: "${prompt}". O vídeo deve ser estável, com foco no rosto, e os movimentos da boca devem parecer naturais para a fala. Estilo cinematográfico.`;

    const payload = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: finalPrompt,
      image: {
          imageBytes: image.data,
          mimeType: image.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Portrait aspect ratio for conversational videos
      }
    };

    let operation = await aiWithApiKey.models.generateVideos(payload);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await aiWithApiKey.operations.getVideosOperation({ operation: operation });
    }
  
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Falha ao gerar o vídeo de conversa.");
    }
    return downloadLink;
}

export async function generateMusic(prompt: string, genre: string, durationInSeconds: number): Promise<string> {
    // Simula uma chamada de API, pois o modelo de música ainda não está publicamente disponível.
    console.log(`Simulando a geração de música com: prompt='${prompt}', genre='${genre}', duration=${durationInSeconds}s`);
    
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("A API de geração de música ainda não está disponível publicamente. Esta funcionalidade é uma demonstração da interface e será ativada em uma futura atualização."));
        }, 3000);
    });
}

export async function generateSoundEffect(prompt: string): Promise<string> {
    // Simula uma chamada de API, pois o modelo de efeitos sonoros ainda não está publicamente disponível.
    console.log(`Simulando a geração de efeito sonoro com: prompt='${prompt}'`);
    
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("A API de geração de efeitos sonoros ainda não está disponível publicamente. Esta funcionalidade é uma demonstração da interface e será ativada em uma futura atualização."));
        }, 3000);
    });
}

export async function generateCustomText(prompt: string, book: Book): Promise<string> {
    let fullPrompt = `
        Você é um assistente de escrita criativa de classe mundial, um mestre da prosa e da narrativa.
        Sua tarefa é atender ao pedido do usuário com base no contexto do livro fornecido.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral:** ${book.description}
        **Personagens Principais:**
        ${book.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
        **Mundo/Cenário:** ${book.world.name}: ${book.world.description}

        ## PEDIDO DO USUÁRIO ##
        "${prompt}"

        ## DIRETRIZES DE RESPOSTA ##
        1.  Mergulhe no contexto do livro para garantir que sua resposta seja coesa e relevante para o universo da história.
        2.  Adapte seu estilo de escrita para combinar com o gênero (${book.genre}) do livro.
        3.  Responda **APENAS** com o texto solicitado, sem adicionar frases introdutórias, saudações ou explicações. Seja direto e criativo.
        4.  **Idioma e Ortografia:** Sua resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
    });
    
    return response.text;
}

export async function generateParagraph(book: Book, topic: string): Promise<string> {
    let fullPrompt = `
        Você é um mestre contador de histórias, um autor de best-sellers especialista em criar narrativas imersivas e emocionantes.
        Sua tarefa é expandir o tópico fornecido em um parágrafo único, rico e bem escrito.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral:** ${book.description}
        **Personagens Principais:**
        ${book.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
        **Mundo/Cenário:** ${book.world.name}: ${book.world.description}

        ## TÓPICO DO PARÁGRAFO ##
        "${topic}"

        ## DIRETRIZES DE ESCRITA (MUITO IMPORTANTE) ##
        1.  **Foco:** Concentre-se em escrever um parágrafo único e coeso que explore o tópico fornecido.
        2.  **Qualidade da Prosa:** A escrita deve ser elegante, descritiva e consistente com o gênero (${book.genre}).
        3.  **Tamanho:** O parágrafo deve ser substancial, com aproximadamente 100-150 palavras.
        4.  **Saída Direta:** Responda APENAS com o texto do parágrafo. Não inclua saudações, explicações ou o tópico original.
        5.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis, e usando o pronome "você".

        Comece a escrever o parágrafo diretamente.
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
    });
    
    return response.text;
}

export async function rewriteParagraph(book: Book, originalText: string, goal: string): Promise<string> {
    let fullPrompt = `
        Você é um editor de desenvolvimento especialista com um olhar aguçado para a prosa e o ritmo da narrativa.
        Sua tarefa é reescrever o parágrafo a seguir com base no objetivo especificado, garantindo que ele se alinhe perfeitamente com o contexto da história.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral:** ${book.description}

        ## PARÁGRAFO ORIGINAL ##
        "${originalText}"

        ## OBJETIVO DA REESCRITA ##
        **Meta:** "${goal}"

        ## DIRETRIZES DE REESCRITA (MUITO IMPORTANTE) ##
        1.  **Fidelidade ao Contexto:** A nova versão deve manter o significado central e os eventos do parágrafo original, a menos que o objetivo exija uma mudança.
        2.  **Consistência de Estilo:** A prosa reescrita deve ser consistente com o gênero (${book.genre}) do livro e com a voz do autor (analisada a partir do texto original e da voz da marca, se disponível).
        3.  **Foco no Objetivo:** Cumpra estritamente o "OBJETIVO DA REESCRITA". Se o objetivo for "tornar mais conciso", remova o excesso de palavras. Se for "aumentar a tensão", use frases mais curtas, vocabulário evocativo e foco sensorial.
        4.  **Saída Direta:** Responda APENAS com o parágrafo reescrito. Não inclua saudações, explicações, o texto original ou o objetivo.
        5.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.

        Comece a reescrever o parágrafo diretamente.
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
    });
    
    return response.text;
}

export async function humanizeAiText(book: Book, originalText: string): Promise<string> {
    let fullPrompt = `
        Você é um editor de texto especialista, mestre em transformar conteúdo gerado por IA em prosa que soa autenticamente humana e evita a detecção por IA.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral:** ${book.description}

        ## TEXTO GERADO POR IA (ORIGINAL) ##
        "${originalText}"

        ## SUA TAREFA ##
        Reescreva o texto acima para que ele soe como se tivesse sido escrito por um humano talentoso. O objetivo é torná-lo indetectável como texto de IA.

        ## DIRETRIZES DE "HUMANIZAÇÃO" (MUITO IMPORTANTE) ##
        1.  **Varie a Estrutura e o Comprimento das Frases:** Quebre frases longas e complexas. Misture frases curas e impactantes com outras mais longas e fluidas. Evite a uniformidade.
        2.  **Ritmo e Fluxo:** Introduza um ritmo de prosa mais natural. Use pausas e transições de forma mais orgânica.
        3.  **Escolha de Palavras:** Substitua vocabulário comum de IA (ex: "mergulhar fundo", "no cenário de", "é importante notar") por alternativas mais sutis e criativas.
        4.  **Injete Nuances:** Adicione toques de personalidade que se alinhem com o gênero do livro (${book.genre}) e a voz do autor. A escrita deve ter um "sabor" humano.
        5.  **Fidelidade ao Significado:** Mantenha a informação e o significado central do texto original. A mudança é no estilo, não no conteúdo.
        6.  **Saída Direta:** Responda APENAS com o texto humanizado. Não inclua saudações, explicações ou o texto original.
        7.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.

        Comece a reescrever o texto diretamente.
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
    });
    
    return response.text;
}


export async function generateSeoArticle(book: Book, keyword: string): Promise<string> {
    let fullPrompt = `
        Você é um especialista em SEO e um redator de conteúdo de marketing digital para a indústria editorial.
        Sua tarefa é escrever um artigo de blog otimizado para SEO com aproximadamente 500-700 palavras sobre o livro fornecido, focando na palavra-chave principal.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral:** ${book.description}
        **Personagens Principais:**
        ${book.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
        **Mundo/Cenário:** ${book.world.name}: ${book.world.description}

        ## DIRETRIZES DO ARTIGO ##
        1.  **Palavra-chave Principal:** "${keyword}"
        2.  **Objetivo:** Atrair novos leitores através de buscas orgânicas, despertando a curiosidade sobre o livro.
        3.  **Estrutura do Artigo:**
            *   **Título (H1):** Crie um título magnético e otimizado para SEO que inclua a palavra-chave principal.
            *   **Introdução:** Um parágrafo cativante que introduz o tema do artigo e o livro, fisgando o leitor.
            *   **Corpo do Artigo (H2/H3):** Desenvolva o tópico em 2-3 seções com subtítulos (H2). Explore a palavra-chave no contexto do universo do livro (personagens, mundo, trama). Não entregue spoilers importantes.
            *   **Conclusão:** Um parágrafo final que resume os pontos principais.
            *   **Call-to-Action (CTA):** Termine com um chamado para ação, incentivando o leitor a saber mais sobre o livro.
        4.  **Técnicas de SEO:**
            *   Use a palavra-chave principal naturalmente no título, no primeiro parágrafo e em alguns subtítulos.
            *   Mantenha os parágrafos curtos e de fácil leitura.
            *   O tom deve ser envolvente e informativo, não uma sinopse seca.
        5.  **Formato de Saída:** Responda APENAS com o artigo completo em texto simples. Não inclua observações, saudações ou explicações fora do artigo.
        6.  **Idioma e Ortografia:** O artigo DEVE ser escrito exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.

        Comece o artigo diretamente com o Título (H1).
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
    });
    
    return response.text;
}

export async function generateSeoTitleAndMeta(book: Book, keyword: string): Promise<{titles: string[], metaDescription: string}> {
    let fullPrompt = `
        Você é um especialista em SEO (Search Engine Optimization) e copywriter para a indústria editorial.
        Sua tarefa é criar títulos de SEO e uma meta descrição para uma página da web sobre o livro fornecido, focando na palavra-chave principal. 
        **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral:** ${book.description}
        
        ## DIRETRIZES DO ARTIGO ##
        1.  **Palavra-chave Principal:** "${keyword}"
        2.  **Objetivo:** Atrair cliques de usuários em mecanismos de busca como o Google.

        ## REQUISITOS PARA OS TÍTULOS ##
        - Gere uma lista de 3 a 5 opções de título.
        - Cada título DEVE ter **menos de 60 caracteres**.
        - Cada título DEVE incluir a palavra-chave principal.
        - Os títulos devem ser magnéticos, despertando curiosidade.

        ## REQUISITOS PARA A META DESCRIÇÃO ##
        - Gere UMA meta descrição.
        - A meta descrição DEVE ter **menos de 160 caracteres**.
        - A meta descrição DEVE incluir a palavra-chave principal.
        - Deve ser uma chamada para ação (call-to-action) convincente, incentivando o usuário a clicar para saber mais.
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: seoTitleMetaSchema,
        },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}

export async function generateSeoKeywords(book: Book, inputText: string): Promise<string[]> {
    let fullPrompt = `
        Você é um especialista em SEO (Search Engine Optimization) e um estrategista de conteúdo.
        Sua tarefa é analisar o texto fornecido e extrair uma lista de palavras-chave relevantes que aumentarão a visibilidade e a relevância do conteúdo nos mecanismos de busca.

        ## CONTEXTO DO LIVRO (para referência de tom e tema) ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        
        ## TEXTO DE ENTRADA PARA ANÁLISE ##
        "${inputText}"

        ## DIRETRIZES PARA GERAÇÃO DE PALAVRAS-CHAVE ##
        1.  **Relevância:** As palavras-chave devem estar diretamente relacionadas ao conteúdo do texto fornecido.
        2.  **Variedade:** Gere uma mistura de palavras-chave de cauda curta (1-2 palavras, ex: "magia sombria") e de cauda longa (3+ palavras, ex: "escola de magia para jovens bruxos").
        3.  **Quantidade:** Extraia uma lista de 10 a 15 palavras-chave no total.
        4.  **Intenção do Usuário:** Pense no que um leitor interessado neste tópico pesquisaria no Google.
        5.  **Idioma:** As palavras-chave devem ser em **português do Brasil**.
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: seoKeywordsSchema,
        },
    });
    
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.keywords;
}

export async function generateMagicToolResponse(toolPrompt: string, book: Book): Promise<string> {
    let fullPrompt = `
        Você é uma "Ferramenta de IA Mágica" para um autor de livros. O autor definiu você para se comportar da seguinte maneira: "${toolPrompt}".

        Sua tarefa é agir EXATAMENTE como a ferramenta descrita, usando o contexto do livro do autor como sua base de conhecimento. NÃO aja como um assistente de IA genérico. Incorpore a persona da ferramenta que o usuário criou.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral:** ${book.description}
        **Personagens Principais:**
        ${book.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
        **Mundo/Cenário:** ${book.world.name}: ${book.world.description}
        **Resumo dos Capítulos:**
        ${book.chapters.map((c, i) => `Capítulo ${i + 1}: ${c.summary}`).join('\n')}

        ## INSTRUÇÕES ##
        1. Execute a tarefa descrita em "${toolPrompt}" da forma mais criativa e útil possível.
        2. Use as informações do CONTEXTO DO LIVRO para embasar sua resposta.
        3. Responda APENAS com o resultado da ferramenta. Não inclua saudações, explicações ou frases como "Claro, aqui está..." ou "Como um gerador de nomes...". Seja direto.
        4. **Idioma e Ortografia:** Sua resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    
    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
    });
    
    return response.text;
}

export async function generateBlogPostTitles(book: Book, topic: string): Promise<string[]> {
    let prompt = `
        Você é um especialista em SEO e copywriter para a indústria editorial.
        Sua tarefa é gerar 5 títulos de postagem de blog cativantes e otimizados para SEO.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}

        ## TÓPICO DA POSTAGEM DO BLOG ##
        "${topic}"

        ## DIRETRIZES DOS TÍTULOS ##
        1.  Incorpore o tópico/palavra-chave de forma natural.
        2.  Crie curiosidade sobre o livro sem revelar spoilers.
        3.  Os títulos devem ser atraentes e incentivar cliques.
        4.  Mantenha os títulos concisos e impactantes.
        5.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: blogPostTitlesSchema,
        },
    });
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.titles;
}

export async function generateBlogPostOutline(book: Book, topic: string, title: string): Promise<string[]> {
    let prompt = `
        Você é um estrategista de conteúdo digital.
        Sua tarefa é criar um esboço claro e lógico para uma postagem de blog.

        ## CONTEXTO DO LIVRO ##
        **Título do Livro:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}

        ## DETALHES DA POSTAGEM DO BLOG ##
        **Tópico Principal:** "${topic}"
        **Título Escolhido:** "${title}"

        ## DIRETRIZES DO ESBOÇO ##
        1.  Crie uma lista de 4 a 6 títulos de seção.
        2.  O esboço deve fluir logicamente: comece com uma introdução, desenvolva o tópico em seções corporais e termine com uma conclusão.
        3.  A última seção deve ser uma "Conclusão" ou um "Chamado à Ação" que incentive as pessoas a lerem o livro.
        4.  Os títulos das seções devem ser descritivos e interessantes.
        5.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: blogPostOutlineSchema,
        },
    });
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.outline;
}

export async function generateFullBlogPost(book: Book, title: string, outline: string[]): Promise<string> {
    let prompt = `
        Você é um redator de conteúdo especialista em marketing para autores.
        Sua tarefa é escrever uma postagem de blog completa e envolvente com 500-700 palavras, usando as informações fornecidas.

        ## CONTEXTO DO LIVRO ##
        **Título do Livro:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}
        **Personagens:** ${book.characters.map(c => c.name).join(', ')}
        **Mundo:** ${book.world.name}

        ## ESTRUTURA DA POSTAGEM DO BLOG ##
        **Título Principal (H1):** ${title}
        **Esboço/Seções (H2):**
        ${outline.map(item => `- ${item}`).join('\n')}

        ## DIRETRIZES DE ESCRITA ##
        1.  **Formato:** Escreva o artigo completo. Comece com o título, seguido pelo conteúdo. Use os itens do esboço como subtítulos para as seções.
        2.  **Objetivo:** Atrair novos leitores para o livro. Desperte a curiosidade, explore os temas, mas **NÃO entregue spoilers importantes da trama**.
        3.  **Tom:** O tom deve ser envolvente, informativo e consistente com o gênero do livro.
        4.  **SEO:** Use o título e os temas do esboço naturalmente ao longo do texto.
        5.  **Conclusão:** Termine com um forte chamado à ação (CTA) que incentive os leitores a conferir o livro.
        6.  **Saída:** Responda APENAS com o texto completo do artigo. Não inclua saudações, notas ou explicações.
        7.  **Idioma e Ortografia:** A postagem DEVE ser escrita exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

export async function generateInstagramCaptions(book: Book, postDescription: string, tone: string): Promise<string[]> {
    let prompt = `
        Você é um especialista em marketing de mídia social para autores e editoras, especializado em criar legendas envolventes para o Instagram.
        Sua tarefa é gerar de 3 a 5 opções de legenda para uma postagem do Instagram sobre o livro fornecido.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}
        **Personagens Principais:** ${book.characters.map(c => c.name).join(', ')}
        **Mundo:** ${book.world.name}

        ## DETALHES DA POSTAGEM ##
        **Descrição do Conteúdo da Postagem:** "${postDescription}"
        **Tom Desejado para a Legenda:** ${tone}

        ## DIRETRIZES PARA A LEGENDA ##
        1.  **Envolvimento:** Crie legendas que incentivem a interação (curtidas, comentários, compartilhamentos). Faça perguntas, use chamadas para ação.
        2.  **Tom:** A legenda deve refletir o tom "${tone}" solicitado.
        3.  **Hashtags:** Inclua de 5 a 7 hashtags relevantes e populares no final de cada legenda. As hashtags devem incluir o título do livro (em formato de hashtag, ex: #OTituloDoLivro), o gênero e temas relacionados.
        4.  **Contexto:** Use o contexto do livro para tornar as legendas autênticas e interessantes para os fãs.
        5.  **Formato:** Use quebras de linha (emojis, se apropriado) para tornar a legenda fácil de ler.
        6.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: instagramCaptionsSchema,
        },
    });
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.captions;
}

export async function generateFacebookPosts(book: Book, postDescription: string, tone: string): Promise<string[]> {
    let prompt = `
        Você é um especialista em marketing de mídia social para autores, especializado em criar postagens envolventes para o Facebook.
        Sua tarefa é gerar de 3 a 5 opções de postagem para o Facebook sobre o livro fornecido.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}
        **Personagens Principais:** ${book.characters.map(c => c.name).join(', ')}
        **Mundo:** ${book.world.name}

        ## DETALHES DA POSTAGEM ##
        **Descrição do Conteúdo da Postagem:** "${postDescription}"
        **Tom Desejado para a Postagem:** ${tone}

        ## DIRETRIZES PARA A POSTAGEM NO FACEBOOK ##
        1.  **Formato:** As postagens do Facebook podem ser mais longas e descritivas do que as do Instagram. Use 1-3 parágrafos curtos para contar uma mini-história ou dar mais contexto.
        2.  **Envolvimento:** Crie postagens que incentivem a discussão. Faça perguntas abertas aos leitores para estimular comentários.
        3.  **Tom:** A postagem deve refletir o tom "${tone}" solicitado.
        4.  **Chamada para Ação (CTA):** Inclua uma CTA clara, como "Saiba mais no link da bio!", "Qual é a sua teoria?", ou "Marque um amigo que adoraria esta história!".
        5.  **Hashtags:** Inclua de 3 a 5 hashtags relevantes no final de cada postagem.
        6.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: facebookPostsSchema,
        },
    });
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.posts;
}

export async function generateAboutUsPage(book: Book): Promise<string> {
    let prompt = `
        Você é um estrategista de marca e copywriter especialista para autores.
        Sua tarefa é escrever o conteúdo para uma página "Sobre Nós" (ou "Sobre o Autor") para o site do autor, com base nas informações do livro fornecido.

        ## CONTEXTO ##
        **Nome do Autor:** ${book.author}
        **Título do Livro:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição do Livro:** ${book.description}

        ## DIRETRIZES DE ESCRITA ##
        1.  **Tom:** O tom deve ser autêntico, profissional e envolvente, criando uma conexão com os leitores.
        2.  **Estrutura do Conteúdo:** Organize o texto nas seguintes seções, usando formatação (títulos, parágrafos) para clareza:
            *   **Título (H1):** Um título principal, como "Sobre ${book.author}" ou "Nossa História".
            *   **Introdução:** Um parágrafo de abertura cativante sobre a jornada do autor e sua paixão pela escrita.
            *   **A Inspiração por Trás de "${book.title}":** Uma seção que conecta a paixão e os interesses do autor com os temas centrais do livro, explicando o que o motivou a escrever esta história específica.
            *   **Nossa Missão (ou Minha Missão):** Uma breve declaração sobre o que o autor espera alcançar com suas histórias (ex: inspirar, entreter, provocar reflexão).
            *   **Conecte-se:** Uma chamada para ação (CTA) final, convidando os leitores a se conectarem com o autor (ex: "Siga-me nas redes sociais para bastidores e novidades!" ou "Inscreva-se na nossa newsletter para não perder nenhum lançamento.").
        3.  **Saída:** Responda APENAS com o texto completo da página. Não inclua saudações, notas ou explicações.
        4.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.

        Comece o texto diretamente com o Título (H1).
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}


export async function summarizeContent(textToSummarize: string): Promise<string> {
    const prompt = `
        Você é um analista e resumidor especialista. Sua tarefa é ler o texto a seguir e fornecer um resumo conciso e bem estruturado.

        ## INSTRUÇÕES ##
        1.  **Extraia os Pontos-Chave:** Identifique as ideias principais, os argumentos centrais e as conclusões do texto.
        2.  **Clareza e Precisão:** O resumo deve ser claro, preciso e capturar a essência do texto original sem adicionar informações ou opiniões externas.
        3.  **Formato:** Use marcadores (bullet points) para listar as ideias principais, facilitando a leitura rápida. Comece com um ou dois parágrafos introdutórios que capturem o tema geral.
        4.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.

        ## TEXTO PARA RESUMIR ##
        "${textToSummarize}"

        ## DIRETRIZES DE SAÍDA ##
        Responda APENAS com o resumo. Não inclua saudações ou explicações.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

export async function correctGrammar(textToCorrect: string): Promise<string> {
    const prompt = `
        Você é um editor especialista e um corretor gramatical meticuloso. Sua tarefa é revisar o texto a seguir e corrigir todos os erros gramaticais, de ortografia e pontuação. Além disso, aprimore a clareza, o fluxo e a legibilidade geral do texto, mantendo o tom e a intenção originais do autor.

        ## REGRAS DE CORREÇÃO ##
        1.  **Correção Abrangente:** Corrija erros de gramática, ortografia, pontuação, concordância verbal e nominal.
        2.  **Clareza e Fluidez:** Reescreva frases ambíguas ou mal estruturadas para melhorar a clareza sem alterar o significado.
        3.  **Preservação do Tom:** Mantenha o tom original do texto (ex: formal, informal, poético, técnico).
        4.  **Saída Limpa:** Retorne APENAS o texto corrigido. Não inclua explicações, comentários ou o texto original.
        5.  **Idioma:** Mantenha o idioma original do texto (**português do Brasil**) e garanta uma ortografia perfeita.

        ## TEXTO PARA CORRIGIR ##
        "${textToCorrect}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

export async function generateMarketingCoreMessage(book: Book, goal: string, audience: string): Promise<{coreMessage: string, slogans: string[]}> {
    let prompt = `
        Você é um diretor de marketing e estrategista de marca para a indústria editorial.
        Sua tarefa é criar a fundação de uma campanha de marketing para um livro.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}

        ## DETALHES DA CAMPANHA ##
        **Objetivo da Campanha:** "${goal}"
        **Público-Alvo:** "${audience}"

        ## SUA TAREFA ##
        1.  **Mensagem Central:** Crie uma mensagem de marketing central e concisa (1-2 frases) que capture a essência da campanha, conectando o livro ao público-alvo e ao objetivo.
        2.  **Slogans:** Gere uma lista de 3 a 5 slogans curtos, cativantes e memoráveis para a campanha, baseados na mensagem central.
        3.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: marketingCoreMessageSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}

export async function generateMarketingCampaignAssets(book: Book, goal: string, audience: string, slogan: string): Promise<any> {
    let prompt = `
        Você é um gerente de marketing digital full-stack, especialista em lançamentos de livros.
        Sua tarefa é criar um kit completo de ativos de marketing para uma campanha de livro, com base nas informações fornecidas.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}

        ## DETALHES DA CAMPANHA ##
        **Objetivo da Campanha:** "${goal}"
        **Público-Alvo:** "${audience}"
        **Slogan Escolhido:** "${slogan}"

        ## SUA TAREFA: CRIAR OS SEGUINTES ATIVOS ##
        1.  **Template de E-mail:** Escreva um e-mail de anúncio completo (assunto e corpo) para a lista de e-mails do autor, anunciando a campanha. O tom deve ser envolvente e terminar com uma chamada para ação clara.
        2.  **Postagens para Redes Sociais:** Crie 3 postagens. Uma para Instagram (mais visual e com hashtags), uma para Facebook (um pouco mais longa e convidativa à discussão) e uma para Twitter/X (curta, impactante e com link).
        3.  **Ideias para Postagens de Blog:** Sugira 2 a 3 títulos de postagens de blog que o autor poderia escrever para apoiar a campanha e aprofundar os temas do livro.
        4.  **Roteiro para Vídeo Curto:** Escreva um roteiro simples para um vídeo de 30-60 segundos (para Reels/Shorts/TikTok). Inclua sugestões de cenas/visuais e o texto da narração/legendas.
        5.  **Idioma e Ortografia:** Todos os ativos devem ser gerados exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: marketingAssetsSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}

export async function generateYouTubeTitles(book: Book, videoTopic: string): Promise<string[]> {
    let prompt = `
        Você é um especialista em marketing de vídeo e estrategista de conteúdo para o YouTube, com foco no nicho de livros e autores.
        Sua tarefa é gerar uma lista de 5 a 7 títulos de vídeo para o YouTube que sejam cativantes, otimizados para SEO e que gerem curiosidade.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}

        ## TEMA DO VÍDEO ##
        "${videoTopic}"

        ## DIRETRIZES PARA OS TÍTULOS ##
        1.  **Cativante (Click-worthy):** Use palavras de poder, faça perguntas ou crie um senso de urgência/mistério.
        2.  **SEO Otimizado:** Inclua palavras-chave relevantes que as pessoas pesquisariam (relacionadas ao tema, gênero e título do livro).
        3.  **Clareza:** O título deve deixar claro sobre o que é o vídeo, mas sem entregar tudo.
        4.  **Formato YouTube:** Considere formatos populares como "Top 5 Razões...", "Análise Profunda de...", "A Verdade Sobre...".
        5.  **Relevância:** Todos os títulos devem estar diretamente relacionados ao livro e ao tema do vídeo.
        6.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: youtubeTitlesSchema,
        },
    });
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.titles;
}

export async function generateYouTubeDescription(book: Book, videoTopic: string, videoTitle: string): Promise<string> {
    let prompt = `
        Você é um especialista em SEO do YouTube e estrategista de conteúdo para autores.
        Sua tarefa é escrever uma descrição de vídeo do YouTube completa, envolvente e otimizada para SEO.

        ## CONTEXTO DO LIVRO ##
        **Título do Livro:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}
        **Autor:** ${book.author}

        ## DETALHES DO VÍDEO ##
        **Título do Vídeo:** "${videoTitle}"
        **Tópico do Vídeo:** "${videoTopic}"

        ## DIRETRIZES PARA A DESCRIÇÃO (MUITO IMPORTANTE) ##
        1.  **Estrutura:** Siga esta estrutura estritamente:
            *   **Gancho (Primeiras 2-3 linhas):** Comece com um gancho forte que resuma o vídeo e inclua as palavras-chave principais do título. Esta é a parte mais importante, pois aparece antes do botão "...mais".
            *   **Resumo Detalhado (2-3 parágrafos):** Expanda sobre o conteúdo do vídeo. Discuta os temas, personagens ou pontos da trama mencionados no vídeo, despertando a curiosidade sem entregar grandes spoilers. Conecte o vídeo ao universo do livro.
            *   **Chamada para Ação (CTA):** Incentive os espectadores a se envolverem. Peça para eles curtirem, se inscreverem e deixarem um comentário com uma pergunta específica relacionada ao vídeo.
            *   **Links Relevantes:** Inclua placeholders para links importantes, como:
                - 📖 Compre o livro aqui: [Link para comprar o livro]
                - 💻 Visite meu site: [Link para o site do autor]
                - 🔔 Siga-me nas redes sociais: [Links para redes sociais]
            *   **Hashtags:** Forneça de 5 a 7 hashtags de SEO relevantes. Inclua o título do livro, nome do autor, gênero e tópicos do vídeo.
        2.  **Tom:** O tom deve ser entusiasmado e informativo, alinhado com o gênero do livro e o público-alvo.
        3.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
        4.  **Saída:** Responda APENAS com o texto completo da descrição. Não inclua saudações, notas ou explicações.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

export async function generateYouTubeVideoIdeas(book: Book, topic: string): Promise<string[]> {
    let prompt = `
        Você é um estrategista de conteúdo do YouTube e um especialista em marketing de livros.
        Sua tarefa é gerar uma lista de 5 a 7 ideias de vídeo criativas e envolventes para um autor promover seu livro.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero:** ${book.genre}
        **Descrição:** ${book.description}

        ## TÓPICO GERAL DO VÍDEO ##
        "${topic}"

        ## DIRETRIZES PARA AS IDEIAS ##
        1.  **Criatividade:** Pense fora da caixa. Sugira formatos como deep dives, vlogs de escrita, desafios, análises de personagens, explicações do universo, etc.
        2.  **Relevância:** Todas as ideias devem ser relevantes para o livro e o tópico fornecido.
        3.  **Engajamento:** As ideias devem ser projetadas para atrair a atenção do público-alvo do livro e gerar discussões.
        4.  **Ação:** As ideias devem ser acionáveis, ou seja, o autor deve ser capaz de criar um vídeo a partir delas.
        5.  **Formato:** Apresente cada ideia como um conceito claro e conciso.
        6.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: youtubeVideoIdeasSchema,
        },
    });
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.ideas;
}

export async function generateFanfic(book: Book, fandom: string, characters: string, plot: string, genre: string): Promise<string> {
    let prompt = `
        Você é um talentoso escritor de fanfiction. Sua tarefa é escrever uma história curta (aproximadamente 500-700 palavras) com base nos detalhes fornecidos.

        ## DETALHES DA FANFIC ##
        **Universo (Fandom):** "${fandom}"
        **Personagens Envolvidos:** "${characters}"
        **Enredo/Situação:** "${plot}"
        **Gênero/Tom da História:** "${genre}"

        ## DIRETRIZES DE ESCRITA ##
        1.  **Fidelidade:** Capture a essência e as personalidades dos personagens conforme são conhecidos no universo original, a menos que o enredo sugira uma variação (Universo Alternativo).
        2.  **Desenvolvimento:** Desenvolva a situação de forma criativa e envolvente. A história deve ter um começo, meio e um final satisfatório.
        3.  **Tom:** Mantenha o tom consistente com o gênero solicitado.
        4.  **Saída Direta:** Responda APENAS com a história. Não inclua saudações, explicações ou o título, a menos que seja parte da narrativa.
        5.  **Idioma e Ortografia:** A história DEVE ser escrita exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis, e usando o pronome "você".

        Comece a escrever a história diretamente.
    `;
    
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

export async function analyzeManuscript(fullText: string, book: Book): Promise<any> {
    let prompt = `
        Você é um editor literário experiente e um analista de texto de IA. Sua tarefa é realizar uma análise aprofundada do manuscrito de um livro e fornecer feedback estruturado.

        ## CONTEXTO DO LIVRO ##
        **Título:** ${book.title}
        **Gênero Literário:** ${book.genre}

        ## DIRETRIZES DA ANÁLISE ##
        1.  **Resumo Geral:** Forneça uma visão geral concisa do manuscrito, cobrindo tom, estilo e temas. Inclua uma observação sobre o sentimento geral (ex: sombrio, otimista, agridoce).
        2.  **Pontos Fortes:** Identifique de 3 a 5 aspectos que estão funcionando bem. Seja específico (ex: "O diálogo entre X e Y é afiado e revela bem a personalidade deles.").
        3.  **Áreas para Melhoria:** Ofereça de 3 a 5 sugestões construtivas. Aponte áreas específicas que poderiam ser aprimoradas (ex: "O ritmo no capítulo 3 diminui consideravelmente; considere encurtar as descrições.").
        4.  **Palavras Repetidas:** Analise o texto para encontrar as 10 palavras mais repetidas, ignorando palavras comuns (artigos, preposições, etc.). Isso ajuda o autor a identificar possíveis vícios de linguagem.
        5.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.

        ## MANUSCRITO PARA ANÁLISE ##
        ${fullText.slice(0, 1_800_000)}
    `;
    
    prompt = addBrandVoiceToPrompt(prompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: manuscriptAnalysisSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}


export function initializeChat(book: Book): Chat {
    const systemInstruction = `
        Você é um assistente de escrita de IA, especializado em ajudar autores a desenvolver suas histórias. Você é criativo, prestativo e um especialista em narrativa.
        O usuário está trabalhando atualmente no seguinte livro:
        - Título: ${book.title}
        - Gênero: ${book.genre}
        - Descrição: ${book.description}
        - Personagens: ${book.characters.map(c => c.name).join(', ')}
        - Mundo: ${book.world.name}

        Sua tarefa é conversar com o usuário para ajudá-lo a gerar novo conteúdo, refinar ideias, criar descrições, diálogos ou qualquer outra coisa que ele precise. Seja conciso e direto ao ponto em suas respostas, a menos que o usuário peça para você elaborar. Por exemplo, se ele pedir "crie uma descrição para uma arte conceitual de uma floresta sombria", você deve fornecer apenas a descrição, sem frases introdutórias como "Claro, aqui está uma descrição:".
        **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = aiInstance.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: systemInstruction,
        },
    });
    return chat;
}

export async function sendChatMessage(chatInstance: Chat, message: string): Promise<string> {
    const response = await chatInstance.sendMessage({ message });
    return response.text;
}

export async function generateScenarios(book: Book, prompt: string): Promise<{ name: string; description: string; }[]> {
    let fullPrompt = `
        Você é um mestre criador de mundos e um designer de cenários para histórias de ficção.
        Sua tarefa é gerar uma lista de locais detalhados e interessantes para o mundo de um livro, com base na solicitação do autor.

        ## CONTEXTO DO MUNDO DO LIVRO ##
        **Título do Livro:** ${book.title}
        **Gênero Literário:** ${book.genre}
        **Descrição Geral do Mundo:** ${book.world.name} - ${book.world.description}

        ## SOLICITAÇÃO DO AUTOR ##
        O autor deseja criar locais que se encaixem no seguinte conceito: "${prompt}"

        ## DIRETRIZES DE GERAÇÃO ##
        1.  **Criatividade e Relevância:** Crie de 3 a 5 locais únicos que se encaixem tanto na solicitação do autor quanto no contexto geral do mundo do livro.
        2.  **Detalhes Vívidos:** Para cada local, forneça um nome criativo e uma descrição rica em detalhes. A descrição deve evocar uma atmosfera, mencionar elementos sensoriais (cheiros, sons, visuais) e sugerir como aquele local pode ser importante para a história.
        3.  **Consistência:** Garanta que os locais gerados sejam consistentes com o gênero (${book.genre}) e a descrição do mundo.
        4.  **Idioma e Ortografia:** A resposta DEVE ser exclusivamente em **português do Brasil**, com gramática e ortografia impecáveis.
    `;

    fullPrompt = addBrandVoiceToPrompt(fullPrompt, book.brandVoice);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: scenariosSchema,
        },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}