import DetailPresenter from "../../presenters/detail-presenter";
import DetailView from "../../views/detail-view";

export default class DetailPage {
  async render() {
    return `
      <section class="container detail-page">
        <a href="#/" class="btn-back" aria-label="Go back to home page">
          <svg xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </a>
        
        <h1 class="page-title"> Story Detail</h1>
        <div id="detail-container" class="detail-wrapper"></div>
      </section>
    `;
  }

  async afterRender() {
    const view = new DetailView({
      container: document.querySelector('#detail-container'),
    });

    const presenter = new DetailPresenter({ view });
    presenter.init();
  }
}
