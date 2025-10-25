/**
 * Cria um Blob de arquivo WAV a partir de dados de áudio PCM brutos.
 * @param pcmData Os dados de áudio PCM brutos (Int16Array).
 * @param numChannels Número de canais de áudio.
 * @param sampleRate A taxa de amostragem do áudio.
 * @returns Um Blob representando o arquivo WAV.
 */
export function createWavBlob(pcmData: Int16Array, numChannels: number, sampleRate: number): Blob {
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length * (bitsPerSample / 8);
    // O tamanho do cabeçalho é 44 bytes, então o tamanho total do arquivo é 44 + dataSize - 8 (para o cabeçalho RIFF inicial)
    const fileSize = 36 + dataSize;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // Cabeçalho RIFF
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(view, 8, 'WAVE');
    
    // Sub-chunk 'fmt '
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Tamanho do sub-chunk (16 para PCM)
    view.setUint16(20, 1, true);  // Formato do áudio (1 para PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // Sub-chunk 'data'
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Escreve os dados PCM
    for (let i = 0; i < pcmData.length; i++) {
        view.setInt16(44 + i * 2, pcmData[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
