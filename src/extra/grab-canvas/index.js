import { modV } from 'modv';
// import { MenuItem } from 'nwjs-menu-browser';

const Worker = require('worker-loader!./worker.js'); //eslint-disable-line

class GrabCanvas {
  constructor() {
    this.worker = new Worker();

    this.store = null;
    this.vue = null;
    this.delta = 0;
  }

  resize(canvas) {
    if (!canvas) return;

    this.worker.postMessage({
      type: 'setup',
      payload: {
        width: canvas.width,
        height: canvas.height,
        devicePixelRatio: window.devicePixelRatio,
      },
    });
  }

  /* install
   * Only called when added as a Vue plugin,
   * this must be registered with vue before modV
   * to use vuex or vue
   */
  install(Vue, { store }) {
    if (!store) throw new Error('No Vuex store detected');
    this.store = store;
    this.vue = Vue;

    store.subscribe((mutation) => {
      if (mutation.type === 'windows/setSize') {
        this.resize({
          width: mutation.payload.width,
          height: mutation.payload.height,
        });
      }
    });
  }

  /* modvInstall
   * Only called when added to modV.
   */
  modvInstall() { //eslint-disable-line
    this.resize(modV.outputCanvas);
  }

  /* process
   * Called once every frame.
   * Useful for plugins which need to process data away from modV
   */
  process({ delta }) {
    this.delta = delta;
  }

  /* processValue
   * Called once every frame.
   * Allows access of each value of every active Module.
   * (see expression plugin for an example)
   */
  processValue({ currentValue, moduleName, controlVariable }) { //eslint-disable-line

  }

  /* processFrame
   * Called once every frame.
   * Allows access of each frame drawn to the screen.
   */
  processFrame({ canvas, context }) { //eslint-disable-line
    //
    // Consider using the delta value to throttle the frame dumping
    // for a performance boost
    // if (this.delta % 2 === 0) {
    //
    // }
    //

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    this.worker.postMessage({
      type: 'data',
      payload: pixels,
    });
  }
}

const grabCanvas = new GrabCanvas();

export default grabCanvas;