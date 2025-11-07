import { getStoryDetail } from '../data/story-api';
import { getAuthData } from '../auth/auth-service';
import { parseActivePathname } from '../routes/url-parser';
import { saveFavorite, removeFavorite, isFavorite } from '../pages/favorite/favorite-service';

export default class DetailPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async init() {
    const auth = getAuthData();
    if (!auth) {
      location.hash = '#/login';
      return;
    }

    const { id } = parseActivePathname();
    await this._loadStory(auth.token, id);
  }

  async _loadStory(token, id) {
    try {
      const res = await getStoryDetail(id, token);

      if (res.error) {
        this.view.showError('Story Not Found', 'The requested story could not be loaded');
        this.view.showMessage('Story not found');
        return;
      }

      const story = res.story;
      let isFav = await isFavorite(story.id);

      const renderWithHandler = async () => {
        this.view.renderStory(story, isFav);

        this.view.onFavoriteClick(async () => {
          const currentlyFav = await isFavorite(story.id);

          if (currentlyFav) {
            await removeFavorite(story.id);
            isFav = false;
            this.view.showInfo('Removed from Favorites', `"${story.name}" was removed`);
          } else {
            await saveFavorite(story);
            isFav = true;
            this.view.showSuccess('Added to Favorites!', `"${story.name}" added successfully`);
          }

          await renderWithHandler();
        });
      };

      await renderWithHandler();

    } catch (err) {
      console.error('DETAIL ERROR:', err);
      this.view.showMessage('Failed to load story');
      this.view.showError('Failed to Load Story', 'Please try again later');
    }
  }
}
