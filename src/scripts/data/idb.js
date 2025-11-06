import { openDB } from 'idb';
import { getAllStories } from './story-api';

const DATABASE_NAME = 'story-db';
const DATABASE_VERSION = 2;
const STORY_STORE = 'stories';
const FAVORITE_STORE = 'favorites';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORY_STORE)) {
      const store = database.createObjectStore(STORY_STORE, { keyPath: 'id' });
      store.createIndex('by-date', 'createdAt');
    }

    if (!database.objectStoreNames.contains(FAVORITE_STORE)) {
      database.createObjectStore(FAVORITE_STORE, { keyPath: 'id' });
    }

    if (!database.objectStoreNames.contains('pending-stories')) {
      database.createObjectStore('pending-stories', { keyPath: 'tempId' });
    }
  },
});

export const StoryDB = {
  async getAllStories() {
    return (await dbPromise).getAll(STORY_STORE);
  },
  async getStory(id) {
    return (await dbPromise).get(STORY_STORE, id);
  },
  async putStory(story) {
    return (await dbPromise).put(STORY_STORE, story);
  },
  async deleteStory(id) {
    return (await dbPromise).delete(STORY_STORE, id);
  },

  async getFavorites() {
    return (await dbPromise).getAll(FAVORITE_STORE);
  },
  async getFavorite(id) {
    return (await dbPromise).get(FAVORITE_STORE, id);
  },
  async putFavorite(story) {
    return (await dbPromise).put(FAVORITE_STORE, story);
  },
  async deleteFavorite(id) {
    return (await dbPromise).delete(FAVORITE_STORE, id);
  },
};
