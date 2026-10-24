import React from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

export default function SentimentRippleControls({
  activeNarrative,
  isPlaying,
  onTogglePlay,
  onRestart,
  speed,
  onChangeSpeed,
  currentStepIndex,
  onStepChange,
  steps = []
}) {
  const currentStep = steps[currentStepIndex] || steps[0] || {};

  return (
    <div className="sentiment-ripple-hud">
      <div className="ripple-header">
        <div className="ripple-title-area">
          <Activity size={14} className="text-cyan animate-pulse" />
          <span className="hud-title">INFORMATION RIPPLE / REPORT REPLAY</span>
        </div>
        <div className="ripple-narrative-tag">
          {activeNarrative?.title}
        </div>
      </div>

      <div className="ripple-playback-row">
        <div className="controls-group">
          <button 
            className="hud-ctrl-btn primary"
            onClick={onTogglePlay}
            disabled={!steps.length}
            title={isPlaying ? 'Pause Ripple Animation' : 'Play Ripple Animation'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button 
            className="hud-ctrl-btn"
            onClick={onRestart}
            disabled={!steps.length}
            title="Restart Ripple Sequence"
          >
            <RotateCcw size={13} />
            <span>RESTART</span>
          </button>

          <div className="speed-toggles">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                className={`speed-btn ${speed === s ? 'active' : ''}`}
                onClick={() => onChangeSpeed(s)}
              >
                {s}X
              </button>
            ))}
          </div>
        </div>

        <div className="current-step-telemetry">
          <span className="step-time">{currentStep.time ? `${currentStep.time} GMT` : '—'}</span>
          <span className="step-arrow">▸</span>
          <span className="step-region">{currentStep.regionName || 'No mapped reports'}</span>
          <span className="step-label">{steps.length ? `(${currentStepIndex + 1}/${steps.length})` : ''}</span>
        </div>
      </div>

      <div className="ripple-timeline-slider">
        <input 
          type="range"
          aria-label="Report timeline"
          disabled={!steps.length}
          min="0"
          max={Math.max(0, steps.length - 1)}
          value={currentStepIndex}
          onChange={e => onStepChange(Number(e.target.value))}
          className="hud-range"
        />
        <div className="timeline-ticks">
          {steps.map((st, i) => (
            <div 
              key={i} 
              style={{display: steps.length > 8 && i % Math.ceil(steps.length / 8) !== 0 && i !== steps.length - 1 ? 'none' : undefined}}
              className={`timeline-tick ${i <= currentStepIndex ? 'reached' : ''} ${i === currentStepIndex ? 'active' : ''}`}
              onClick={() => onStepChange(i)}
            >
              <span className="tick-dot"></span>
              <span className="tick-name">{st.regionName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
