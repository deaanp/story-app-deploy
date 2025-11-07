import { getFavorites, removeFavorite } from '../pages/favorite/favorite-service';

export default class FavoritePresenter {
  constructor({ view }) {
    this.view = view;
  }

  async init() {
    await this._render();
    this._setupHandlers();
  }

  async _render() {
    const favorites = await getFavorites();
    this.view.renderFavorites(favorites || []);
  }

  _setupHandlers() {
    this.view.bindRemoveFavorite(async (id) => {
      const confirmed = await this.view.confirmRemove();
      if (confirmed) {
        await removeFavorite(id);
        await this._render();
        this.view.showRemovedMessage();
      }
    });
  }
}
