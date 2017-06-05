function mux() {
  this.bufferContext.clearRect(0, 0, this.width, this.height);

  this.layers.forEach((Layer) => {
    if(!Layer.enabled || Layer.alpha === 0 || !Layer.drawToOutput) return;
    const canvas = Layer.canvas;
    this.bufferContext.drawImage(canvas, 0, 0, this.width, this.height);
  });

  this.windows.forEach((windowController) => {
    const canvas = windowController.canvas;
    const context = windowController.context;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(this.bufferCanvas, 0, 0, canvas.width, canvas.height);
  });
}

export default mux;