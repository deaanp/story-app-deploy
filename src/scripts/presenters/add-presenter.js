import { addNewStory } from '../data/story-api';
import { getAuthData } from '../auth/auth-service';
import { openDB } from 'idb';
import { StoryDB } from '../data/idb';

export default class AddPresenter {
  constructor({ view, camera, map }) {
    this.view = view;
    this.camera = camera;
    this.map = map;
    this.imageBlob = null;
    this.lat = null;
    this.lon = null;
  }

  async init() {
    const auth = getAuthData();
    if (!auth) {
      location.hash = '#/login';
      return;
    }

    this._setupMap();
    this._setupViewListeners(auth.token);
  }

  _setupMap() {
    this.map.onClick((lat, lon) => {
      this.lat = lat;
      this.lon = lon;
    });
  }

  _setupViewListeners(token) {
    this.view.onFileSelected((file) => {
      if (file.size > 1024 * 1024) {
        this.view.showWarning('File too large!', 'Image must not exceed 1MB');
        return;
      }
      this.imageBlob = file;
      this.view.showPreview(file);
    });

    this.view.onOpenCamera(async () => {
      this.view.resetForm();
      await this.camera.start();
      this.view.toggleCameraMode(true);
    });

    this.view.onCapturePhoto(async () => {
      const blob = await this.camera.capture();
      this.imageBlob = blob;
      this.view.showPreview(blob);
      this.camera.stop();
      this.view.toggleCameraMode(false);
    });

    this.view.onStopCamera(() => {
      this.camera.stop();
      this.view.toggleCameraMode(false);
    });

    this.view.onRemovePhoto(() => {
      this.imageBlob = null;
      this.view.resetForm();
      this.view.showMessage('Photo removed', 'info');
    });

    this.view.onSubmit(async ({ title, desc }) => {
      if (!desc || !title || !this.imageBlob) {
        this.view.showWarning(
          'Incomplete Form',
          'Please fill out all fields and select a photo!'
        );
        return;
      }

      if (!this.lat || !this.lon) {
        this.view.showInfo(
          'Location Missing',
          'Click on the map to set the story location!'
        );
        return;
      }

      let res;

      try {
        res = await addNewStory({
          token,
          description: `${title} = ${desc}`,
          photo: this.imageBlob,
          lat: this.lat,
          lon: this.lon,
        });

        if (!res || res.error || res.status === 202) {
          throw new Error('Offline or failed response');
        }

        if (res.story) {
          await StoryDB.putStory(res.story);
        }

        this.view.showSuccess(
          'Story Added!',
          'Your new story has been successfully posted'
        );
        this.view.resetForm();

        setTimeout(() => {
          location.hash = '#/';
        }, 1000);
      } catch (err) {
        console.warn('[AddPresenter] Offline detected, saving story locally...', err);
        await this._saveStoryOffline(token, title, desc);
      }
    });
  }

  async _saveStoryOffline(token, title, desc) {
    const blobToBase64 = (blob) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);          reader.readAsDataURL(blob);
      });

    const imageBase64 = await blobToBase64(this.imageBlob); 
    const tempId = Date.now();

    const db = await openDB('story-db', 2);
    const tx = db.transaction(['pending-stories', 'stories'], 'readwrite');
    const pendingStore = tx.objectStore('pending-stories');
    const storiesStore = tx.objectStore('stories');

    pendingStore.put({
      tempId,
      title,
      desc,
      imageBase64,
      lat: this.lat,
      lon: this.lon,
      token,
    });

    storiesStore.put({
      id: `temp-${tempId}`,
      name: title,
      description: desc,
      createdAt: new Date().toISOString(),
      photoUrl: imageBase64,
    });

    await tx.done;

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-pending-stories');
      console.log('[AddPresenter] Story saved locally & sync registered');

      this.view.showInfo(
        'Offline Mode',
        'Your story will be uploaded once you’re online'
      );
    } else {
      this.view.showError(
        'Offline',
        'Your browser does not support background sync'
      );
    }
  }
}