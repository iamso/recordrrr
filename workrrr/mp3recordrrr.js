import lamejs from './lame';

const defaults = {
  sampleRate: 44100,
  channels: 1,
  bitRate: 96,
};

export default class MP3Recordrrr {
  constructor(config) {
    this.config = Object.assign({}, defaults, config);
    this.defaults = defaults;
    this.lib = new lamejs();
    this.mp3Encoder = new this.lib.Mp3Encoder(this.config.channels, this.config.sampleRate, this.config.bitRate);
    this.recBuffer = [];
    this.recBufferMP3 = [];
    this.recLength = 0;
  }
  record(inputBuffer) {
    this.recBuffer.push(inputBuffer);
    this.recLength += inputBuffer.length;

    let chunk = this.encode(inputBuffer);

    if(chunk.length > 0){
      this.recBufferMP3.push(chunk);
    }
  }
  encode(buffer) {
    return this.mp3Encoder.encodeBuffer(this.float32ToInt(buffer));
  }
  flush() {
    return this.mp3Encoder.flush();
  }
  finish() {
    return this.flush();
  }
  clear() {
    this.recBuffer = [];
    this.recBufferMP3 = [];
    this.recLength = 0;
  }
  getBuffer(worker) {
    worker.postMessage([this.mergeBuffers()]);
  }
  mergeBuffers() {
    var result = new Float32Array(this.recLength);
    var offset = 0;
    for (let buffer of this.recBuffer){
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }
  exportMP3(worker) {
    worker.postMessage(new Blob(this.recBufferMP3, {type: 'audio/mp3'}));
  }
  float32ToInt(f32){
    const len = f32.length;
    let i = 0;
    let i16 = new Int16Array(len);

    while(i < len) {
      i16[i] = convert(f32[i++]);
    }

    function convert(n) {
      const v = n < 0 ? n * 32768 : n * 32767;     // convert in range [-32768, 32767]
      return Math.max(-32768, Math.min(32768, v)); // clamp
    }

    return i16;
  }
}
