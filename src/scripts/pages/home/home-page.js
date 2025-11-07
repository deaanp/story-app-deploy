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
          <div class="form-group">
            <label for="search-input">Search Story:</label>
            <input 
              id="search-input" 
              type="text" 
              placeholder="Search story..." 
              aria-label="Search story by title" 
            />
          </div>

          <div class="form-group">
            <label for="filter-select">Sort Stories:</label>
            <select id="filter-select" aria-label="Select sort order">
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
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
    await presenter.init();

    searchInput.addEventListener('input', async (e) => {
      const keyword = e.target.value.toLowerCase();
      const allStories = await StoryDB.getAllStories();
      const filtered = allStories.filter((story) =>
        story.name.toLowerCase().includes(keyword)
      );
      view.renderStories(filtered);
    });

    filterSelect.addEventListener('change', async (e) => {
      const value = e.target.value;
      const allStories = await StoryDB.getAllStories();
      const sorted = [...allStories].sort((a, b) =>
        value === 'latest'
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
      view.renderStories(sorted);
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
