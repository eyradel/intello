import React, { useState } from 'react';
import { Radio, Activity, Play, Pause, RotateCcw, Clock, Share2, Layers, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { NARRATIVES_DATA } from '../../data/narratives.js';

export default function NarrativesModule({ onNavigate, onSelectLayer }) {
  const [selectedNarrativeId, setSelectedNarrativeId] = useState(NARRATIVES_DATA[0].id);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const selectedNarrative = NARRATIVES_DATA.find(n => n.id === selectedNarrativeId) || NARRATIVES_DATA[0];
  const steps = selectedNarrative.timeline || [];

  return (
    <div className="narratives-module-view">
      {/* Topbar */}
      <div className="module-topbar">
        <div>
          <span className="telemetry-badge">NARRATIVE CLUSTERING & GEOSPATIAL PROPAGATION ENGINE</span>
          <h2 className="module-title">Narrative Command & Spread Tracker</h2>
        </div>

        <button 
          className="hud-action-btn primary"
          onClick={() => {
            onSelectLayer('emerging_narratives');
            onNavigate('Command');
          }}
        >
          <Activity size={14} />
          <span>VIEW RIPPLE ON MAIN MAP</span>
        </button>
      </div>

      {/* Main Grid: Narrative Cards on Left, Propagation Engine on Right */}
      <div className="narratives-layout-grid">
        {/* Left Column: Narrative Clusters */}
        <div className="narratives-list-col">
          <div className="section-label">ACTIVE NARRATIVE CLUSTERS ({NARRATIVES_DATA.length})</div>

          {NARRATIVES_DATA.map(narr => {
            const isSelected = narr.id === selectedNarrativeId;
            const isCrit = narr.intensity === 'CRITICAL';

            return (
              <div 
                key={narr.id}
                className={`narrative-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedNarrativeId(narr.id);
                  setActiveStepIdx(0);
                }}
              >
                <div className="narr-card-top">
                  <span className={`intensity-pill ${narr.intensity.toLowerCase()}`}>
                    {narr.intensity} ({narr.intensityScore}%)
                  </span>
                  <span className="growth-pill">{narr.growthRate} GROWTH</span>
                </div>

                <h3 className="narr-title">{narr.title}</h3>
                <p className="narr-summary">{narr.summary}</p>

                <div className="narr-metrics-row">
                  <div>
                    <small>ORIGIN</small>
                    <b>{narr.originRegionName}</b>
                  </div>
                  <div>
                    <small>REACH</small>
                    <span>{narr.affectedRegions.length} REGIONS</span>
                  </div>
                  <div>
                    <small>SENTIMENT</small>
                    <span className="neg">{narr.sentiment}</span>
                  </div>
                  <div>
                    <small>ORGANIC CONF</small>
                    <span className="pos">{narr.organicProbability}%</span>
                  </div>
                </div>

                <div className="narr-card-foot">
                  <span>DETECTED: {narr.firstDetected}</span>
                  <span className="vol-text">{narr.signalVolume.toLocaleString()} signals</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Narrative Propagation Timeline & Detail */}
        <div className="propagation-deep-panel">
          <div className="deep-header">
            <div>
              <span className="card-kicker">PROPAGATION VECTOR ANALYSIS</span>
              <h2 className="deep-title">{selectedNarrative.title}</h2>
            </div>
            <div className="organic-tag">
              <span className="dot"></span>
              ORGANIC PROBABILITY: <b>{selectedNarrative.organicProbability}%</b>
            </div>
          </div>

          {/* Key Propagation Telemetry Bar */}
          <div className="propagation-telemetry-bar">
            <div className="tele-tile">
              <small>ORIGIN NODE</small>
              <strong>{selectedNarrative.originRegionName}</strong>
              <span>First: {selectedNarrative.firstDetectedTime} GMT</span>
            </div>
            <div className="tele-tile">
              <small>SPREAD VELOCITY</small>
              <strong className="pos">{selectedNarrative.velocity}</strong>
              <span>Inter-regional corridor</span>
            </div>
            <div className="tele-tile">
              <small>CURRENT REACH</small>
              <strong>{selectedNarrative.currentReach}</strong>
              <span>{selectedNarrative.sourcesCount} distinct media/social sources</span>
            </div>
            <div className="tele-tile">
              <small>CONFIDENCE INDEX</small>
              <strong className="pos">{selectedNarrative.confidence}%</strong>
              <span>High triangulation</span>
            </div>
          </div>

          {/* Geospatial Ripple Sequence Stepper */}
          <article className="hud-card propagation-sequence-card">
            <div className="hud-card-header">
              <span className="card-kicker">CHRONOLOGICAL PROPAGATION TIMELINE // SENTIMENT RIPPLE</span>
              <div className="step-count">{activeStepIdx + 1} OF {steps.length} STAGES</div>
            </div>

            <div className="propagation-stepper-visual">
              {steps.map((st, i) => {
                const isPassed = i <= activeStepIdx;
                const isCurrent = i === activeStepIdx;

                return (
                  <div 
                    key={st.step}
                    className={`step-item ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                    onClick={() => setActiveStepIdx(i)}
                  >
                    <div className="step-circle">
                      <span>0{st.step}</span>
                    </div>
                    <div className="step-node-info">
                      <time className="node-time">{st.time}</time>
                      <h4 className="node-region">{st.regionName}</h4>
                      <span className="node-label">{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Stage Detailed Card */}
            {steps[activeStepIdx] && (
              <div className="active-stage-brief">
                <div className="stage-top">
                  <div className="stage-badge">STAGE 0{steps[activeStepIdx].step}: {steps[activeStepIdx].label.toUpperCase()}</div>
                  <time className="stage-timestamp">{steps[activeStepIdx].time}</time>
                </div>
                <p className="stage-desc">{steps[activeStepIdx].description}</p>
                <div className="stage-metrics">
                  <span>SIGNAL SURGE: <b>+{steps[activeStepIdx].volume.toLocaleString()}</b></span>
                  <span>OBSERVED SENTIMENT: <b className="neg">{steps[activeStepIdx].sentiment}</b></span>
                  <span>COORDINATES: <b>{steps[activeStepIdx].coords[1].toFixed(2)}°N, {Math.abs(steps[activeStepIdx].coords[0]).toFixed(2)}°W</b></span>
                </div>
              </div>
            )}
          </article>

          {/* Connecting Arc Paths & Public Entities */}
          <div className="narrative-meta-dual-grid">
            <article className="hud-card">
              <div className="hud-card-header">
                <span className="card-kicker">INTER-REGIONAL CORRIDOR ARCS</span>
                <Share2 size={14} className="text-cyan" />
              </div>
              <div className="arc-path-list">
                {(selectedNarrative.arcPaths || []).map((arc, i) => (
                  <div key={i} className="arc-row">
                    <span className="arc-bullet">▸</span>
                    <span className="arc-name">{arc.label}</span>
                    <span className="arc-status">ACTIVE PROPAGATION</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="hud-card">
              <div className="hud-card-header">
                <span className="card-kicker">ASSOCIATED PUBLIC BODIES & ENTITIES</span>
                <ShieldCheck size={14} className="text-cyan" />
              </div>
              <div className="entity-tags-cloud">
                {selectedNarrative.associatedEntities.map((ent, i) => (
                  <span key={i} className="entity-bubble">{ent}</span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
