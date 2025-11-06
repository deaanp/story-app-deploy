import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// dasar map
export function initMap(containerId, center = [-2.5, 118], zoom = 5) {
  const map = L.map(containerId).setView(center, zoom);

  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; CartoDB',
  });

  const baseMaps = {
    'OSM Default': osm,
    'Carto Light': carto,
  };

  L.control.layers(baseMaps).addTo(map);

  return { map };
}

// map interaktif
export function createInteractiveMap(containerId, defaultLat = -2.5, defaultLon = 118) {
  const map = L.map(containerId).setView([defaultLat, defaultLon], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  let marker;
  return {
    map,
    onClick(handler) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (marker) map.removeLayer(marker);

        const storyIcon = L.icon({
          iconUrl: './icons/marker-story.png',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        marker = L.marker([lat, lng], { icon: storyIcon })
          .addTo(map)
          .bindPopup(`Location set at (${lat.toFixed(2)}, ${lng.toFixed(2)})`)
          .openPopup();

        handler(lat, lng);
      });
    },
  };
}