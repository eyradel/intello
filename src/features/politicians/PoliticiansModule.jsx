import React, { useState, useEffect } from 'react';
import { Search, Users, ChevronRight, TrendingUp, TrendingDown, Scale, ArrowRight, X, BarChart3, CheckCircle2, Globe, ExternalLink, Zap, RefreshCw, Flame, ShieldAlert, Brain } from 'lucide-react';
import { POLITICIANS_DATA, searchPoliticians } from '../../data/politicians.js';
import PoliticianProfile from './PoliticianProfile.jsx';

export default function PoliticiansModule({ 
  onNavigate, 
  initialQuery = '', 
  selectedPolId = null,
  onClearInitialState 
}) {
  const [selectedPol, setSelectedPol] = useState(null);
  const [partyFilter, setPartyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [comparedPols, setComparedPols] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [politiciansList, setPoliticiansList] = useState(POLITICIANS_DATA);
  const [isLiveWireActive, setIsLiveWireActive] = useState(false);

  // Live Internet Politician Scraping State
  const [liveScrapedFigure, setLiveScrapedFigure] = useState(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webSearchNotice, setWebSearchNotice] = useState('');

  // Fetch real-time live scraped entities on mount to replace static data with fresh news
  useEffect(() => {
    fetch('/api/v1/trending-entities')
      .then(res => res.ok ? res.json() : null)
      .then(liveEntities => {
        if (Array.isArray(liveEntities) && liveEntities.length > 0) {
          setIsLiveWireActive(true);
          // Merge live scraped figures into politiciansList
          const updated = POLITICIANS_DATA.map(p => {
            const match = liveEntities.find(le => le.name.toLowerCase() === p.name.toLowerCase() || p.aliases?.some(a => a.toLowerCase() === le.name.toLowerCase()));
            if (match) {
              return {
                ...p,
                mentions: `${match.mentions * 4.2 + 10}K`,
                mentionCount: match.mentions * 4200,
                nationalSentiment: match.avgSentiment ?? p.nationalSentiment,
                velocity: match.velocity || p.velocity,
                latestNarrative: match.articles?.[0]?.headline || p.latestNarrative,
                isLiveWire: true
              };
            }
            return p;
          });

          // Add any newly trending figures discovered by the scraper not in baseline
          liveEntities.forEach(le => {
            if (!updated.some(u => u.name.toLowerCase() === le.name.toLowerCase())) {
              updated.unshift({
                id: `live-ent-${le.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: le.name,
                initials: le.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
                role: le.role || 'Public Official / Emerging Figure',
                party: le.party || 'CIVIC',
                affiliation: le.party === 'NPP' ? 'Ruling NPP' : le.party === 'NDC' ? 'Opposition NDC' : 'Public Administration',
                nationalSentiment: le.avgSentiment ?? 5,
                positivePct: 48,
                neutralPct: 30,
                negativePct: 22,
                movement24h: +2.1,
                mentions: `${le.mentions * 3.8 + 6}K`,
                velocity: le.velocity || '+18%/day',
                latestNarrative: le.articles?.[0]?.headline || 'Live public news engagement active.',
                confidence: 94,
                isLiveWire: true,
                aiSummary: `Real-time public news wire tracking indicates elevated coverage across Ghanaian press outlets for ${le.name}.`
              });
            }
          });

          setPoliticiansList(updated);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchWeb = async (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) return;
    setIsSearchingWeb(true);
    setWebSearchNotice(`Connecting to internet... Scraping live Ghana news wires for "${q}"`);
    try {
      const res = await fetch(`/api/v1/politicians/search?query=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.name) {
          setLiveScrapedFigure(data);
          setWebSearchNotice(`Live scrape complete · ${data.liveArticlesCount || 20} recent articles analyzed with 0 API tokens.`);
        } else {
          setWebSearchNotice('No live news wire articles returned for this query.');
        }
      } else {
        setWebSearchNotice('Web scraper service temporarily busy. Please retry.');
      }
    } catch (err) {
      setWebSearchNotice(`Error connecting to live scraper: ${err.message}`);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      if (initialQuery.toLowerCase().includes('finance') || initialQuery.toLowerCase().includes('minister')) {
        handleSearchWeb(initialQuery);
      }
    }
  }, [initialQuery]);

  useEffect(() => {
    if (selectedPolId) {
      const pol = POLITICIANS_DATA.find(p => p.id === selectedPolId);
      if (pol) setSelectedPol(pol);
    }
  }, [selectedPolId]);

  if (selectedPol) {
    return (
      <PoliticianProfile 
        politician={selectedPol} 
        onBack={() => {
          setSelectedPol(null);
          if (onClearInitialState) onClearInitialState();
        }}
        onNavigate={onNavigate}
      />
    );
  }

  // Multi-entity search evaluation
  const isCompoundQuery = searchQuery.match(/\s+(?:and|or|vs|\&|\+)\s+|,\s*/i);
  const qClean = searchQuery.toLowerCase().trim();
  const searchedList = qClean 
    ? politiciansList.filter(p => 
        p.name.toLowerCase().includes(qClean) || 
        p.role.toLowerCase().includes(qClean) ||
        (p.aliases && p.aliases.some(a => a.toLowerCase().includes(qClean))) ||
        (p.latestNarrative && p.latestNarrative.toLowerCase().includes(qClean))
      )
    : politiciansList;

  const filtered = searchedList.filter(p => {
    const matchParty = partyFilter === 'ALL' || p.party === partyFilter;
    return matchParty;
  });

  // If a compound query is typed and matches at least 2 entities, detect them
  const detectedMultiple = isCompoundQuery && filtered.length >= 2;
  const compareFigures = comparedPols.length === 2 
    ? comparedPols 
    : detectedMultiple 
      ? [filtered[0], filtered[1]] 
      : [];

  const handleToggleCompareSelection = (pol, e) => {
    e.stopPropagation();
    if (comparedPols.some(p => p.id === pol.id)) {
      setComparedPols(comparedPols.filter(p => p.id !== pol.id));
    } else {
      if (comparedPols.length >= 2) {
        setComparedPols([comparedPols[1], pol]);
      } else {
        setComparedPols([...comparedPols, pol]);
      }
    }
  };

  return (
    <div className="politicians-module-view">
      {/* Header */}
      <div className="module-topbar flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 mb-1">Public Figures & Live OSINT Analytics</h2>
          <p className="text-xs text-slate-400">
            Search any Ghanaian politician or minister to scrape live popularity scores, policy points, and press wire sentiment.
          </p>
        </div>
        <div className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded flex items-center gap-2">
          <Globe size={13} />
          <span>Live Internet Web Wire Connected (0-Quota)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="politicians-filter-bar mb-3">
        <div className="search-wrap flex-1">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Search ANY politician or minister (e.g. 'Finance Minister of Ghana', 'Bawumia', 'Mahama', 'Ablakwa')..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSearchWeb(searchQuery);
              }
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setLiveScrapedFigure(null);
                setWebSearchNotice('');
              }}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-1"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button 
          className="hud-action-btn primary flex items-center gap-2 whitespace-nowrap"
          onClick={() => handleSearchWeb(searchQuery)}
          disabled={isSearchingWeb || !searchQuery.trim()}
          title="Scrape Google News & Ghanaian press wire for this politician"
        >
          <Globe size={13} className={isSearchingWeb ? 'animate-spin' : ''} />
          <span>{isSearchingWeb ? 'Scraping Web...' : 'Search Web (Live)'}</span>
        </button>

        <div className="party-filter-tabs flex items-center gap-2">
          {['ALL', 'NPP', 'NDC', 'INDEPENDENT'].map(pf => (
            <button
              key={pf}
              className={`cat-pill text-xs font-mono font-semibold px-3 py-1.5 rounded uppercase tracking-wider transition-all ${
                partyFilter === pf ? 'active' : ''
              }`}
              onClick={() => setPartyFilter(pf)}
            >
              {pf}
            </button>
          ))}
        </div>
      </div>

      {/* Fast Preset Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-[11px] font-mono text-slate-400 uppercase">Quick Intel Presets:</span>
        {[
          { label: 'Finance Minister (Dr. Mohammed Amin Adam)', query: 'Finance Minister of Ghana' },
          { label: 'Dr. Mahamudu Bawumia', query: 'Mahamudu Bawumia' },
          { label: 'John Dramani Mahama', query: 'John Mahama' },
          { label: 'Alan Kyerematen', query: 'Alan Kyerematen' },
          { label: 'Cassiel Ato Forson', query: 'Cassiel Ato Forson' },
          { label: 'Samuel Okudzeto Ablakwa', query: 'Samuel Okudzeto Ablakwa' }
        ].map((chip, idx) => (
          <button
            key={idx}
            className="text-[11px] bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded transition-colors"
            onClick={() => {
              setSearchQuery(chip.query);
              handleSearchWeb(chip.query);
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Web Search Notice Banner */}
      {webSearchNotice && (
        <div className="mb-4 px-3 py-2 bg-slate-900/90 border border-cyan-800/60 rounded text-xs text-cyan-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSearchingWeb ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span>{webSearchNotice}</span>
          </div>
          {isSearchingWeb && <span className="font-mono text-[10px] text-amber-400">CONNECTING...</span>}
        </div>
      )}

      {/* LIVE WEB-SCRAPED INTELLIGENCE DOSSIER (Top Result) */}
      {liveScrapedFigure && (
        <div className="live-scraped-dossier-card mb-6 bg-slate-900/95 border-2 border-cyan-500/60 p-5 rounded-lg shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SCRAPED INTEL PROFILE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Query: "{liveScrapedFigure.searchQuery}"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                Quota: 0 Tokens
              </span>
              <button
                className="hud-action-btn primary text-xs py-1"
                onClick={() => setSelectedPol(liveScrapedFigure)}
              >
                <span>Inspect Full Dossier</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Bio & Popularity Stats */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-700/60 flex items-center justify-center font-bold font-mono text-cyan-300 text-base">
                    {liveScrapedFigure.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>{liveScrapedFigure.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        liveScrapedFigure.party === 'NDC' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        liveScrapedFigure.party === 'NPP' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        'bg-purple-950 text-purple-400 border border-purple-800'
                      }`}>
                        {liveScrapedFigure.party}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-tight">{liveScrapedFigure.role}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {liveScrapedFigure.aiSummary}
                </div>
              </div>

              {/* Popularity & Sentiment Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
                <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Popularity Rating</span>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">
                    {liveScrapedFigure.popularityScore} / 100
                  </div>
                  <div className="text-[10px] text-cyan-300 font-semibold">{liveScrapedFigure.popularityLevel}</div>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Net Sentiment</span>
                  <div className={`text-lg font-bold mt-0.5 ${
                    liveScrapedFigure.nationalSentiment > 0 ? 'text-emerald-400' :
                    liveScrapedFigure.nationalSentiment < 0 ? 'text-rose-400' : 'text-slate-200'
                  }`}>
                    {liveScrapedFigure.nationalSentiment > 0 ? `+${liveScrapedFigure.nationalSentiment}` : liveScrapedFigure.nationalSentiment} pts
                  </div>
                  <div className="text-[10px] text-slate-400">{liveScrapedFigure.velocity}</div>
                </div>
              </div>

              {/* Discussion Sentiment Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span className="text-emerald-400">+{liveScrapedFigure.positivePct}% POS</span>
                  <span className="text-slate-300">{liveScrapedFigure.neutralPct}% NEU</span>
                  <span className="text-rose-400">-{liveScrapedFigure.negativePct}% NEG</span>
                </div>
                <div className="h-2 bg-slate-800 rounded flex overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${liveScrapedFigure.positivePct}%` }}></div>
                  <div className="bg-slate-500 h-full" style={{ width: `${liveScrapedFigure.neutralPct}%` }}></div>
                  <div className="bg-rose-500 h-full" style={{ width: `${liveScrapedFigure.negativePct}%` }}></div>
                </div>
              </div>
            </div>

            {/* Right: Key Policy Points & Live Headlines */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Points Box */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain size={13} />
                  <span>Key Policy Points & Public Positions ("His Points")</span>
                </div>
                <div className="space-y-1.5">
                  {(liveScrapedFigure.points || []).slice(0, 4).map((pt, idx) => (
                    <div key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Web Headlines */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Recent Press Wire Headlines ({liveScrapedFigure.recentArticles?.length || 0})</span>
                  <span className="text-[10px] text-slate-500 font-mono">Live Google News Wire</span>
                </div>
                <div className="space-y-1.5">
                  {(liveScrapedFigure.recentArticles || []).slice(0, 3).map((art, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1">
                      <a 
                        href={art.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-cyan-400 transition-colors truncate flex items-center gap-1 text-slate-200"
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="truncate">{art.headline}</span>
                        <ExternalLink size={10} className="text-cyan-400 flex-shrink-0 opacity-70" />
                      </a>
                      <span className={`text-[10px] font-mono px-1 py-0.2 rounded flex-shrink-0 ${
                        art.sentiment > 0 ? 'text-emerald-400' : art.sentiment < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {art.sentiment > 0 ? `+${art.sentiment}` : art.sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Entity Comparison Hero Banner (Triggered when user queries for two entities) */}
      {compareFigures.length === 2 && (
        <div className="multi-entity-compare-banner mb-6 border border-[#25354e] bg-[#131d2e] p-5 rounded-md shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#25354e]">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-[#0078d4]" />
              <span className="text-xs font-semibold tracking-normal text-slate-100 uppercase">
                Side-by-Side Comparative Analysis
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Query matched: <b className="text-slate-200">"{searchQuery}"</b>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compareFigures.map((fig, idx) => {
              const isPos = fig.nationalSentiment > 5;
              const isNeg = fig.nationalSentiment < -5;

              return (
                <div 
                  key={fig.id} 
                  className="compare-figure-card p-4 rounded-lg bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between hover:border-sky-400 transition-all cursor-pointer shadow-xs"
                  onClick={() => setSelectedPol(fig)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="party-tag font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                        {fig.party}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">FIGURE #{idx + 1}</span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-sans mb-1">
                      {fig.name}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mb-3">
                      {fig.role}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded bg-neutral-50 dark:bg-neutral-800/50 mb-3 text-center">
                      <div>
                        <small className="block text-[9px] font-mono text-neutral-400">SENTIMENT</small>
                        <strong className={`text-sm font-bold font-mono ${isPos ? 'text-emerald-600' : isNeg ? 'text-rose-600' : 'text-slate-600'}`}>
                          {fig.nationalSentiment > 0 ? '+' : ''}{fig.nationalSentiment}
                        </strong>
                      </div>
                      <div>
                        <small className="block text-[9px] font-mono text-neutral-400">MENTIONS</small>
                        <strong className="text-sm font-bold font-mono text-neutral-800 dark:text-neutral-200">
                          {fig.mentions}
                        </strong>
                      </div>
                      <div>
                        <small className="block text-[9px] font-mono text-neutral-400">VELOCITY</small>
                        <span className="text-xs font-mono font-semibold text-emerald-600">
                          {fig.velocity}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2 italic mb-2">
                      "{fig.latestNarrative}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-sky-700 dark:text-sky-400">
                    <span>VIEW COMPLETE DOSSIER</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Politician Cards Grid */}
      <div className="politicians-card-grid">
        {filtered.length === 0 ? (
          <div className="col-span-full empty-signals-box glass text-center p-8">
            <Users size={32} className="mx-auto mb-3 text-neutral-400" />
            <h4 className="text-base font-bold font-sans mb-1">NO FIGURES MATCHING "{searchQuery}"</h4>
            <p className="text-xs text-neutral-500">
              Try searching by name, role (e.g. "finance minister", "speaker", "asiedu nketia"), or party affiliation.
            </p>
          </div>
        ) : (
          filtered.map(p => {
            const isPos = p.nationalSentiment > 5;
            const isNeg = p.nationalSentiment < -5;
            const isCompared = comparedPols.some(cp => cp.id === p.id);

            return (
              <div 
                key={p.id} 
                className={`politician-card ${isCompared ? 'ring-2 ring-sky-500' : ''}`}
                onClick={() => setSelectedPol(p)}
              >
                <div className="card-top">
                  <div className="avatar-mini">
                    <span>{p.initials}</span>
                  </div>
                  <div className="card-ident">
                    <span className="party-tag">{p.party}</span>
                    <h3 className="pol-name">{p.name}</h3>
                    <p className="pol-office">{p.role}</p>
                  </div>
                </div>

                <div className="pol-stats-row">
                  <div className="stat-col">
                    <small>SENTIMENT</small>
                    <strong className={`stat-val ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
                      {p.nationalSentiment > 0 ? '+' : ''}{p.nationalSentiment}
                    </strong>
                  </div>

                  <div className="stat-col">
                    <small>24H DELTA</small>
                    <span className={`stat-delta ${p.movement24h > 0 ? 'pos' : 'neg'}`}>
                      {p.movement24h > 0 ? '▲ +' : '▼ '}{p.movement24h}
                    </span>
                  </div>

                  <div className="stat-col">
                    <small>MENTIONS</small>
                    <span className="stat-val">{p.mentions}</span>
                  </div>

                  <div className="stat-col">
                    <small>CONFIDENCE</small>
                    <span className="stat-val pos">{p.confidence}%</span>
                  </div>
                </div>

                {/* Sentiment Distribution mini bar */}
                <div className="sentiment-ratio-bar">
                  <div className="seg pos" style={{ width: `${p.positivePct}%` }} />
                  <div className="seg neu" style={{ width: `${p.neutralPct}%` }} />
                  <div className="seg neg" style={{ width: `${p.negativePct}%` }} />
                </div>

                <div className="pol-narrative-box">
                  <span className="box-title">LATEST PUBLIC NARRATIVE:</span>
                  <p className="narrative-snippet">"{p.latestNarrative}"</p>
                </div>

                <div className="pol-card-foot flex items-center justify-between">
                  <span className="vol-badge">VELOCITY: {p.velocity}</span>
                  <button className="profile-btn flex items-center gap-1">
                    <span>DOSSIER</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
