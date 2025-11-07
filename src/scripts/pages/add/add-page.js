import Camera from '../../utils/camera';
import AddPresenter from '../../presenters/add-presenter';
import AddView from '../../views/add-view';
import { createInteractiveMap } from '../../utils/map';

export default class AddPage {
  async render() {
    return `
      <section class="add-page">
        <div class="add-form">
          <h1 class="page-title">Add new story</h1>
          
          <form id="add-story-form" class="add-form-content">

            <div class="form-group">
              <label for="story-title">Story Title</label>
              <input 
                type="text" 
                id="story-title" 
                placeholder="Enter your story title" 
                required 
              />
            </div>
              
            <div class="form-group">
              <label for="story-desc">Description</label>
              <textarea 
                id="story-desc" 
                placeholder="Write your story..." 
                required
              ></textarea>
            </div>
            
            <div class="form-group">  
              <label for="story-photo">Upload Photo</label>
              <div class="file-input-wrapper">
                <input 
                  type="file" 
                  id="story-photo" 
                  accept="image/*" 
                  aria-label="Select photo to upload" 
                />
                <span id="file-name" class="file-name">No file chosen</span>
              </div>
              <img id="photo-preview" alt="Story photo preview" class="preview-img" />
              <button type="button" id="remove-photo" class="btn-danger hidden" aria-label="Remove selected photo">Remove photo</button>
            </div>
              
            <div class="camera-section">
              <h2 class="section-title">Or Use Camera</h2>
              <video id="video" autoplay class="hidden" aria-label="Camera viewfinder"></video>
              <canvas id="canvas" class="hidden" aria-label="Captured photo"></canvas>
              <div class="camera-buttons">
                <button type="button" id="open-camera" class="btn-secondary" aria-label="Open camera">Use camera</button>
                <button type="button" id="capture-photo" class="btn-primary hidden" aria-label="Capture photo">Take a picture</button>
                <button type="button" id="stop-camera" class="btn-danger hidden" aria-label="Stop camera">Stop camera</button>
              </div>
            </div>
              
            <div id="add-map" class="map" role="region" aria-label="Select story location"></div>
              
            <button type="submit" class="btn-primary submit-btn">Save story</button>
          </form>
          
          <p id="add-message" class="message" aria-live="polite"></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const camera = new Camera({
      videoEl: document.querySelector('#video'),
      canvasEl: document.querySelector('#canvas'),
    });

    const map = createInteractiveMap('add-map');

    const view = new AddView({
      formEl: document.querySelector('#add-story-form'),
      messageEl: document.querySelector('#add-message'),
      camera,
      map,
    });

    const presenter = new AddPresenter({ view, camera, map });
    presenter.init();

    window.addEventListener('beforeunload', () => camera.stop());
  }
}
