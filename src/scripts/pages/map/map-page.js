import { getAuthData } from '../../auth/auth-service';
import MapPresenter from '../../presenters/map-presenter';
import MapView from '../../views/map-view';

export default class MapPage {
  async render() {
    return `
      <section class="container">
        <h1 id="map-heading">Explore stories on the Map</h1>
        <div 
          id="map" 
          class="map-container"
          role="region"
          aria-labelledby="map-heading"
        ></div>

        <p id="map-message" class="message" aria-live="polite"></p>
      </section>
    `;
  }

  async afterRender() {
    const auth = getAuthData();

    if (!auth || !auth.token) {
      alert('Please log in to access the map');
      location.hash = '#/login';
      return;
    }

    const view = new MapView({
      mapContainer: document.getElementById('map'),
      messageEl: document.getElementById('map-message'),
    });

    const presenter = new MapPresenter({ 
      view, 
      token: auth.token,
    });
    
    presenter.init();
  }
}
