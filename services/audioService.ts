import { decodeAudioData as decodeGeminiAudio } from '../utils/audio';

let audioContext: AudioContext | null = null;
let audioSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
}

export async function playAudio(audioData: Uint8Array, onEnded: () => void, mimeType?: string): Promise<void> {
    stopAudio(); // Para qualquer áudio que esteja tocando
    const context = getAudioContext();
    if (context.state === 'suspended') {
        await context.resume();
    }

    let audioBuffer: AudioBuffer;
    if (mimeType) {
        // Para áudio gravado (ex: 'audio/webm'), usa o decodificador nativo do navegador
        audioBuffer = await context.decodeAudioData(audioData.buffer);
    } else {
        // Para áudio PCM bruto gerado pela IA, usa nosso decodificador personalizado
        audioBuffer = await decodeGeminiAudio(audioData, context, 24000, 1);
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.onended = () => {
        onEnded();
        audioSource = null;
    };
    audioSource = source;
    source.start();
}

export function stopAudio(): void {
    if (audioSource) {
        audioSource.stop();
        audioSource.disconnect();
        audioSource = null;
    }
}
