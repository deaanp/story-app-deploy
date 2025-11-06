import CONFIG from '../config';

async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      return result;
    }

    return result;
  } catch (error) {
    return { error: true, message: 'Connection failed. Please try again' };
  }
}

export async function registerUser({ name, email, password }) {
  return fetchWithErrorHandling(`${CONFIG.BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return fetchWithErrorHandling(`${CONFIG.BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function getAllStories({ token, withLocation = 0 }) {
  return fetchWithErrorHandling(`${CONFIG.BASE_URL}/stories?location=${withLocation}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getStoryDetail(id, token) {
  return fetchWithErrorHandling(`${CONFIG.BASE_URL}/stories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addNewStory({ description, photo, lat, lon, token }) {
  const formData = new FormData();
  formData.append('description', description);
  if (photo) formData.append('photo', photo);
  if (lat && lon) {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }

  return fetchWithErrorHandling(`${CONFIG.BASE_URL}/stories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export async function subscribeNotification({ token, endpoint, keys }) {
  return fetchWithErrorHandling(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, keys }),
  });
}

export async function unsubscribeNotification({ token, endpoint }) {
  return fetchWithErrorHandling(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });
}
