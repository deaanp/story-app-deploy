// import { Resolver } from "webpack";

export default class Camera {
  constructor({ videoEl, canvasEl }) {
    this.videoEl = videoEl;
    this.canvasEl = canvasEl;
    this.stream = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoEl.srcObject = this.stream;
      await this.videoEl.play();
    } catch (err) {
      alert('Unable to access the camera: ' + err.message);
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.videoEl.srcObject = null;
    }
  }

  capture() {
    const context = this.canvasEl.getContext('2d');
    this.canvasEl.width = this.videoEl.videoWidth;
    this.canvasEl.height = this.videoEl.videoHeight;
    context.drawImage(this.videoEl, 0, 0);
    return new Promise((resolve) =>
      this.canvasEl.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
    );
  }
}
