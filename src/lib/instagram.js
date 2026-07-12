const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { SCHEDULED_FILE } = require('../config');
const { readJSON, writeJSON } = require('./jsonStore');
const { getAccount } = require('./brand');
const { updateContentStatus } = require('./content');

// ── Instagram ─────────────────────────────────────────────────────────────
async function publishSingle(account, imageUrl, caption) {
  const { id: accountId, token } = account;
  const cr = await fetch('https://graph.facebook.com/v19.0/' + accountId + '/media?image_url=' + encodeURIComponent(imageUrl) + '&caption=' + encodeURIComponent(caption) + '&access_token=' + token, { method: 'POST' });
  const { id: containerId, error } = await cr.json();
  if (error) throw new Error(error.message);
  await new Promise(r => setTimeout(r, 5000));
  const pr = await fetch('https://graph.facebook.com/v19.0/' + accountId + '/media_publish?creation_id=' + containerId + '&access_token=' + token, { method: 'POST' });
  return pr.json();
}

async function publishCarousel(account, imageUrls, caption) {
  const { id: accountId, token } = account;
  const childIds = [];
  for (const url of imageUrls) {
    const r = await fetch('https://graph.facebook.com/v19.0/' + accountId + '/media?image_url=' + encodeURIComponent(url) + '&is_carousel_item=true&access_token=' + token, { method: 'POST' });
    const { id, error } = await r.json();
    if (error) throw new Error(error.message);
    childIds.push(id);
  }
  const cr = await fetch('https://graph.facebook.com/v19.0/' + accountId + '/media?media_type=CAROUSEL&children=' + childIds.join(',') + '&caption=' + encodeURIComponent(caption) + '&access_token=' + token, { method: 'POST' });
  const { id: carouselId, error: cerr } = await cr.json();
  if (cerr) throw new Error(cerr.message);
  await new Promise(r => setTimeout(r, 8000));
  const pr = await fetch('https://graph.facebook.com/v19.0/' + accountId + '/media_publish?creation_id=' + carouselId + '&access_token=' + token, { method: 'POST' });
  return pr.json();
}

async function processScheduledPosts() {
  const posts = readJSON(SCHEDULED_FILE);
  const now   = new Date();
  let changed = false;
  for (const post of posts) {
    if (post.status !== 'pending') continue;
    if (new Date(post.scheduledAt) > now) continue;
    try {
      const account = getAccount(post.profile);
      let result;
      if (post.type === 'carousel' || post.type === 'carrossel') {
        result = await publishCarousel(account, post.imageUrls, post.caption);
      } else {
        result = await publishSingle(account, post.imageUrl || post.imageUrls?.[0], post.caption);
      }
      post.status      = result.error ? 'error' : 'published';
      post.publishedAt = new Date().toISOString();
      post.instagramId = result.id;
      if (post.contentId) updateContentStatus(post.contentId, 'publicado', { publishedAt: post.publishedAt, instagramId: result.id });
      changed = true;
    } catch(err) { post.status = 'error'; post.error = err.message; changed = true; }
  }
  if (changed) writeJSON(SCHEDULED_FILE, posts);
  return posts;
}

module.exports = { publishSingle, publishCarousel, processScheduledPosts };
