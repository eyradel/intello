import config from '../../config/publicSources.json' with { type: 'json' };

export function validateSocialFeeds(feeds) {
  if (!Array.isArray(feeds) || feeds.length > 2) throw new Error('Configure at most two authorized social feeds per deployment.');
  const ids = new Set();
  return feeds.map(feed => {
    const url = new URL(feed.url);
    if (!/^[a-z0-9][a-z0-9-]{2,60}$/.test(feed.id) || ids.has(feed.id)) throw new Error('Social feed IDs must be unique lowercase identifiers.');
    ids.add(feed.id);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname) || /\.(local|internal|localhost)$/i.test(url.hostname)) throw new Error('Use an approved public HTTPS feed URL.');
    if (!['facebook', 'x', 'instagram', 'youtube'].includes(feed.socialPlatform) || feed.publicContent !== true || typeof feed.permissionBasis !== 'string' || feed.permissionBasis.trim().length < 8) throw new Error('Document the social platform, public content scope and permission basis.');
    if (typeof feed.name !== 'string' || !feed.name.trim()) throw new Error('A source name is required.');
    return { ...feed, url: url.href, isAuthorizedSocialFeed: true };
  });
}
export const AUTHORIZED_SOCIAL_FEEDS = validateSocialFeeds(config.feeds);
