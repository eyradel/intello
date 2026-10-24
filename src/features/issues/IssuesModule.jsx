import React, { useState } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, ArrowUpRight, Search, Map, Eye, Layers } from 'lucide-react';
import { ISSUES_DATA } from '../../data/issues.js';
import MiniChart from '../../components/MiniChart.jsx';

export default function IssuesModule({ onSelectLayer, onNavigate }) {
  const [selectedIssueKey, setSelectedIssueKey] = useState('cost_of_living');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedIssue = ISSUES_DATA.find(i => i.key === selectedIssueKey) || ISSUES_DATA[0];

  const categories = ['ALL', 'Economic', 'Infrastructure', 'Public Health', 'Social', 'Governance', 'Security', 'Environment', 'Technology'];

  const filteredIssues = ISSUES_DATA.filter(iss => {
    const matchCat = filterCategory === 'ALL' || iss.category === filterCategory;
    const matchQuery = !searchQuery || 
      `${iss.label} ${iss.category}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="issues-module-view">
      {/* Topbar */}
      <div className="module-topbar">
        <div>
          <span className="telemetry-badge">CIVIC ISSUE INTELLIGENCE & CITIZEN PRESSURE</span>
          <h2 className="module-title">18 Tracked Public Policy & Needs Categories</h2>
        </div>

        <button 
          className="hud-action-btn primary"
          onClick={() => {
            onSelectLayer(selectedIssue.key);
            onNavigate('Command');
          }}
        >
          <Map size={14} />
          <span>PROJECT TO GHANA MAP</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="issues-filter-bar">
        <div className="search-wrap">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Search tracked issues by keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-scroll-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Layout: Issue Selector Cards on Left, Detailed Intelligence on Right */}
      <div className="issues-main-grid">
        {/* Left Column: Issue List */}
        <div className="issues-cards-column">
          {filteredIssues.map(iss => {
            const isSelected = iss.key === selectedIssueKey;
            const isCrit = iss.status === 'CRITICAL';
            const isHigh = iss.status === 'HIGH';

            return (
              <div 
                key={iss.key}
                className={`issue-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedIssueKey(iss.key)}
              >
                <div className="iss-item-top">
                  <div>
                    <span className="iss-cat">{iss.category}</span>
                    <h4 className="iss-name">{iss.label}</h4>
                  </div>
                  <span className={`status-pill ${iss.status.toLowerCase()}`}>{iss.status}</span>
                </div>

                <div className="iss-metric-strip">
                  <div className="metric-box">
                    <small>INTENSITY</small>
                    <strong className="crit">{iss.nationalIntensity}%</strong>
                  </div>
                  <div className="metric-box">
                    <small>SENTIMENT</small>
                    <span className={iss.sentiment < -30 ? 'neg' : 'pos'}>
                      {iss.sentiment > 0 ? '+' : ''}{iss.sentiment}
                    </span>
                  </div>
                  <div className="metric-box">
                    <small>VELOCITY</small>
                    <span className="pos">{iss.velocity}</span>
                  </div>
                </div>

                <div className="hud-progress-track">
                  <div 
                    className={`hud-progress-fill ${isCrit ? 'crit' : isHigh ? 'warn' : 'mint'}`}
                    style={{ width: `${iss.nationalIntensity}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Issue Deep Intelligence */}
        <div className="issue-deep-panel">
          <div className="deep-panel-header">
            <div>
              <span className="card-kicker">{selectedIssue.category.toUpperCase()} // STRATEGIC ISSUE PROFILE</span>
              <h2 className="deep-issue-title">{selectedIssue.label}</h2>
            </div>
            <div className="deep-actions">
              <button 
                className="hud-action-btn"
                onClick={() => {
                  onSelectLayer(selectedIssue.key);
                  onNavigate('Command');
                }}
              >
                <Map size={13} />
                <span>COLOR GHANA MAP</span>
              </button>
            </div>
          </div>

          <div className="issue-overview-triad">
            <div className="overview-card">
              <small>NATIONAL PRESSURE SCORE</small>
              <strong className="crit">{selectedIssue.nationalIntensity} / 100</strong>
              <span>Velocity: {selectedIssue.velocity}</span>
            </div>
            <div className="overview-card">
              <small>PUBLIC SENTIMENT</small>
              <strong className={selectedIssue.sentiment < 0 ? 'neg' : 'pos'}>
                {selectedIssue.sentiment > 0 ? '+' : ''}{selectedIssue.sentiment}
              </strong>
              <span>14D Deviation: -8.4 pts</span>
            </div>
            <div className="overview-card">
              <small>PUBLIC MENTIONS</small>
              <strong>{selectedIssue.mentionCount.toLocaleString()}</strong>
              <span>Evidence: {selectedIssue.evidenceCount.toLocaleString()} records</span>
            </div>
          </div>

          {/* 14-Day Trajectory */}
          <article className="hud-card">
            <div className="hud-card-header">
              <span className="card-kicker">14-DAY SENTIMENT TRENDLINE</span>
              <span className="card-kicker">{selectedIssue.label}</span>
            </div>
            <MiniChart values={selectedIssue.trend} />
            <div className="chart-foot">
              <span>D-14</span>
              <span>PRESSURE GROWTH: {selectedIssue.velocity}</span>
              <span>NOW</span>
            </div>
          </article>

          {/* Regional Concentration Ranking */}
          <article className="hud-card">
            <div className="hud-card-header">
              <span className="card-kicker">GEOGRAPHIC CONCENTRATION ACROSS 16 REGIONS</span>
              <span className="card-kicker">PRESSURE INTENSITY (0-100)</span>
            </div>

            <div className="regional-intensity-grid">
              {Object.entries(selectedIssue.regionalDistribution || {}).map(([regId, intensity]) => {
                const isTop = selectedIssue.dominantRegions.some(dr => dr.toLowerCase().replace(/\s+/g, '-') === regId);
                return (
                  <div key={regId} className={`geo-intensity-box ${isTop ? 'highlight' : ''}`}>
                    <span className="box-reg-name">{regId.replace(/-/g, ' ').toUpperCase()}</span>
                    <strong className={`box-intensity-num ${intensity >= 80 ? 'crit' : intensity >= 65 ? 'high' : 'med'}`}>
                      {intensity}
                    </strong>
                    <div className="intensity-bar">
                      <div 
                        className={`bar-fill ${intensity >= 80 ? 'crit' : intensity >= 65 ? 'high' : 'med'}`}
                        style={{ width: `${intensity}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Associated Narratives & AI Response */}
          <div className="issue-bottom-subgrid">
            <article className="hud-card">
              <div className="hud-card-header">
                <span className="card-kicker">ASSOCIATED PUBLIC NARRATIVES</span>
                <Layers size={14} className="text-cyan" />
              </div>
              <div className="narr-list">
                {selectedIssue.relatedNarratives.map((n, i) => (
                  <div key={i} className="narr-sub-row">
                    <span>▸</span>
                    <p>"{n}"</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="hud-card">
              <div className="hud-card-header">
                <span className="card-kicker">AI RECOMMENDED CIVIC RESPONSE</span>
              </div>
              <p className="ai-brief-text">{selectedIssue.civicResponse}</p>
              <div className="guardrail-footer">
                Recommendations focus exclusively on public service delivery transparency and verification.
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
