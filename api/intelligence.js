import { GhanaScraperEngine, GHANA_FEED_REGISTRY } from '../src/services/scraper/ghanaScraperEngine.js';
import { createVercelHandler } from '../src/server/vercelHandler.js';

// Serverless collection is request-driven, with no background timers or disk writes.
const engine = new GhanaScraperEngine({
  persist: false,
  feeds: GHANA_FEED_REGISTRY.filter(feed => ['3news', 'myjoyonline'].includes(feed.id))
});
export default createVercelHandler(engine);
