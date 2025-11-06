import FavoritePresenter from "../../presenters/favorite-presenter";
import FavoriteView from "../../views/favorite-view";

export default class FavoritePage {
  async render() {
    return `
      <section class="container favorite-page">
        <h1>My Favorite Story</h1>
        <div id="favorite-container" class="favorite-grid"></div>
      </section>
    `;
  }

  async afterRender() {
    const container = document.querySelector('#favorite-container');
    const view = new FavoriteView(container);
    const presenter = new FavoritePresenter({ view });

    presenter.init();
  }
}
