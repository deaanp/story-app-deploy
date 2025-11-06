import { StoryDB } from "../../data/idb";

export async function getFavorites() {
  return await StoryDB.getFavorites();
}

export async function saveFavorite(story) {
  await StoryDB.putFavorite(story);
}

export async function removeFavorite(id) {
  await StoryDB.deleteFavorite(id);
}

export async function isFavorite(id) {
  const story = await StoryDB.getFavorite(id);
  return !!story;
}