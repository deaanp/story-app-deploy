import { getAllStories } from '../data/story-api';
import { getAuthData } from '../auth/auth-service';

export default class HomePresenter {
  constructor({ view }) {
    this.view = view;
    this.stories = [];

    this.view.bindSearchFilter(this._handleSearchFilter.bind(this));
  }

  async init() {
    const auth = getAuthData();
    if (!auth) {
      location.hash = '#/login';
      return;
    }

    this.view.showLoading();

    try {
      await this._fetchStories(auth.token);

      if (this.stories.length === 0) {
        this.view.showEmpty();
      } else {
        this.view.renderStories(this.stories);
      }
    } catch (err) {
      this.view.showError('Failed to load stories. Please try again.');
    }
  }

  async _fetchStories(token) {
    try {
      const res = await getAllStories({ token, location: 1 });
      console.log('Response from API:', res);
      this.stories = res.listStory || [];
    } catch (err) {
      console.error('Failed fetch stories:', err);
      this.stories = [];
    }
  }

  _handleSearchFilter({ query, sort }) {
    let filtered = this.stories.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    );

    if (sort === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    this.view.renderStories(filtered);
  }

  _handleRead(id) {
    console.log('story clicked', id);
  }
}
