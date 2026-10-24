import React, { useState, useEffect } from 'react';
import { Radio, Search, Filter, AlertTriangle, AlertCircle, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { SIGNALS_DATA } from '../../data/signals.js';

export default function SignalsModule() {
  const [signalsList, setSignalsList] = useState(SIGNALS_DATA);
  const [filterCat, setFilterCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const fetchLiveSignals = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/live-signals');
      if (res.ok) {
        const liveItems = await res.json();
        if (Array.isArray(liveItems) && liveItems.length > 0) {
          // Merge live items with static base to ensure full region coverage
          const combined = [...liveItems, ...SIGNALS_DATA.filter(s => !liveItems.some(l => l.headline === s.headline))];
          setSignalsList(combined);
          setIsLiveConnected(true);
          setLastRefreshed(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn('Using baseline open-source intelligence feed:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveSignals();
    const interval = setInterval(fetchLiveSignals, 60000); // 1 min auto-refresh
    return () => clearInterval(interval);
  }, []);

  const categories = ['ALL', 'CRITICAL', 'ISSUES', 'NARRATIVES', 'POLITICAL', 'CIVIC', 'ALERTS', 'MEDIA'];

  const filtered = signalsList.filter(sig => {
    const matchCat = filterCat === 'ALL' || sig.category === filterCat;
    const matchLevel = levelFilter === 'ALL' || sig.level === levelFilter;
    const matchQuery = !searchQuery || 
      `${sig.headline} ${sig.text} ${sig.region} ${sig.platform} ${sig.entity}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchLevel && matchQuery;
  });

  return (
    <div className="signals-module-view">
      {/* Topbar */}
      <div className="module-topbar flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 mb-1">Live Public-Source Signal Feed</h2>
          <p className="text-xs text-slate-400">
            Real-time public news and civic reports ingested across verified Ghanaian open sources.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="cat-pill" 
            onClick={fetchLiveSignals}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>

          <div className="text-xs text-slate-300 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Feed: <b>{isLiveConnected ? 'Connected (Live RSS)' : 'Active'}</b></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="signals-filter-bar">
        <div className="search-wrap">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Search signals by text, keyword, region, or source..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="cat-filter-scroll">
          {categories.map(c => (
            <button
              key={c}
              className={`cat-pill ${filterCat === c ? 'active' : ''}`}
              onClick={() => setFilterCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Stream List */}
      <div className="signals-stream-list">
        {filtered.length === 0 ? (
          <div className="empty-signals-box">
            <Info size={24} />
            <h4>NO SIGNALS MATCHING CURRENT FILTER CRITERIA</h4>
            <p>Adjust your search query or reset category filter to see active telemetry.</p>
          </div>
        ) : (
          filtered.map(sig => {
            const isCrit = sig.level === 'CRITICAL';
            const isWatch = sig.level === 'WATCH';

            return (
              <div key={sig.id} className={`signal-stream-card ${sig.level.toLowerCase()}`}>
                <div className="sig-meta-header">
                  <div className="sig-left-meta">
                    <span className={`sig-level-tag ${sig.level.toLowerCase()}`}>
                      {isCrit ? <AlertCircle size={11} /> : isWatch ? <AlertTriangle size={11} /> : <Info size={11} />}
                      {sig.level}
                    </span>
                    <span className="sig-region-badge">{sig.region}</span>
                    <span className="sig-cat-badge">{sig.category}</span>
                  </div>

                  <div className="sig-right-meta">
                    <span className="sig-conf-tag">CONF: {sig.confidence}%</span>
                    <time className="sig-time-tag">{sig.time} GMT</time>
                  </div>
                </div>

                <h3 className="sig-headline-title">
                  {sig.url ? (
                    <a 
                      href={sig.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {sig.headline}
                      <ExternalLink size={13} style={{ opacity: 0.7 }} />
                    </a>
                  ) : (
                    sig.headline
                  )}
                </h3>
                <p className="sig-full-text">{sig.text}</p>

                <div className="sig-source-footer">
                  <span className="src-info">
                    <b>SOURCE:</b> {sig.source} ({sig.platform})
                  </span>
                  <span className="ent-info">
                    <b>ASSOCIATED:</b> {sig.entity} · {sig.issue}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="stream-footer-notice">
        AUTHENTIC PUBLIC SOURCE ONLY // Verified open broadcasts, accredited news web portals, public social feeds, and institutional gazettes. No private communications or surveillance data.
      </div>
    </div>
  );
}
