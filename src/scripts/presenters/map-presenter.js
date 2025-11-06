import { fetchStoriesWithLocation } from '../pages/map/map-service';

export default class MapPresenter {
  constructor({ view, token }) {
    this.view = view;
    this.token = token;
  }

  async init() {
    this.view.renderMap();
    this.view.bindMarkerClick(this._handleMarkerClick.bind(this));
    await this._loadStories();
  }

  async _loadStories() {
    try {
      const stories = await fetchStoriesWithLocation(this.token);
      this.view.renderMarkers(stories);
    } catch (err) {
      this.view._showMessage('Failed to load story location data');
    }
  }

  _handleMarkerClick(storyId) {
    location.hash = `#/detail/${storyId}`;
  }
}
