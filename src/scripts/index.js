// CSS imports
import '../styles/styles.css';
import { useViewTransition } from './utils/view-transition';
import App from './pages/app';
import { clearAuthData } from './auth/auth-service';
import { requestNotificationPermission, subscribePush, unsubscribePush } from './utils/push-notification';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const isLoggedIn = !!localStorage.getItem('authData');
  if (isLoggedIn) {
    location.hash = '#/';
  } else {
    location.hash = '#/login';
  }

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await useViewTransition(async () => {
      await app.renderPage();
    });
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const base = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
      const registration = await navigator.serviceWorker.register(`${base}sw.js`);

      console.log('Service Worker registered with scope:', registration.scope);

      registration.onupdatefound = () => {
        const newWorker = registration.installing;
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker available, refreshing...');
            newWorker.postMessage({ action: 'skipWaiting' });
            window.location.reload();
          }
        };
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const isLoggedIn = !!localStorage.getItem('authData');
  if (!isLoggedIn) {
    console.log('Install button hidden: user not logged in');
    return;
  }

  const existing = document.querySelector('.install-btn');
  if (existing) return;

  const installBtn = document.createElement('button');
  installBtn.textContent = 'Install Story App';
  installBtn.classList.add('install-btn');
  document.body.appendChild(installBtn);

  installBtn.addEventListener('click', async () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;
    console.log(
      choice.outcome === 'accepted'
        ? 'User accepted install prompt'
        : 'User dismissed install prompt'
    );

    deferredPrompt = null;
  });
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'logout-link') {
    e.preventDefault();
    clearAuthData();
    location.hash = '#/login';
  }
});
