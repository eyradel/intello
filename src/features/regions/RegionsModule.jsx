import React, { useEffect, useState } from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, ChevronRight, BarChart2, Eye } from 'lucide-react';
import { REGIONS_DATA } from '../../data/regions.js';
import RegionDeepScan from './RegionDeepScan.jsx';
import RegionComparison from './RegionComparison.jsx';

export default function RegionsModule({
  selectedRegion,
  onSelectRegion,
  onNavigate
}) {
  const [viewMode, setViewMode] = useState('directory'); // 'directory' | 'deep_scan' | 'compare'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('volume'); // 'volume' | 'sentiment' | 'confidence'

  const [coverage, setCoverage] = useState(null);
  const [coverageError, setCoverageError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/coverage/regions', { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('Collection service unavailable'); return res.json(); })
      .then(setCoverage)
      .catch(error => { if (error.name !== 'AbortError') setCoverageError('Live collection service unavailable. Start npm run dev to view saved coverage.'); });
    return () => controller.abort();
  }, []);

  // Filter and sort regions
  const filtered = REGIONS_DATA.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.dominantIssue?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'sentiment') return a.sentiment - b.sentiment;
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    return b.volume - a.volume;
  });

  if (viewMode === 'deep_scan') {
    return (
      <RegionDeepScan 
        region={selectedRegion || REGIONS_DATA[0]}
        onBack={() => setViewMode('directory')}
        onNavigate={onNavigate}
      />
    );
  }

  if (viewMode === 'compare') {
    return (
      <RegionComparison 
        initialRegionA={selectedRegion || REGIONS_DATA[0]}
        initialRegionB={REGIONS_DATA[1]}
        onBack={() => setViewMode('directory')}
      />
    );
  }

  return (
    <div className="regions-module-view">
      {/* Header bar */}
      <div className="module-topbar">
        <div>
          <span className="telemetry-badge">NATIONWIDE ADM1 ADMINISTRATIVE DIRECTORY</span>
          <h2 className="module-title">All 16 Regions of Ghana</h2>
        </div>

        <div className="topbar-actions">
          <button 
            className="hud-action-btn primary"
            onClick={() => setViewMode('compare')}
          >
            <BarChart2 size={14} />
            <span>COMPARE REGIONS</span>
          </button>
        </div>
      </div>

      <section style={{padding: '16px', marginBottom: '20px', border: '1px solid #334155', borderRadius: '8px'}}>
        <h3>Collected news · regional coverage · past 24 hours</h3>
        <p>Extractive summaries of public news. Place mentions may span regions; article tone does not measure public opinion. Constituency mapping is not configured.</p>
        {coverageError && <p role="status">{coverageError}</p>}
        {!coverage && !coverageError && <p>Loading collected evidence…</p>}
        {coverage && <>
          <p>{coverage.unassignedCount} articles have no matched region. {coverage.unknownPublicationDateCount} articles have unknown publication dates.</p>
          <div className="regions-card-grid">
            {coverage.regions.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map(r => <article key={r.id} style={{padding: '12px', border: '1px solid #334155', borderRadius: '6px'}}>
              <h4>{r.name}</h4>
              <p>{r.articleCount} articles · {r.sourceCount} feeds · {r.coverage}</p>
              <p>{r.summary}</p>
              {r.evidence.slice(0,3).map(e => <p key={e.id}><a href={e.url} target="_blank" rel="noopener noreferrer">{e.headline}</a> · {e.source}</p>)}
            </article>)}
          </div>
        </>}
      </section>
      <p role="note">The directory and comparison metrics below are synthetic demonstration data.</p>
      {/* Filter and Search controls */}
      <div className="regions-filter-bar">
        <div className="search-wrap">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Filter regions by name, capital, or dominant issue..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sort-wrap">
          <span className="sort-label"><ArrowUpDown size={13} /> SORT:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="hud-select">
            <option value="volume">SIGNAL VOLUME</option>
            <option value="sentiment">SENTIMENT SCORE</option>
            <option value="confidence">MODEL CONFIDENCE</option>
          </select>
        </div>
      </div>

      {/* 16-Region Card Grid */}
      <div className="regions-card-grid">
        {filtered.map(r => {
          const isSelected = selectedRegion?.id === r.id;
          const isPos = r.sentiment > 5;
          const isNeg = r.sentiment < -5;

          return (
            <div 
              key={r.id} 
              className={`region-grid-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                onSelectRegion(r);
              }}
            >
              <div className="region-card-top">
                <div>
                  <span className="cap-label">{r.capital.toUpperCase()}</span>
                  <h3 className="reg-name">{r.name}</h3>
                </div>
                <span className={`threat-badge ${r.signal}`}>{r.signal.toUpperCase()}</span>
              </div>

              <div className="region-card-score-row">
                <div className="score-block">
                  <small>PULSE</small>
                  <strong className={`score-val ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
                    {r.sentiment > 0 ? '+' : ''}{r.sentiment}
                  </strong>
                </div>

                <div className="score-block">
                  <small>24H DELTA</small>
                  <span className={`delta-val ${r.sentiment24h < 0 ? 'neg' : 'pos'}`}>
                    {r.sentiment24h > 0 ? '▲ +' : '▼ '}{r.sentiment24h}
                  </span>
                </div>

                <div className="score-block">
                  <small>SIGNALS</small>
                  <span className="vol-val">{r.volume.toLocaleString()}</span>
                </div>
              </div>

              <div className="region-card-issue">
                <span className="iss-title">DOMINANT ISSUE:</span>
                <span className="iss-name">{r.top}</span>
              </div>

              <div className="region-card-footer">
                <span className="conf-tag">CONF: {r.confidence}%</span>
                <button 
                  className="deep-scan-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRegion(r);
                    setViewMode('deep_scan');
                  }}
                >
                  <span>DEEP SCAN</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
