import { searchEvidence, SearchInputError } from './src/services/search/evidenceIndex.js';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ghanaScraper } from './src/services/scraper/ghanaScraperEngine.js';
import { buildPublicFigureAnalytics } from './src/services/intelligence/publicFigureAnalytics.js';
import {
  analyzeTargetAwareSentiment,
  resolveEntitiesFromText,
  runLocalThinkingReasoning,
  detectCoordinationClusters,
  extractDynamicNarratives
} from './src/services/intelligence/localThinkingEngine.js';

function ghanaIntelligencePlugin() {
  let isInitialScraped = false;

  function install(server) {
      // Trigger background initial scrape once server starts
      if (!isInitialScraped) {
        isInitialScraped = true;
        setTimeout(() => {
          ghanaScraper.runFullScrapePipeline().catch(err => {
            console.warn('[GhanaScraper] Initial scrape completed with fallback:', err.message);
          });
        }, 1500);
      }

      // Keep collection active while the development service is running.
      const collectionTimer = setInterval(() => {
        ghanaScraper.runFullScrapePipeline().catch(error => console.warn('[Collector]', error.message));
      }, 15 * 60 * 1000);
      collectionTimer.unref();
      server.httpServer?.once('close', () => clearInterval(collectionTimer));

      server.middlewares.use(async (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        const url = req.url || '';
        if (url.split('?')[0] === '/api/v1/evidence/search') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          try { res.end(JSON.stringify(searchEvidence(ghanaScraper, Object.fromEntries(new URL(url, 'http://localhost').searchParams)))); }
          catch (error) { res.statusCode = error instanceof SearchInputError ? 400 : 500; res.end(JSON.stringify({error:error.message})); }
          return;
        }


        if (url.split('?')[0] === '/api/v1/public-figures/coverage') {
          res.setHeader('Content-Type', 'application/json');
          const hours = Math.min(168, Math.max(1, Number(new URL(url, 'http://localhost').searchParams.get('hours')) || 168));
          res.end(JSON.stringify(buildPublicFigureAnalytics(ghanaScraper.cachedSignals, { hours })));
          return;
        }

        if (url.split('?')[0] === '/api/v1/coverage/regions') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ghanaScraper.getRegionalSummaries(Math.min(168, Math.max(1, Number(new URL(url, 'http://localhost').searchParams.get('hours')) || 24)))));
          return;
        }

        // 1. Scraper Diagnostics & Health
        if (url.startsWith('/api/v1/scraper/status')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ghanaScraper.getScraperSnapshot()));
          return;
        }

        // 2. Trigger On-Demand Fresh Scrape
        if (url.startsWith('/api/v1/scraper/refresh')) {
          res.setHeader('Content-Type', 'application/json');
          try {
            const snapshot = await ghanaScraper.runFullScrapePipeline();
            res.end(JSON.stringify({ success: true, message: 'Scrape pipeline completed successfully', snapshot }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // 3. Trending Entities
        if (url.startsWith('/api/v1/trending-entities')) {
          res.setHeader('Content-Type', 'application/json');
          if (ghanaScraper.cachedTrending.length === 0) {
            await ghanaScraper.runFullScrapePipeline();
          }
          res.end(JSON.stringify(ghanaScraper.cachedTrending));
          return;
        }

        // 4. Live Signals
        if (url.startsWith('/api/v1/live-signals') || url.startsWith('/api/v1/signals')) {
          res.setHeader('Content-Type', 'application/json');
          if (ghanaScraper.cachedSignals.length === 0) {
            await ghanaScraper.runFullScrapePipeline();
          }
          res.end(JSON.stringify(ghanaScraper.cachedSignals));
          return;
        }

        // 5. Dynamic Emergent Narratives
        if (url.startsWith('/api/v1/thinking/narratives')) {
          res.setHeader('Content-Type', 'application/json');
          if (ghanaScraper.cachedNarratives.length === 0) {
            await ghanaScraper.runFullScrapePipeline();
          }
          res.end(JSON.stringify(ghanaScraper.cachedNarratives));
          return;
        }

        // 6. CIB & Bot Syndicate Coordination Watch
        if (url.startsWith('/api/v1/thinking/coordination')) {
          res.setHeader('Content-Type', 'application/json');
          if (!ghanaScraper.cachedCoordination) {
            await ghanaScraper.runFullScrapePipeline();
          }
          res.end(JSON.stringify(ghanaScraper.cachedCoordination));
          return;
        }

        // 7. Autonomous National Strategic Intelligence Brief
        if (url.startsWith('/api/v1/thinking/national-brief')) {
          res.setHeader('Content-Type', 'application/json');
          if (!ghanaScraper.cachedReasoningBrief) {
            await ghanaScraper.runFullScrapePipeline();
          }
          res.end(JSON.stringify(ghanaScraper.cachedReasoningBrief));
          return;
        }

        // 8. On-Demand Live Internet Politician Intelligence Scraper
        if (url.startsWith('/api/v1/politicians/search')) {
          res.setHeader('Content-Type', 'application/json');
          const searchParams = new URL(url, 'http://localhost').searchParams;
          const query = searchParams.get('query') || searchParams.get('q') || '';
          try {
            const result = await ghanaScraper.searchPoliticianOnInternet(query);
            res.end(JSON.stringify(result || { error: 'No live data found for query' }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // 9. Interactive On-Demand Local Thinking Test Endpoint
        if (url.startsWith('/api/v1/thinking/analyze')) {
          res.setHeader('Content-Type', 'application/json');
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              let textToAnalyze = '';
              if (body) {
                const parsed = JSON.parse(body);
                textToAnalyze = parsed.text || '';
              } else {
                const searchParams = new URL(url, 'http://localhost').searchParams;
                textToAnalyze = searchParams.get('text') || '';
              }

              if (!textToAnalyze) {
                textToAnalyze = 'Dumsor protests intensify in Kumasi as businesses lament power crisis and cost of living wahala.';
              }

              const entities = resolveEntitiesFromText(textToAnalyze);
              const targetEntity = entities[0]?.name || null;
              const sentiment = analyzeTargetAwareSentiment(textToAnalyze, targetEntity);
              const singleItemCoord = detectCoordinationClusters([
                { headline: textToAnalyze, title: textToAnalyze, source: 'Analyst Query', pubDate: new Date() },
                ...ghanaScraper.cachedSignals.slice(0, 10)
              ]);
              const syntheticBrief = runLocalThinkingReasoning(
                [{ headline: textToAnalyze, text: textToAnalyze, sentiment: sentiment.score, region: 'Ashanti', issue: 'Electricity & Grid Reliability' }],
                [],
                entities
              );

              res.end(JSON.stringify({
                text: textToAnalyze,
                entities,
                targetEntity,
                sentiment,
                coordinationCheck: singleItemCoord,
                syntheticBrief,
                quotaUsed: '0 Tokens (Local Deterministic Thinking Engine)',
                engineStatus: 'LOCAL_HEURISTICS_UNVALIDATED'
              }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
  }
  return {
    name: 'ghana-intelligence-local-brain-plugin',
    configureServer: install,
    configurePreviewServer: install
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), ghanaIntelligencePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true
  },
  preview: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true
  }
});
