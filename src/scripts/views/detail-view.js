import L from 'leaflet';
import { initMap } from "../utils/map";
import Swal from 'sweetalert2';

export default class DetailView {
  constructor({ container }) {
    this.container = container;
    this._onFavoriteClick = null;
  }

  renderStory(story, isFav) {
    const mapSection = story.lat && story.lon ? `<div id="detail-map" class="map-mini"></div>` : '';

    this.container.innerHTML = `
      <article class="detail-card">
        <img src="${story.photoUrl}" alt="Story photo by ${story.name}" class="detail-img" />
        <div class="detail-content">
          <h1>${story.name}</h1>
          <p class="detail-date">${new Date(story.createdAt).toLocaleString('id-ID')}</p>
          <p class="detail-desc">${story.description}</p>
          <button id="fav-btn" class="btn-fav">
            ${isFav ? 'Remove from favorite' : 'Add to favorite'}
          </button>
        </div>
        ${mapSection}
      </article>
    `;

    this._bindFavoriteButton(story);
    if (story.lat && story.lon) {
      setTimeout(() => {
        this._renderMap(story.lat, story.lon, story.name);
      }, 100);
    }
  }

  _bindFavoriteButton(story) {
    const favBtn = this.container.querySelector('#fav-btn');
    favBtn.addEventListener('click', () => {
      if (this._onFavoriteClick) {
        this._onFavoriteClick(story);
      }
    });
  }

  onFavoriteClick(handler) {
    this._onFavoriteClick = handler;
  }

  _renderMap(lat, lon, name) {
    const mapContainer = document.getElementById('detail-map');
    if (!mapContainer) {
      console.warn('Map container not found, skipping map render');
      return;
    }

    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }
    
    const { map } = initMap('detail-map', [lat, lon], 10);
    const storyIcon = L.icon({
      iconUrl: './icons/marker-story.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -32],
    });
    L.marker([lat, lon], { icon: storyIcon })
      .addTo(map)
      .bindPopup(`<b>${name}</b>`)
      .openPopup();
  }

  showMessage(message) {
    this.container.innerHTML = `<p>${message}</p>`;
  }

  showError(title, text) {
    Swal.fire({
      icon: 'error',
      title,
      text,
    });
  }

  showInfo(title, text) {
    Swal.fire({
      icon: 'info',
      title,
      text,
      showConfirmButton: false,
      timer: 2000,
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
}