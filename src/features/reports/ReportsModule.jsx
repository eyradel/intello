import React, { useState } from 'react';
import { Printer, Download, FileText, CheckCircle2, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';
import { REGIONS_DATA } from '../../data/regions.js';
import { ISSUES_DATA } from '../../data/issues.js';
import { NARRATIVES_DATA } from '../../data/narratives.js';

export default function ReportsModule() {
  const [reportType, setReportType] = useState('daily_national');
  const [selectedRegionId, setSelectedRegionId] = useState('greater-accra');

  const selectedRegion = REGIONS_DATA.find(r => r.id === selectedRegionId) || REGIONS_DATA[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-module-view">
      {/* Topbar */}
      <div className="module-topbar no-print">
        <div>
          <span className="telemetry-badge">INTELLIGENCE REPORT GENERATOR</span>
          <h2 className="module-title">Structured Intelligence Briefs & Policy Assessments</h2>
        </div>

        <div className="report-actions-group">
          <button className="hud-action-btn primary" onClick={handlePrint}>
            <Printer size={14} />
            <span>PRINT / EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selector Controls (Hidden when printing) */}
      <div className="reports-control-bar no-print">
        <div className="type-pills-row">
          {[
            { id: 'daily_national', label: 'NATIONAL DAILY BRIEF' },
            { id: 'regional_brief', label: 'REGIONAL INTELLIGENCE BRIEF' },
            { id: 'issue_brief', label: 'CRITICAL ISSUES SUMMARY' },
            { id: 'narrative_report', label: 'NARRATIVE SPREAD REPORT' }
          ].map(t => (
            <button
              key={t.id}
              className={`report-type-btn ${reportType === t.id ? 'active' : ''}`}
              onClick={() => setReportType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {reportType === 'regional_brief' && (
          <div className="region-selector-wrap">
            <label>REGION:</label>
            <select 
              value={selectedRegionId} 
              onChange={e => setSelectedRegionId(e.target.value)}
              className="hud-select"
            >
              {REGIONS_DATA.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Printable Structured Report Document */}
      <div className="printable-report-paper">
        {/* Document Classification Header */}
        <div className="report-doc-header">
          <div className="header-brand">
            <span className="brand-logo-text">GHANA POST INTELLIGENCE</span>
            <span className="doc-classification">PUBLIC SOURCE INTELLIGENCE BRIEF // LAWFUL OPEN DATA</span>
          </div>
          <div className="header-meta-doc">
            <span>DOCUMENT REF: <b>GPI-INT-2026-1022</b></span>
            <span>DATE: <b>22 OCTOBER 2026 · 14:30 GMT</b></span>
            <span>CLEARANCE: <b>OPERATIONAL CIVIC BRIEF</b></span>
          </div>
        </div>

        {/* Report Content according to type */}
        {reportType === 'daily_national' && (
          <div className="report-doc-body">
            <h1 className="report-title">NATIONAL DAILY INTELLIGENCE BRIEF</h1>
            <p className="report-subtitle">Nationwide sentiment trajectory, critical signal velocities, and public-service needs assessment.</p>

            <div className="report-executive-summary">
              <h3>1. EXECUTIVE SUMMARY</h3>
              <p>
                National public sentiment sits at <b>-24.6</b> (down 4.2 points over 24h; adjusted organic sentiment at <b>-18.6</b>).
                Primary downward pressure stems from intra-city transport tariff negotiations in Greater Accra and staple grain price fluctuations across Upper East and Northern markets.
                Model confidence index is established at <b>91.8%</b> across 284,710 verified public data points.
              </p>
            </div>

            <div className="report-section-grid">
              <div className="report-sec-box">
                <h4>2. TOP 3 CIVIC PRESSURE POINTS</h4>
                <ul>
                  <li><b>Transport Costs:</b> Accelerated grievance volume at urban terminals in Greater Accra (+47% velocity).</li>
                  <li><b>Staple Food Prices:</b> Sorghum & millet wholesale prices under upward pressure in Bolgatanga and Navrongo.</li>
                  <li><b>Utility Reliability:</b> Short-term prepaid electricity token app synchronization latency during peak hours.</li>
                </ul>
              </div>

              <div className="report-sec-box">
                <h4>3. GEOGRAPHIC PULSE RANKING</h4>
                <ul>
                  <li><b>Fastest Declining:</b> Upper East (-21, -5.7 pts), Northern (-17, -5.2 pts), Greater Accra (-31, -6.4 pts).</li>
                  <li><b>Stable / Resilient:</b> Bono (+6, +1.5 pts), Western North (-9, +0.8 pts), Volta (-5, +1.1 pts).</li>
                </ul>
              </div>
            </div>

            <div className="report-table-section">
              <h4>4. ACTIVE NARRATIVE SURVEILLANCE MATRIX</h4>
              <table className="report-print-table">
                <thead>
                  <tr>
                    <th>NARRATIVE CLUSTER</th>
                    <th>ORIGIN</th>
                    <th>CURRENT REACH</th>
                    <th>GROWTH</th>
                    <th>ORGANIC PROB.</th>
                  </tr>
                </thead>
                <tbody>
                  {NARRATIVES_DATA.map(n => (
                    <tr key={n.id}>
                      <td><b>{n.title}</b></td>
                      <td>{n.originRegionName}</td>
                      <td>{n.currentReach}</td>
                      <td>{n.growthRate}</td>
                      <td>{n.organicProbability}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="report-recommendations-block">
              <h3>5. AI CIVIC & OPERATIONAL ACTION RECOMMENDATIONS</h3>
              <div className="rec-print-item">
                <b>Ministry of Transport & GPRTU:</b> Validate ground trotro fare notices; deploy consumer assistance officers to Circle, Kaneshie, and Kejetia terminals.
              </div>
              <div className="rec-print-item">
                <b>National Food Buffer Stock Company:</b> Open direct market grain distribution sales at stabilized wholesale ceilings in Bolgatanga and Tamale.
              </div>
              <div className="rec-print-item">
                <b>Public Utilities Regulatory Commission:</b> Ensure transparent SMS updates during scheduled prepaid meter server maintenance windows.
              </div>
            </div>
          </div>
        )}

        {reportType === 'regional_brief' && (
          <div className="report-doc-body">
            <h1 className="report-title">REGIONAL INTELLIGENCE BRIEF: {selectedRegion.name.toUpperCase()}</h1>
            <p className="report-subtitle">Regional administrative profile, public grievances decomposition, and civic intervention roadmap.</p>

            <div className="report-executive-summary">
              <h3>1. REGIONAL STATUS SUMMARY</h3>
              <p>
                {selectedRegion.civicAssessment?.situation || selectedRegion.brief}
              </p>
              <div className="print-metrics-inline">
                <span>PULSE: <b>{selectedRegion.sentiment}</b></span>
                <span>24H DELTA: <b>{selectedRegion.sentiment24h} pts</b></span>
                <span>SIGNALS: <b>{selectedRegion.volume.toLocaleString()}</b></span>
                <span>CONFIDENCE: <b>{selectedRegion.confidence}%</b></span>
              </div>
            </div>

            <div className="report-section-grid">
              <div className="report-sec-box">
                <h4>2. TOP IDENTIFIED PUBLIC NEEDS</h4>
                <ol>
                  {(selectedRegion.needs || []).map((need, idx) => (
                    <li key={idx}><b>[{need.priority}]</b> {need.need} (Urgency: {need.urgency}%)</li>
                  ))}
                </ol>
              </div>

              <div className="report-sec-box">
                <h4>3. CIVIC ACTION PLAN</h4>
                <p><b>Recommended Operational Action:</b> {selectedRegion.civicAssessment?.recommendedResponse}</p>
                <p><b>Expected Measurable Indicator:</b> {selectedRegion.civicAssessment?.expectedIndicators}</p>
              </div>
            </div>
          </div>
        )}

        {reportType === 'issue_brief' && (
          <div className="report-doc-body">
            <h1 className="report-title">CRITICAL CIVIC ISSUES SUMMARY</h1>
            <p className="report-subtitle">Ranked review of national pressure categories and regional hotspots.</p>
            <table className="report-print-table">
              <thead>
                <tr>
                  <th>ISSUE</th>
                  <th>CATEGORY</th>
                  <th>INTENSITY</th>
                  <th>SENTIMENT</th>
                  <th>PRIMARY HOTSPOTS</th>
                </tr>
              </thead>
              <tbody>
                {ISSUES_DATA.slice(0, 10).map(i => (
                  <tr key={i.key}>
                    <td><b>{i.label}</b></td>
                    <td>{i.category}</td>
                    <td>{i.nationalIntensity}%</td>
                    <td>{i.sentiment}</td>
                    <td>{i.dominantRegions.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'narrative_report' && (
          <div className="report-doc-body">
            <h1 className="report-title">NARRATIVE PROPAGATION SPREAD REPORT</h1>
            <p className="report-subtitle">Tracing geographical spread, velocity, and organic credibility across detected narrative clusters.</p>
            {NARRATIVES_DATA.map(n => (
              <div key={n.id} className="narr-report-card">
                <h4>{n.title}</h4>
                <p>{n.summary}</p>
                <div className="print-metrics-inline">
                  <span>ORIGIN: <b>{n.originRegionName}</b></span>
                  <span>VELOCITY: <b>{n.velocity}</b></span>
                  <span>GROWTH: <b>{n.growthRate}</b></span>
                  <span>CONFIDENCE: <b>{n.confidence}%</b></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Footer & Security Principle */}
        <div className="report-doc-footer">
          <div className="footer-warning">
            GHANA POST INTELLIGENCE MANDATE: This analytical product is compiled strictly from lawful open-source information.
            No private communications or individual voter profiling data were processed.
          </div>
          <div className="footer-signoff">
            <span>PREPARED BY: <b>CIVIC INTELLIGENCE ANALYST UNIT</b></span>
            <span>CLASSIFICATION: <b>OFFICIAL CIVIC BRIEFING</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
