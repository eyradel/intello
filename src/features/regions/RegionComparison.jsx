import React, { useState } from 'react';
import { Columns, ArrowRight, ArrowLeft } from 'lucide-react';
import { REGIONS_DATA } from '../../data/regions.js';

export default function RegionComparison({ initialRegionA, initialRegionB, onBack }) {
  const [regionAId, setRegionAId] = useState(initialRegionA?.id || 'greater-accra');
  const [regionBId, setRegionBId] = useState(initialRegionB?.id || 'ashanti');

  const regionA = REGIONS_DATA.find(r => r.id === regionAId) || REGIONS_DATA[0];
  const regionB = REGIONS_DATA.find(r => r.id === regionBId) || REGIONS_DATA[1];

  return (
    <div className="region-comparison-view">
      <div className="comparison-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>BACK TO REGIONS</span>
        </button>
        <span className="telemetry-badge">REGIONAL COMPARISON ENGINE</span>
      </div>

      <div className="comparison-selectors-row">
        <div className="selector-group">
          <label>PRIMARY REGION (A):</label>
          <select value={regionAId} onChange={e => setRegionAId(e.target.value)} className="hud-select">
            {REGIONS_DATA.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="vs-badge">VS</div>

        <div className="selector-group">
          <label>COMPARATIVE REGION (B):</label>
          <select value={regionBId} onChange={e => setRegionBId(e.target.value)} className="hud-select">
            {REGIONS_DATA.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="comparison-cards-grid">
        {/* Region A Column */}
        <div className="comp-col">
          <div className="comp-card-head">
            <h3>{regionA.name.toUpperCase()}</h3>
            <span className={`threat-badge ${regionA.signal}`}>{regionA.signal.toUpperCase()}</span>
          </div>

          <div className="comp-metric-row">
            <span>PUBLIC SENTIMENT</span>
            <strong className={regionA.sentiment < -5 ? 'neg' : 'pos'}>
              {regionA.sentiment > 0 ? '+' : ''}{regionA.sentiment}
            </strong>
          </div>

          <div className="comp-metric-row">
            <span>24H / 7D MOVEMENT</span>
            <span>{regionA.sentiment24h} / {regionA.sentiment7d} pts</span>
          </div>

          <div className="comp-metric-row">
            <span>SIGNAL VOLUME</span>
            <span>{regionA.volume.toLocaleString()} ({regionA.velocity})</span>
          </div>

          <div className="comp-metric-row">
            <span>CONFIDENCE</span>
            <span className="pos">{regionA.confidence}%</span>
          </div>

          <div className="comp-metric-row">
            <span>PARTY DISCUSSION</span>
            <span>NPP {regionA.partyDiscussion?.npp}% · NDC {regionA.partyDiscussion?.ndc}%</span>
          </div>

          <div className="comp-section-title">TOP ISSUES:</div>
          <div className="comp-issues-list">
            {(regionA.issues || []).map(iss => (
              <div key={iss.name} className="comp-iss-item">
                <span>{iss.name}</span>
                <b>{iss.share}%</b>
              </div>
            ))}
          </div>

          <div className="comp-section-title">PRIMARY CIVIC NEED:</div>
          <p className="comp-need-text">{regionA.needs?.[0]?.need || 'Infrastructure review'}</p>
        </div>

        {/* Region B Column */}
        <div className="comp-col">
          <div className="comp-card-head">
            <h3>{regionB.name.toUpperCase()}</h3>
            <span className={`threat-badge ${regionB.signal}`}>{regionB.signal.toUpperCase()}</span>
          </div>

          <div className="comp-metric-row">
            <span>PUBLIC SENTIMENT</span>
            <strong className={regionB.sentiment < -5 ? 'neg' : 'pos'}>
              {regionB.sentiment > 0 ? '+' : ''}{regionB.sentiment}
            </strong>
          </div>

          <div className="comp-metric-row">
            <span>24H / 7D MOVEMENT</span>
            <span>{regionB.sentiment24h} / {regionB.sentiment7d} pts</span>
          </div>

          <div className="comp-metric-row">
            <span>SIGNAL VOLUME</span>
            <span>{regionB.volume.toLocaleString()} ({regionB.velocity})</span>
          </div>

          <div className="comp-metric-row">
            <span>CONFIDENCE</span>
            <span className="pos">{regionB.confidence}%</span>
          </div>

          <div className="comp-metric-row">
            <span>PARTY DISCUSSION</span>
            <span>NPP {regionB.partyDiscussion?.npp}% · NDC {regionB.partyDiscussion?.ndc}%</span>
          </div>

          <div className="comp-section-title">TOP ISSUES:</div>
          <div className="comp-issues-list">
            {(regionB.issues || []).map(iss => (
              <div key={iss.name} className="comp-iss-item">
                <span>{iss.name}</span>
                <b>{iss.share}%</b>
              </div>
            ))}
          </div>

          <div className="comp-section-title">PRIMARY CIVIC NEED:</div>
          <p className="comp-need-text">{regionB.needs?.[0]?.need || 'Infrastructure review'}</p>
        </div>
      </div>
    </div>
  );
}
