import MP3Recordrrr from './mp3recordrrr';

let mp3Recordrrr;

self.onmessage = e => {
  switch(e.data.command) {
    case 'init':
      mp3Recordrrr = new MP3Recordrrr(e.data.config);
      break;
    case 'record':
      mp3Recordrrr.record(e.data.buffer);
      break;
    case 'getBuffer':
      mp3Recordrrr.getBuffer(self);
      break;
    case 'exportMP3':
      mp3Recordrrr.exportMP3(self);
      break;
    case 'clear':
      mp3Recordrrr.clear();
      break;
  }
};
