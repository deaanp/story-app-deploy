import { getFavorites, removeFavorite } from '../pages/favorite/favorite-service';

export default class FavoritePresenter {
  constructor({ view }) {
    this.view = view;
  }

  init() {
    this._render();
    this._setupHandlers();
  }

  _render() {
    const favorites = getFavorites();
    this.view.renderFavorites(favorites);
  }

  _setupHandlers() {
    this.view.bindRemoveFavorite(async (id) => {
      const confirmed = await this.view.confirmRemove();
      if (confirmed) {
        removeFavorite(id);
        this._render();
        this.view.showRemovedMessage();
      }
    });
  }
}
