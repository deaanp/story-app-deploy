import { loginUser } from '../data/story-api';
import { saveAuthData } from './auth-service';
import { requestNotificationPermission, subscribePush } from '../utils/push-notification';
import '../../styles/auth-styles.css';

export default class LoginPage {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-tabs">
          <a href="#/login" class="active">Login</a>
          <a href="#/register">Register</a>
        </div>
        <h1>Please Log In to Continue</h1>
        <form id="login-form">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" placeholder="Enter your email" autocomplete="username" required />

          <label for="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required />

          <button type="submit" aria-label="Log in to your account"><i class="fa fa-sign-in"></i> Login</button>
          <p id="login-message" class="message" aria-live="polite"></p>
        </form>
        <div id="loader" class="loader"></div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#login-form');
    const message = document.querySelector('#login-message');
    const loader = document.querySelector('#loader');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      message.textContent = '';

      const email = form.email.value.trim();
      const password = form.password.value.trim();

      if (!email || !password) {
        message.textContent = 'Please make sure every field is filled in';
        return;
      }

      loader.classList.add('show');
      form.querySelector('button').disabled = true;

      try {
        const res = await loginUser({ email, password });

        if (res.error) {
          const msg = res.message.toLowerCase();

          if (msg.includes('not found')) {
            message.textContent = 'Account not found. Please register first';
            setTimeout(() => {
              location.hash = '#/register';
            }, 1200);
          } else if (msg.includes('invalid password')) {
            message.textContent = 'Incorrect password. Please try again';
          } else {
            message.textContent = 'Login failed' + res.message;
          }
          return;
        }

        const { userId, name, token } = res.loginResult;
        saveAuthData({ userId, name, token });

        try {
          if (Notification.permission !== 'granted') {
            await requestNotificationPermission();
          }
          await subscribePush(token);
        } catch (notifErr) {
          console.warn('Notification setup skipped:', notifErr);
        }

        message.textContent = 'Login Success! Redirecting...';
        setTimeout(() => {
          const redirectTarget = localStorage.getItem('redirectAfterLogin');
          if (redirectTarget) {
            localStorage.removeItem('redirectAfterLogin');
            location.hash = redirectTarget;
          } else {
            location.hash = '#/';
          }
        }, 1000);
      } catch (err) {
        message.textContent = 'Oops! We couldnt log you in. Please check your connection';
      } finally {
        loader.classList.remove('show');
        form.querySelector('button').disabled = false;
      }
    });
  }
}
