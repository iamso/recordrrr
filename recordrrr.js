const defaults = {
  bufferLength: 4096,
  jsPath: 'js',
  meter: () => {},
};

export default class Recordrrr {
  constructor(config) {
    this.config = Object.assign({}, defaults, config);
    this.defaults = defaults;
    this.recording = false;
    this.initialized = false;
    this.currentCallback = () => {};
  }
  init() {
    return new Promise((resolve, reject) => {
      try {
        navigator.mediaDevices.getUserMedia({audio: true})
          .then(stream => {
            try {
              this.stream = stream;
              this.audioContext = new AudioContext();
              this.analyser = this.audioContext.createAnalyser();
              this.source = this.audioContext.createMediaStreamSource(this.stream);
              this.node = this.audioContext.createScriptProcessor(this.config.bufferLength, 2, 2);
              this.worker = new Worker(`${this.config.jsPath}/workrrr.js`);

              this.analyser.smoothingTimeConstant = 0.5;
              this.analyser.fftSize = 1024;

              this.worker.onmessage = e => {
                const blob = e.data;
                this.currentCallback(blob);
              };

              this.worker.postMessage({
                command: 'init',
                config: {
                  sampleRate: this.audioContext.sampleRate,
                },
              });

              this.node.onaudioprocess = e => {
                if (!this.recording) {
                  return;
                }
                this.worker.postMessage({
                  command: 'record',
                  buffer: e.inputBuffer.getChannelData(0)
                });

                const array = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteFrequencyData(array);
                let values = 0;
                let highest = 0;

                for (let value of array) {
                  values += value;
                  highest = highest < value ? value : highest;
                }

                var average = values / array.length;

                this.config.meter.call(this, Math.round(average/255 * 100), Math.round(highest/255 * 100))
              };

              this.source.connect(this.analyser);
              this.analyser.connect(this.node);
              this.node.connect(this.audioContext.destination);
              resolve(this);
            }
            catch(e) {
              reject(e);
            }


          })
          .catch(reject);
      }
      catch(e) {
        reject(e);
      }
    });
  }
  record() {
    this.recording = true;
    return this;
  }
  stop() {
    this.recording = false;
    return this;
  }
  clear() {
    this.worker.postMessage({
      command: 'clear',
    });
    return this;
  }
  getBuffer() {
    return new Promise((resolve, reject) => {
      this.currentCallback = resolve;
      this.worker.postMessage({
        command: 'getBuffer',
      });
    });
  }
  exportMP3() {
    return new Promise((resolve, reject) => {
      this.currentCallback = resolve;
      this.worker.postMessage({
        command: 'exportMP3',
      });
    });
  }
  getDataURI() {
    return new Promise((resolve, reject) => {
      this.exportMP3().then(blob => {
        const reader = new FileReader();
        reader.onload = e => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(blob);
      });
    });
  }
}
