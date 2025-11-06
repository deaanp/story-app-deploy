import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class MapView {
  constructor({ mapContainer, messageEl }) {
    this.mapContainer = mapContainer;
    this.messageEl = messageEl;
    this.map = null;
    this.onMarkerClick = null;
  }

  renderMap() {
    this.map = L.map(this.mapContainer).setView([-2.5, 118], 5);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });

    const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB Dark',
    });

    osm.addTo(this.map);
    L.control.layers({ OSM: osm, Dark: dark }).addTo(this.map);
  }

  renderMarkers(stories) {
    if (!stories || stories.length === 0) {
      this._showMessage('There are no stories with location data');
      return;
    }

    const storyIcon = L.icon({
      iconUrl: './icons/marker-story.png',
      iconSize: [40,40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -32],
    });

    const bounds = [];

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon], { icon: storyIcon }).addTo(this.map);

        const popupHTML = `
          <div style="max-width:200px">
            <img src="${story.photoUrl}" alt="Story photo ${story.name}" style="width:100%;border-radius:6px;"/>
            <h4>${story.name}</h4>
            <p>${story.description.slice(0, 80)}...</p>
            <button
              class="map-detail-btn"
              data-id="${story.id}"
              style="padding:4px 8px; background:#0077cc;color:#fff;border:none;border-radius:4px;cursor:pointer;">
              See detail
            <button>
          </div>
        `;

        marker.bindPopup(popupHTML);
        marker.on('popupopen', () => {
          setTimeout(() => {
            const btn = document.querySelector('.map-detail-btn');
            if (btn && this.onMarkerClick) {
              btn.addEventListener('click', () => this.onMarkerClick(btn.dataset.id));
            }
          }, 100);
        });

        bounds.push([story.lat, story.lon]);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  bindMarkerClick(handler) {
    this.onMarkerClick = handler;
  }

  _showMessage(text) {
    if (this.messageEl) {
      this.messageEl.textContent = text;
    } else {
      alert(text);
    }
  }
}