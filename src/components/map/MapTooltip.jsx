import React from 'react';

export default function MapTooltip({ region, x, y }) {
  if (!region) return null;

  const isNeg = region.sentiment < -5;
  const isPos = region.sentiment > 5;
  const sentimentClass = isNeg ? 'neg' : isPos ? 'pos' : 'neu';

  return (
    <div 
      className="map-hud-tooltip"
      style={{
        left: `${x + 16}px`,
        top: `${y - 20}px`
      }}
    >
      <div className="tooltip-header">
        <span className="region-tag">REGIONAL SCAN</span>
        <h4 className="region-title">{region.name.toUpperCase()}</h4>
      </div>

      <div className="tooltip-grid">
        <div className="tooltip-metric">
          <small>PUBLIC SENTIMENT</small>
          <strong className={`metric-val ${sentimentClass}`}>
            {region.sentiment > 0 ? '+' : ''}{region.sentiment}
          </strong>
        </div>

        <div className="tooltip-metric">
          <small>24H MOVEMENT</small>
          <span className={`metric-delta ${region.sentiment24h < 0 ? 'neg' : 'pos'}`}>
            {region.sentiment24h > 0 ? '▲ +' : '▼ '}{region.sentiment24h}
          </span>
        </div>

        <div className="tooltip-metric">
          <small>SIGNAL VOLUME</small>
          <span>{region.volume?.toLocaleString() || region.volume}</span>
        </div>

        <div className="tooltip-metric">
          <small>CONFIDENCE</small>
          <span className="metric-pos">{region.confidence}%</span>
        </div>
      </div>

      <div className="tooltip-footer">
        <span className="dom-issue"><b>ISSUE:</b> {region.top || region.dominantIssue}</span>
        <span className={`status-pill ${region.signal}`}>{region.signal?.toUpperCase()}</span>
      </div>
    </div>
  );
}
