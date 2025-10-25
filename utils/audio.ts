
/**
 * Decodifica uma string Base64 em um Uint8Array.
 * @param base64 A string codificada em Base64.
 * @returns Um Uint8Array contendo os dados binários decodificados.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodifica dados de áudio PCM brutos em um AudioBuffer.
 * A API Gemini retorna dados PCM brutos, não um formato de arquivo padrão como .wav ou .mp3.
 * Esta função converte esses dados brutos em um formato que o AudioContext do navegador pode reproduzir.
 * @param data Os dados de áudio brutos como um Uint8Array.
 * @param ctx A instância do AudioContext.
 * @param sampleRate A taxa de amostragem do áudio (por exemplo, 24000 para Gemini TTS).
 * @param numChannels O número de canais de áudio (normalmente 1 para mono).
 * @returns Uma promessa que resolve para um AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Os dados brutos são PCM de 16 bits, então precisamos interpretá-los como Int16Array.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normaliza as amostras de inteiros de 16 bits para o intervalo de float [-1.0, 1.0].
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
