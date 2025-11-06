const AUTH_KEY = 'storyapp:auth';

export function saveAuthData({ userId, name, token }) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ userId, name, token }));
}

export function getAuthData() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearAuthData() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  const data = getAuthData();
  return data && data.token;
}
