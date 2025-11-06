import CONFIG from '../../config';

export async function fetchStoriesWithLocation(token) {
  const response = await fetch(`${CONFIG.BASE_URL}/stories?location=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (result.error) throw new Error(result.message);
  return result.listStory;
}
