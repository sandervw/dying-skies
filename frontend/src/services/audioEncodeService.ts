/** wav encoding of rendered AudioBuffers for <audio> playback. */

const HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;

const writeAscii = (view: DataView, offset: number, text: string): void => {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
};

/** encode an AudioBuffer as a 16-bit PCM WAV blob url. */
const encodeWavUrl = (buffer: AudioBuffer): string => {
  const channelCount = buffer.numberOfChannels;
  const blockAlign = channelCount * BYTES_PER_SAMPLE;
  const dataSize = buffer.length * blockAlign;
  const view = new DataView(new ArrayBuffer(HEADER_BYTES + dataSize));
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);
  const channels = Array.from(
    { length: channelCount },
    (_unused, channel): Float32Array => buffer.getChannelData(channel),
  );
  let offset = HEADER_BYTES;
  for (let frame = 0; frame < buffer.length; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += BYTES_PER_SAMPLE;
    }
  }
  return URL.createObjectURL(new Blob([view.buffer], { type: "audio/wav" }));
};

export { encodeWavUrl };
