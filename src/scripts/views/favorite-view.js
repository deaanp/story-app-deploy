import { icon } from "leaflet";
import Swal from "sweetalert2";

export default class FavoriteView {
  constructor(container) {
    this.container = container;
  }

  renderFavorites(favorites) {
    if (!favorites.length) {
      this.container.innerHTML = `
        <p class="favorite-empty">
          You don't have a favorite story yet. Discover one you love!
        </p>
    `;
    return;
    }

    this.container.innerHTML = favorites.map(
      (story) => `
      <article class="fav-card" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="Favorite story photo ${story.name}" class="fav-img" />
        <div class="fav-content">
          <h2>${story.name}</h2>
          <p>${story.description.slice(0, 80)}...</p>
          <div class="fav-actions">
            <button class="btn-remove" data-id="${story.id}">Remove</button>
          </div>
        </div>
      </article>
      `
    ).join('');
  }

  bindRemoveFavorite(handler) {
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove')) {
        const id = e.target.dataset.id;
        handler(id);
      }
    });
  }

  async confirmRemove() {
    const result = await Swal.fire({
      title: 'Remove this story?',
      text: 'It will be deleted from your favorite list',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    });
    return result.isConfirmed;
  }

  showRemovedMessage() {
    Swal.fire({
      icon: 'success',
      title: 'Removed!',
      text: 'The story has been removed from favorites',
      showCloseButton: false,
      timer: 1800,
    });
  }
}