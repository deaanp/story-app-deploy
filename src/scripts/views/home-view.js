import StoryCard from "../pages/home/story-card";

export default class HomeView {
  constructor({ listContainer, searchInput, filterSelect }) {
    this.listContainer = listContainer;
    this.searchInput = searchInput;
    this.filterSelect = filterSelect;

    this.onSearchFilter = null;
    this.onRead = null;

    this._bindSearchFilter();
    this._bindReadDelegation();
  }

  renderStories(stories = []) {
    if (!stories.length) {
      this.listContainer.innerHTML = `<p>We couldn't find any stories</p>`;
      return;
    }

    this.listContainer.innerHTML = stories.map((s) => StoryCard(s)).join('');
  }

  showLoading() {
    this.listContainer.innerHTML = `<p>Loading stories...</p>`;
  }

  showError(message) {
    this.listContainer.innerHTML = `<p class="error">${message}</p>`;
  }

  showEmpty() {
    this.listContainer.innerHTML = `<p>No stories available.</p>`;
  }

  _bindReadDelegation() {
    this.listContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-read');
      if (!btn) return;
      const id = btn.dataset.id;
      if (this.onRead) {
        this.onRead(id);
      } else {
        location.hash = `#/detail/${id}`;
      }
    });
  }

  _bindSearchFilter() {
    const handler = () => {
      const query = (this.searchInput?.value || '').trim().toLowerCase();
      const sort = this.filterSelect?.value || 'latest';
      if (this.onSearchFilter) this.onSearchFilter({ query, sort });
    }

    if (this.searchInput) this.searchInput.addEventListener('input', handler);
    if (this.filterSelect) this.filterSelect.addEventListener('change', handler);
  }

  bindSearchFilter(handler) {
    this.onSearchFilter = handler;
  }

  bindRead(handler) {
    this.onRead = handler;
  }
}