import React from 'react';

export default function MapLegend({ currentLayer = 'public_sentiment' }) {
  const isIssueLayer = !['public_sentiment', 'government_sentiment', 'npp_discussion', 'ndc_discussion', 'politician_sentiment'].includes(currentLayer);

  if (isIssueLayer) {
    return (
      <div className="map-legend-hud">
        <span className="legend-label">PRESSURE INTENSITY:</span>
        <div className="legend-items">
          <span className="lg-item"><i className="lg-chip crit"></i> CRITICAL (80-100)</span>
          <span className="lg-item"><i className="lg-chip high"></i> HIGH (60-79)</span>
          <span className="lg-item"><i className="lg-chip med"></i> ELEVATED (40-59)</span>
          <span className="lg-item"><i className="lg-chip low"></i> MODERATE (0-39)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="map-legend-hud">
      <span className="legend-label">SENTIMENT SPECTRUM:</span>
      <div className="legend-items">
        <span className="lg-item"><i className="lg-chip strong-pos"></i> +60..+100 (STRONG POS)</span>
        <span className="lg-item"><i className="lg-chip pos"></i> +20..+59 (POSITIVE)</span>
        <span className="lg-item"><i className="lg-chip neu"></i> -19..+19 (NEUTRAL)</span>
        <span className="lg-item"><i className="lg-chip neg"></i> -20..-59 (NEGATIVE)</span>
        <span className="lg-item"><i className="lg-chip crit"></i> -60..-100 (CRITICAL NEG)</span>
      </div>
    </div>
  );
}
