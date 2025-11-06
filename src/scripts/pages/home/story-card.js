export default function StoryCard(story) {
  const desc =
    story.description.length > 120 ? story.description.slice(0, 120) + '...' : story.description;

  return `
    <article class="story-card" data-id="${story.id}" tabindex="0">
      <img src="${story.photoUrl}" alt="Story photo from ${story.name}" class="story-img" />
      <div class="story-content">
        <h2 class="story-title">${story.name}</h2>
        <p class="story-desc">${desc}</p>
        <p class="story-date">${new Date(story.createdAt).toLocaleString('id-ID')}</p>
        <button class="btn-read" data-id="${story.id}">Read More</button>
      </div>
    </article>
  `;
}
