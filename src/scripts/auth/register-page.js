import { registerUser } from '../data/story-api';
import '../../styles/auth-styles.css';

export default class RegisterPage {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-tabs">
          <a href="#/login">Login</a>
          <a href="#/register" class="active">Register</a>
        </div>
        <h1>Create Your Account to Begin the Story</h1>
        <form id="register-form">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" placeholder="Your Name" required />

          <label for="email">Email</label>
          <input id="email" name="email" type="email" placeholder="Your email" required />

          <label for="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Your Password" minlength="8" required />

          <label for="confirrm-password">Confirm Password</label>
          <input id="confirm-password" name="confirm-password" type="password" placeholder="Confirm your password" minglenth="8" required />

          <button type="submit">Register</button>
          <p id="register-message" class="message"></p>
        </form>
        <div id="loader" class="loader"></div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#register-form');
    const message = document.querySelector('#register-message');
    const loader = document.querySelector('#loader');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      message.textContent = '';

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();
      const confirmPassword = form['confirm-password'].value.trim();

      if (password.length < 8) {
        message.textContent = 'Password must be at least 8 characters long';
        return;
      }
      if (password !== confirmPassword) {
        message.textContent = 'Oops! Those passwords dont match';
        return;
      }

      loader.classList.add('show');
      form.querySelector('button').disabled = true;

      try {
        const res = await registerUser({ name, email, password });

        if (res.error) {
          message.textContent = `${res.message}`;
        } else {
          message.textContent = 'Woohoo! Your account is ready. Lets log you in';
          setTimeout(() => {
            location.hash = '#/login';
          }, 1200);
        }
      } catch (err) {
        message.textContent = 'Oops! We couldnt reach the server';
      } finally {
        loader.classList.remove('show');
        form.querySelector('button').disabled = false;
      }
    });
  }
}
