import React, { useState, useEffect } from 'react';
import { Radio, ArrowUpRight, ArrowDownRight, Brain, AlertTriangle, ShieldCheck, Activity, Eye, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import GhanaIntelligenceMap from '../../components/map/GhanaIntelligenceMap.jsx';
import MiniChart from '../../components/MiniChart.jsx';
import { REGIONS_DATA } from '../../data/regions.js';
import { SIGNALS_DATA } from '../../data/signals.js';
import { NARRATIVES_DATA } from '../../data/narratives.js';
import { trend } from '../../data/mockData.js';

export default function CommandCenter({
  selectedRegion,
  onSelectRegion,
  onNavigate,
  activeLayer,
  onChangeLayer,
  useAdjustedSentiment = false,
  onToggleAdjustedSentiment
}) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [signalsList, setSignalsList] = useState([]);
  const [liveThinkingBrief, setLiveThinkingBrief] = useState(null);

  useEffect(() => {
    fetch('/api/v1/live-signals')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSignalsList(data);
        }
      })
      .catch(() => {});

    fetch('/api/v1/thinking/national-brief')
      .then(res => res.ok ? res.json() : null)
      .then(brief => {
        if (brief && brief.situationAssessment) {
          setLiveThinkingBrief(brief);
        }
      })
      .catch(() => {});
  }, []);

  // Top ranked regions by discussion volume
  const rankedRegions = [...REGIONS_DATA].sort((a, b) => b.volume - a.volume);

  // Filtered live signals
  const displaySignals = signalsList.filter(s => 
    filterCategory === 'ALL' || s.category === filterCategory
  ).slice(0, 6);

  const regionSentiment = selectedRegion?.sentiment ?? -31;
  const isPos = regionSentiment > 5;
  const isNeg = regionSentiment < -5;

  return (
    <div className={`command-center-layout ${isMapExpanded ? 'map-expanded' : ''}`}>
      {/* Center Intelligence Map Section */}
      <section className="command-map-section">
        <div className="section-hud-bar">
          <div className="hud-title-group">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-normal">GEOSPATIAL OPERATIONS</span>
            <h2 className="text-base font-semibold text-slate-100">National Public-Source Coverage</h2>
          </div>

          <div className="hud-bar-actions">
            <button 
              className={`mode-toggle-chip ${useAdjustedSentiment ? 'adjusted' : 'raw'}`}
              onClick={onToggleAdjustedSentiment}
              title="Toggle between Raw Captured Sentiment and Coordinated-Activity Adjusted Sentiment"
            >
              <i className="chip-indicator"></i>
              <span>{useAdjustedSentiment ? 'ADJUSTED DATA' : 'RAW SIGNALS'}</span>
            </button>

            <span className="live-telemetry-chip">
              <span className="live-ping"></span>
              LIVE DATA STREAM
            </span>
          </div>
        </div>

        {/* Real Ghana MapLibre Component */}
        <div className="map-view-wrapper">
          <GhanaIntelligenceMap 
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            activeLayer={activeLayer}
            onChangeLayer={onChangeLayer}
            isFullScreen={isMapExpanded}
            onToggleFullScreen={() => setIsMapExpanded(!isMapExpanded)}
          />
        </div>

        {/* Bottom Horizontal Region Fast-Rail */}
        <div className="region-fast-rail">
          <div className="rail-label">DEMO REGIONAL METRICS:</div>
          <div className="rail-scroll">
            {rankedRegions.slice(0, 8).map(r => {
              const isSelected = selectedRegion?.id === r.id;
              const isRPos = r.sentiment > 5;
              const isRNeg = r.sentiment < -5;

              return (
                <button
                  key={r.id}
                  className={`rail-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectRegion(r)}
                >
                  <span className="rail-region-name">{r.name}</span>
                  <span className={`rail-score ${isRPos ? 'pos' : isRNeg ? 'neg' : 'neu'}`}>
                    {r.sentiment > 0 ? '+' : ''}{r.sentiment}
                  </span>
                  <small className="rail-top-issue">{r.top}</small>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right Intelligence Drawer / Deep Scan Preview */}
      <aside className="command-intelligence-rail">
        {/* Selected Region Deep Scan Briefing */}
        {/* Selected Region Deep Scan Briefing */}
        <article className="hud-card region-deep-scan-card">
          <div className="hud-card-header">
            <div>
              <span className="card-kicker">DEMONSTRATION REGION PROFILE</span>
              <h3 className="card-title">{selectedRegion?.name || 'Greater Accra'}</h3>
            </div>
            <span className={`threat-badge ${selectedRegion?.signal || 'watch'}`}>
              {selectedRegion?.signal?.toUpperCase() || 'WATCH'}
            </span>
          </div>

          <div className="score-orbit-container">
            <div className="score-core-display">
              <small>PUBLIC SENTIMENT INDEX</small>
              <strong className={`score-digit ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
                {regionSentiment > 0 ? '+' : ''}{regionSentiment}
              </strong>
              <em className="movement-delta">
                {selectedRegion?.sentiment24h > 0 ? '▲ +' : '▼ '}{selectedRegion?.sentiment24h ?? -6.4} pts / 24H
              </em>
            </div>
          </div>

          <div className="metric-triad">
            <div className="triad-box">
              <small>7D TREND</small>
              <span className={selectedRegion?.sentiment7d < 0 ? 'neg' : 'pos'}>
                {selectedRegion?.sentiment7d ?? -8.2}
              </span>
            </div>
            <div className="triad-box">
              <small>DEMO SIGNALS</small>
              <span>{selectedRegion?.volume?.toLocaleString() ?? '92,450'}</span>
            </div>
            <div className="triad-box">
              <small>DATA CONFIDENCE</small>
              <span className="pos">{selectedRegion?.confidence ?? 94}%</span>
            </div>
          </div>

          {/* Issue Pressure Breakdown */}
          <div className="card-sub-section">
            <div className="sub-header">
              <span>PRIMARY CITIZEN ISSUES</span>
              <span>PRESSURE</span>
            </div>
            <div className="issue-bars-stack">
              {(selectedRegion?.issues || []).slice(0, 4).map(iss => (
                <div key={iss.name} className="issue-row">
                  <div className="issue-meta">
                    <span className="issue-label">{iss.name}</span>
                    <b className="issue-share">{iss.share}%</b>
                  </div>
                  <div className="hud-progress-track">
                    <div 
                      className={`hud-progress-fill ${iss.sentiment < -40 ? 'crit' : 'warn'}`}
                      style={{ width: `${Math.min(100, iss.share * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="hud-action-btn primary"
            onClick={() => onNavigate('Regions')}
          >
            <span>View Full Regional Profile</span>
            <ChevronRight size={14} />
          </button>
        </article>

        {/* AI Civic Response Engine Assessment */}
        <article className="hud-card ai-civic-card">
          <div className="hud-card-header">
            <div>
              <span className="card-kicker">POLICY & ADVISORY OPERATIONS</span>
              <h3 className="card-title">Executive Advisory Brief</h3>
            </div>
            <ShieldCheck size={18} className="text-[#0078d4]" />
          </div>

          <div className="ai-brief-box">
            <div className="brief-status">
              <span className="pulse-dot"></span>
              <b>{liveThinkingBrief ? 'LIVE LOCAL THINKING ASSESSMENT' : 'OPERATIONAL RECOMMENDATION'}</b>
              <small>{liveThinkingBrief ? '0-Quota Local Heuristics · 94% Confidence' : 'Demonstration advisory · Not operational guidance'}</small>
            </div>
            <p className="brief-text">
              {liveThinkingBrief?.situationAssessment || selectedRegion?.civicAssessment?.situation || selectedRegion?.brief}
            </p>
          </div>

          <div className="ai-rec-box">
            <span className="rec-kicker">RECOMMENDED PUBLIC SERVICE ACTION:</span>
            <div className="rec-content">
              {liveThinkingBrief?.nonPartisanResponse || selectedRegion?.civicAssessment?.recommendedResponse || 'Deploy consumer protection monitors to primary commuter terminals; publish verified fuel pricing update.'}
            </div>
          </div>

          <div className="card-action-row">
            <button 
              className="hud-btn-outline"
              onClick={() => onNavigate('Brain')}
              title="Open Local Thinking Brain Console"
              style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
            >
              <Brain size={13} />
              <span>Inspect Local Brain</span>
            </button>
            <button 
              className="hud-btn-outline"
              onClick={() => onNavigate('Evidence')}
            >
              <Eye size={13} />
              <span>Ground Evidence</span>
            </button>
            <button 
              className="hud-btn-outline"
              onClick={() => onNavigate('Reports')}
            >
              <FileText size={13} />
              <span>Report</span>
            </button>
          </div>

          <div className="guardrail-footer">
            Data Governance: Lawful public information only · No voter profiling or targeted political persuasion.
          </div>
        </article>
      </aside>

      {/* Bottom Live Signals & Intercepts Ticker */}
      <section className="command-bottom-strip">
        <article className="hud-card live-feed-card">
          <div className="feed-header-bar">
            <div className="feed-title-wrap">
              <Radio size={14} className="text-[#0078d4]" />
              <span className="card-kicker font-semibold text-slate-100">COLLECTED PUBLIC REPORTS</span>
            </div>

            <div className="feed-filter-tabs">
              {['ALL', 'CRITICAL', 'ISSUES', 'NARRATIVES', 'POLITICAL', 'CIVIC'].map(cat => (
                <button
                  key={cat}
                  className={`feed-filter-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="signal-feed-grid">
            {displaySignals.map(sig => (
              <div key={sig.id} className="signal-card-item">
                <div className="sig-item-top">
                  <span className={`sig-level-tag ${sig.level.toLowerCase()}`}>{sig.level}</span>
                  <span className="sig-region-tag">{sig.region}</span>
                  <time className="sig-time">{sig.time}</time>
                </div>
                <h4 className="sig-headline">
                  {sig.url ? (
                    <a href={sig.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {sig.headline}
                      <ExternalLink size={11} style={{ opacity: 0.6 }} />
                    </a>
                  ) : sig.headline}
                </h4>
                <p className="sig-text">{sig.text}</p>
                <div className="sig-footer">
                  <span className="sig-source">SRC: {sig.platform}</span>
                  <span className="sig-conf">CONF: {sig.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
