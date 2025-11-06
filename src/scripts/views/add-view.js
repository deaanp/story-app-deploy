import { icon } from "leaflet";
import Swal from "sweetalert2";

export default class AddView {
  constructor({ formEl, messageEl }) {
    this.formEl = formEl;
    this.messageEl = messageEl;
    this.fileInput = formEl.querySelector('#story-photo');
    this.previewEl = formEl.querySelector('#photo-preview');
    this.video = formEl.querySelector('#video');
    this.canvas = formEl.querySelector('#canvas');
    this.cameraBtn = formEl.querySelector('#open-camera');
    this.captureBtn = formEl.querySelector('#capture-photo');
    this.stopBtn = formEl.querySelector('#stop-camera');
    this.removeBtn = formEl.querySelector('#remove-photo');
  }

  showWarning(title, text) {
    Swal.fire({
      icon: 'warning',
      title,
      text,
    });
  }

  showInfo(title, text) {
    Swal.fire({
      icon: 'info',
      title,
      text,
    });
  }

  showError(title, text) {
    Swal.fire({
      icon: 'error',
      title,
      text,
    });
  }

  showSuccess(title, text) {
    Swal.fire({
      icon: 'success',
      title,
      text,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  onFileSelected(handler) {
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handler(file);
    });
  }

  onOpenCamera(handler) {
    this.cameraBtn.addEventListener('click', handler);
  }

  onCapturePhoto(handler) {
    this.captureBtn.addEventListener('click', handler);
  }

  onStopCamera(handler) {
    this.stopBtn.addEventListener('click', handler);
  }

  onSubmit(handler) {
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.formEl.querySelector('#story-title').value.trim();
      const desc = this.formEl.querySelector('#story-desc').value.trim();
      handler({ title, desc });
    });
  }

  onRemovePhoto(handler) {
    this.removeBtn.addEventListener('click', handler);
  }

  showPreview(blobOrFile) {
    this.previewEl.src = URL.createObjectURL(blobOrFile);
    this.previewEl.classList.add('show');
    this.removeBtn.classList.remove('hidden');
  }

  showMessage(text, type = 'info') {
    this.messageEl.textContent = text;
    this.messageEl.className = `message ${type}`;
  }

  toggleCameraMode(isActive) {
    this.video.classList.toggle('hidden', !isActive);
    this.captureBtn.classList.toggle('hidden', !isActive);
    this.stopBtn.classList.toggle('hidden', !isActive);
    this.cameraBtn.classList.toggle('hidden', isActive);
  }

  resetForm() {
    this.formEl.reset();
    this.previewEl.src = '';
    this.previewEl.classList.remove('show');
    this.removeBtn.classList.add('hidden');
  }
}
