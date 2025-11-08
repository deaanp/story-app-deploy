import { useViewTransition } from '../utils/view-transition';
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  requestNotificationPermission,
  subscribePush,
  unsubscribePush,
} from '../utils/push-notification';
import { getAuthData } from '../auth/auth-service';
import { icon } from 'leaflet';
import Swal from 'sweetalert2';

class App {
  constructor({ navigationDrawer, drawerButton, content }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupNotificationButton();

    window.addEventListener('hashchange', () => this.renderPage());
  }

  _setupDrawer() {
    this._drawerButton.addEventListener('click', () => {
      this._navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this._navigationDrawer.contains(event.target) &&
        !this._drawerButton.contains(event.target)
      ) {
        this._navigationDrawer.classList.remove('open');
      }
    });
  }

  _setupNotificationButton() {
    const notifBtn = document.querySelector('#enable-notif');
    if (!notifBtn) return;

    const auth = getAuthData();
    if (!auth || !auth.token) return;

    let isSubscribed = false;

    async function updateButtonState() {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      isSubscribed = !!sub;

      if (isSubscribed) {
        notifBtn.textContent = 'Disable Notifications';
        notifBtn.classList.add('active');
      } else {
        notifBtn.textContent = 'Enable Notifications';
        notifBtn.classList.remove('active');
      }
    }

    updateButtonState();

    notifBtn.addEventListener('click', async () => {
      try {
        if (!isSubscribed) {
          await requestNotificationPermission();
          await subscribePush(auth.token);
          Swal.fire({
            icon: 'success',
            title: 'Notifications Enabled!',
            text: 'You will now receive story updates',
            showConfirmButton: false,
            timer: 2000
          });
        } else {
          await unsubscribePush(auth.token);
          Swal.fire({
            icon: 'info',
            title: 'Notifications Disabled',
            text: 'You wont receive story updates anymore',
            showConfirmButton: false,
            timer: 2000
          });
        }

        await updateButtonState();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Failed to toggle notifications',
        });
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const PageClass = routes[url];

    if (!PageClass) {
      this._content.innerHTML = '<h2>404 - Page Not Found</h2>';
      return;
    }

    const page = new PageClass();

    const header = document.querySelector('header');
    const nav = header.querySelector('nav');
    const notifBtn = header.querySelector('#enable-notif');
    const logoutBtn = header.querySelector('.btn-header');

    const isAuthPage = url === '/login' || url === '/register';
    if (isAuthPage) {
      nav.style.display = 'none';
      notifBtn.style.display = 'none';
      logoutBtn.style.display = 'none';
    } else {
      nav.style.display = '';
      notifBtn.style.display = '';
      logoutBtn.style.display = '';
    }

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this._content.innerHTML = await page.render();
        await page.afterRender();
      });
      return;
    }

    const auth = getAuthData();
    if (!auth && !isAuthPage) {
      if (!localStorage.getItem('redirectAfterLogin')) {
        localStorage.setItem('redirectAfterLogin', window.location.hash);
      }
      location.hash = '#/login';
      return;
    }

    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterLogin');
      window.location.hash = redirectUrl;
      return;
    }

    await useViewTransition(async () => {
      this._content.classList.add('fade-out');
      await new Promise((resolve) => setTimeout(resolve, 300));

      this._content.innerHTML = await page.render();
      await page.afterRender();

      this._content.classList.remove('fade-out');
      this._content.classList.add('fade-in');
      setTimeout(() => this._content.classList.remove('fade-in'), 300);
    });
  }
}

export default App;