import HomePresenter from "../../presenters/home-presenter";
import HomeView from "../../views/home-view";
import { StoryDB } from "../../data/idb";
import { getAllStories } from '../../data/story-api';

export default class HomePage {
  async render() {
    return `
      <section class="container home-page">
        <h1 class="page-title">Discover Stories</h1>

        <div class="toolbar">
          <input id="search-input" type="text" placeholder="Search story..." />
          <select id="filter-select">
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        
        <div id="story-list" class="story-grid"></div>
      </section>
    `;
  }

  async afterRender() {
    const listContainer = document.querySelector('#story-list');
    const searchInput = document.querySelector('#search-input');
    const filterSelect = document.querySelector('#filter-select');

    const view = new HomeView({
      listContainer,
      searchInput,
      filterSelect,
    });

    const presenter = new HomePresenter({ view });
    presenter.init();

    try {
      const stories = await getAllStories();
      for (const story of stories) {
        await StoryDB.putStory(story);
      }

      this._renderStories(stories);
    } catch (error) {
      console.warn('Offline mode, showing cached stories');
      const cachedStories = await StoryDB.getAllStories();
      this._renderStories(cachedStories);
    }

    searchInput.addEventListener('input', async (e) => {
      const keyword = e.target.value.toLowerCase();
      const allStories = await StoryDB.getAllStories();
      const filtered = allStories.filter((story) =>
        story.name.toLowerCase().includes(keyword)
      );
      this._renderStories(filtered);
    });

    filterSelect.addEventListener('change', async (e) => {
      const value = e.target.value;
      const allStories = await StoryDB.getAllStories();
      const sorted = [...allStories].sort((a, b) =>
        value === 'latest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
      );

      this._renderStories(sorted);
    });
  }

  _renderStories(stories) {
    const container = document.getElementById('story-list');
    if (!stories || stories.length === 0) {
      container.innerHTML = `<p class="empty-message">No stories found</p>`;
      return;
    }

    container.innerHTML = stories.map(s => `
      <article>
        <h3>${s.name}</h3>
        <p>${s.description}</p>
      </article>
    `).join('');
  }
}