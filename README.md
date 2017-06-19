# Recordrrr

MP3 audio recorder.

## Usage

Import `recordrrr.js` in your main script.

```javascript
import Recordrrr from './recorderrr';

const rec = new Recordrrr({
  // pass only the path here, without the filename.
  jsPath: '/path/to/worker',
  meter: (avg, high) => {
    // do something with the meter value
  },
});
rec.init().then(rec => {
  // setup controls

  document.querySelector('#start').addEventListener('click', e => {
    rec.clear();
    rec.record();
  });

  document.querySelector('#stop').addEventListener('click', e => {
    rec.stop();
    // get the MP3 as dataURI
    rec.getDataURI().then(dataURI => {
      // do something with the dataURI
    });
    // or get the MP3 as blob
    rec.exportMP3().then(blob => {
      // do something with the blob
    });
  });

}).catch(error => {
  // getUserMedia not supported
});
```

**Important:** you have to put `workrrr.js` somewhere in the assets folder and pass the path in the Recordrrr constructor.


## License

[MIT License](LICENSE)
