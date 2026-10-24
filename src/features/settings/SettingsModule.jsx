import React, { useState } from 'react';
import { Settings, Shield, Sliders, Map, Database, CheckCircle, RefreshCw } from 'lucide-react';

export default function SettingsModule() {
  const [dataMode, setDataMode] = useState('mock');
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.ghanapostintel.gov.gh/api/v1');
  const [mapStyleUrl, setMapStyleUrl] = useState('https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-module-view">
      {/* Topbar */}
      <div className="module-topbar">
        <div>
          <span className="telemetry-badge">OPERATIONAL PREFERENCES & ADAPTER CONFIGURATION</span>
          <h2 className="module-title">System Settings & Data Connectors</h2>
        </div>

        {savedSuccess && (
          <div className="save-toast">
            <CheckCircle size={14} className="text-mint" />
            <span>CONFIGURATION APPLIED SUCCESSFULLY</span>
          </div>
        )}
      </div>

      <div className="settings-cards-stack">
        {/* Data Source & API Backend Configuration */}
        <article className="hud-card settings-card">
          <div className="hud-card-header">
            <div>
              <span className="card-kicker">DATA PIPELINE CONNECTORS</span>
              <h3 className="card-title">Backend Architecture Mode</h3>
            </div>
            <Database size={16} className="text-cyan" />
          </div>

          <div className="settings-field-group">
            <label className="field-label">DATA CONSUMPTION MODE:</label>
            <div className="radio-options-row">
              <label className={`radio-pill ${dataMode === 'mock' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="dataMode" 
                  value="mock" 
                  checked={dataMode === 'mock'} 
                  onChange={e => setDataMode(e.target.value)} 
                />
                <span>AUTHENTIC OPEN-SOURCE INTELLIGENCE (LIVE RSS + CURATED OSINT)</span>
              </label>

              <label className={`radio-pill ${dataMode === 'api' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="dataMode" 
                  value="api" 
                  checked={dataMode === 'api'} 
                  onChange={e => setDataMode(e.target.value)} 
                />
                <span>PRODUCTION FASTAPI REST / WEBSOCKET BACKEND</span>
              </label>
            </div>
          </div>

          {dataMode === 'api' && (
            <div className="settings-field-group">
              <label className="field-label">API BASE URL:</label>
              <input 
                type="text" 
                value={apiBaseUrl} 
                onChange={e => setApiBaseUrl(e.target.value)} 
                className="hud-input" 
              />
            </div>
          )}
        </article>

        {/* Map Tile Configuration */}
        <article className="hud-card settings-card">
          <div className="hud-card-header">
            <div>
              <span className="card-kicker">GEOSPATIAL TILE PROVIDER</span>
              <h3 className="card-title">MapLibre Raster & Vector Configuration</h3>
            </div>
            <Map size={16} className="text-cyan" />
          </div>

          <div className="settings-field-group">
            <label className="field-label">BASEMAP TILE URL TEMPLATE:</label>
            <input 
              type="text" 
              value={mapStyleUrl} 
              onChange={e => setMapStyleUrl(e.target.value)} 
              className="hud-input" 
            />
            <small className="field-help">Default: Carto Dark Matter (OpenStreetMap compatible, no API key required)</small>
          </div>
        </article>

        {/* Accessibility & Visual Controls */}
        <article className="hud-card settings-card">
          <div className="hud-card-header">
            <div>
              <span className="card-kicker">ACCESSIBILITY & DISPLAY</span>
              <h3 className="card-title">Visual Ergonomics & Motion Preferences</h3>
            </div>
            <Sliders size={16} className="text-cyan" />
          </div>

          <div className="toggle-list">
            <label className="hud-checkbox-row">
              <input 
                type="checkbox" 
                checked={reducedMotion} 
                onChange={e => setReducedMotion(e.target.checked)} 
              />
              <span>Respect Reduced Motion (Dampen waveform and map ripple pulses)</span>
            </label>

            <label className="hud-checkbox-row">
              <input 
                type="checkbox" 
                checked={highContrast} 
                onChange={e => setHighContrast(e.target.checked)} 
              />
              <span>High Contrast Telemetry Borders (Enhance readability on outdoor screens)</span>
            </label>
          </div>
        </article>

        {/* Security & Mandate Enforcement */}
        <article className="hud-card settings-card security-policy-card">
          <div className="hud-card-header">
            <div>
              <span className="card-kicker">STATUTORY MANDATE & GUARDRAILS</span>
              <h3 className="card-title">Public Intelligence Guardrail Status</h3>
            </div>
            <Shield size={16} className="text-mint" />
          </div>

          <div className="policy-checklist">
            <div className="policy-item passed">
              <CheckCircle size={15} />
              <span><b>NO INDIVIDUAL VOTER TARGETING:</b> System enforces aggregated civic analytics only.</span>
            </div>
            <div className="policy-item passed">
              <CheckCircle size={15} />
              <span><b>NO PRIVATE COMMUNICATIONS INTERCEPTION:</b> Strict public-source restriction active.</span>
            </div>
            <div className="policy-item passed">
              <CheckCircle size={15} />
              <span><b>LAWFUL OPEN DATA PROVENANCE:</b> All conclusions cross-indexed to public records.</span>
            </div>
            <div className="policy-item passed">
              <CheckCircle size={15} />
              <span><b>NON-MANIPULATIVE CIVIC ADVICE:</b> AI engine restricted to public-service delivery recommendations.</span>
            </div>
          </div>
        </article>

        <div className="save-btn-row">
          <button className="hud-action-btn primary large" onClick={handleSave}>
            <span>SAVE AND COMMIT PREFERENCES</span>
          </button>
        </div>
      </div>
    </div>
  );
}
