import { getAllStories } from '../data/story-api';
import { getAuthData } from '../auth/auth-service';
import { StoryDB } from '../data/idb';

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
      // const localStories = await StoryDB.getAllStories();
      // if (localStories.length > 0) {
      //   this.view.renderStories(localStories);
      // }

      const localStories = await StoryDB.getAllStories();
      this.view.renderStories(localStories); // offline-first

      const res = await getAllStories({ token: auth.token });
      this.stories = res.listStory || [];

      for (const story of this.stories) {
        await StoryDB.putStory(story);
      }

      const updatedStories = await StoryDB.getAllStories();
      this.view.renderStories(updatedStories);

    } catch (err) {
      console.error('Failed to load stories:', err);
      const cached = await StoryDB.getAllStories();
      if (cached.length > 0) {
        this.view.renderStories(cached);
      } else {
        this.view.showError('Failed to load stories. Please try again.');
      }
    }
  }

  _handleSearchFilter({ query, sort }) {
    let filtered = this.stories.filter(
      (s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
    );

    if (sort === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    this.view.renderStories(filtered);
  }
}
