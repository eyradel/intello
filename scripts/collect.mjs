import { ghanaScraper } from '../src/services/scraper/ghanaScraperEngine.js';
const once = process.argv.includes('--once');
const interval = Math.max(300000, Number(process.env.GHANA_POLL_MS) || 900000);
let timer;
let stopped = false;
async function collect() {
  try { console.log(JSON.stringify(await ghanaScraper.runFullScrapePipeline())); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
  if (!once && !stopped) timer = setTimeout(collect, interval);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { stopped = true; clearTimeout(timer); });
await collect();
