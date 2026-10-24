import React from 'react';
import { ArrowLeft, Brain, ShieldCheck, AlertTriangle, ExternalLink, Activity, Users, Radio, CheckCircle, BarChart3 } from 'lucide-react';
import { EVIDENCE_DATA } from '../../data/evidence.js';
import { POLITICIANS_DATA } from '../../data/politicians.js';
import { NARRATIVES_DATA } from '../../data/narratives.js';

export default function RegionDeepScan({ region, onBack, onNavigate, onSelectEvidence }) {
  if (!region) return null;

  const isPos = region.sentiment > 5;
  const isNeg = region.sentiment < -5;

  // Tracked politicians associated with this region
  const associatedPoliticians = POLITICIANS_DATA.filter(p => 
    region.trackedPoliticians?.includes(p.id) || p.highestDiscussionRegions?.includes(region.name)
  );

  // Relevant evidence items
  const regionEvidence = EVIDENCE_DATA.filter(e => e.region === region.name);

  // Associated narratives
  const activeNarratives = NARRATIVES_DATA.filter(n => n.affectedRegions.includes(region.id));

  return (
    <div className="region-deep-scan-view">
      {/* Top Banner & Navigation */}
      <div className="deep-scan-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>BACK TO REGIONS DIRECTORY</span>
        </button>

        <div className="header-meta">
          <span className="telemetry-badge">ADM1 STRATEGIC SCAN</span>
          <span className={`threat-badge ${region.signal}`}>{region.signal.toUpperCase()}</span>
        </div>
      </div>

      <div className="deep-scan-title-row">
        <div>
          <h1 className="region-headline">{region.name.toUpperCase()} REGION</h1>
          <p className="region-subtitle">
            Capital: <b>{region.capital}</b> · Coordinates: <b>{region.center?.[1]?.toFixed(3)}°N, {Math.abs(region.center?.[0] || 0)?.toFixed(3)}°W</b> · Classification: Urban / Transit Epicenter
          </p>
        </div>

        <div className="score-hero-box">
          <div className="score-num-wrap">
            <span className="score-sub">REGIONAL PULSE</span>
            <strong className={`score-jumbo ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
              {region.sentiment > 0 ? '+' : ''}{region.sentiment}
            </strong>
          </div>
          <div className="movement-stack">
            <span className={region.sentiment24h < 0 ? 'neg' : 'pos'}>
              24H: {region.sentiment24h > 0 ? '▲ +' : '▼ '}{region.sentiment24h} pts
            </span>
            <span className={region.sentiment7d < 0 ? 'neg' : 'pos'}>
              7D: {region.sentiment7d > 0 ? '▲ +' : '▼ '}{region.sentiment7d} pts
            </span>
            <span className={region.sentiment30d < 0 ? 'neg' : 'pos'}>
              30D: {region.sentiment30d > 0 ? '▲ +' : '▼ '}{region.sentiment30d} pts
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Telemetry Metrics */}
      <div className="deep-scan-grid-top">
        <div className="hud-metric-tile">
          <small>PUBLIC SIGNALS</small>
          <strong>{region.volume?.toLocaleString()}</strong>
          <span className="trend-text pos">{region.velocity || '+14.2%/hr'}</span>
        </div>

        <div className="hud-metric-tile">
          <small>CONFIDENCE INDEX</small>
          <strong className="pos">{region.confidence}%</strong>
          <span className="trend-text">High Source Diversity</span>
        </div>

        <div className="hud-metric-tile">
          <small>SENTIMENT SPLIT</small>
          <div className="sentiment-ratio-bar">
            <div className="seg pos" style={{ width: `${region.positivePct}%` }} title={`Positive: ${region.positivePct}%`} />
            <div className="seg neu" style={{ width: `${region.neutralPct}%` }} title={`Neutral: ${region.neutralPct}%`} />
            <div className="seg neg" style={{ width: `${region.negativePct}%` }} title={`Negative: ${region.negativePct}%`} />
          </div>
          <span className="ratio-labels">
            POS {region.positivePct}% · NEU {region.neutralPct}% · NEG {region.negativePct}%
          </span>
        </div>

        <div className="hud-metric-tile">
          <small>PARTY DISCUSSION</small>
          <strong>NPP {region.partyDiscussion?.npp || 45}% · NDC {region.partyDiscussion?.ndc || 45}%</strong>
          <span className="trend-text">Other / Ind: {region.partyDiscussion?.others || 10}%</span>
        </div>
      </div>

      <div className="deep-scan-content-grid">
        {/* Left Column: Issues & Public Needs */}
        <div className="col-stack">
          {/* Public Needs Engine */}
          <article className="hud-card">
            <div className="hud-card-header">
              <div>
                <span className="card-kicker">PUBLIC NEEDS ENGINE</span>
                <h3 className="card-title">Priority Citizen Grievances</h3>
              </div>
              <Activity size={16} className="text-cyan" />
            </div>

            <div className="needs-list">
              {(region.needs || []).map((need, idx) => (
                <div key={idx} className="need-card">
                  <div className="need-top">
                    <span className="need-rank">#{idx + 1}</span>
                    <span className={`urgency-pill ${need.priority?.toLowerCase()}`}>
                      {need.priority} PRIORITY ({need.urgency}%)
                    </span>
                  </div>
                  <p className="need-desc">{need.need}</p>
                  <div className="need-track">
                    <div className="need-fill" style={{ width: `${need.urgency}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Issue Pressure Distribution */}
          <article className="hud-card">
            <div className="hud-card-header">
              <div>
                <span className="card-kicker">ISSUE GRIEVANCE DECOMPOSITION</span>
                <h3 className="card-title">Top Regional Concerns</h3>
              </div>
              <BarChart3 size={16} className="text-cyan" />
            </div>

            <div className="issue-full-breakdown">
              {(region.issues || []).map(iss => (
                <div key={iss.name} className="issue-detail-row">
                  <div className="iss-detail-top">
                    <b>{iss.name}</b>
                    <span className="iss-growth">{iss.growth}</span>
                    <span className={`iss-score ${iss.sentiment < -30 ? 'neg' : 'pos'}`}>
                      {iss.sentiment > 0 ? '+' : ''}{iss.sentiment}
                    </span>
                  </div>
                  <div className="hud-progress-track">
                    <div className="hud-progress-fill crit" style={{ width: `${iss.share * 2.5}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Right Column: AI Civic Response, Narratives, Anomalies & Evidence */}
        <div className="col-stack">
          {/* AI Civic Assessment */}
          <article className="hud-card ai-assessment-card">
            <div className="hud-card-header">
              <div>
                <span className="card-kicker">CIVIC RESPONSE ENGINE</span>
                <h3 className="card-title">AI Operational Assessment</h3>
              </div>
              <Brain size={18} className="text-cyan animate-pulse" />
            </div>

            <div className="assessment-body">
              <div className="assess-block">
                <span className="block-label">CURRENT SITUATION</span>
                <p>{region.civicAssessment?.situation || region.brief}</p>
              </div>

              <div className="assess-block">
                <span className="block-label">ROOT CAUSAL DRIVERS</span>
                <p>{region.civicAssessment?.drivers || 'Tariff adjustments, seasonal weather impacts, transit freight markups.'}</p>
              </div>

              <div className="assess-block">
                <span className="block-label">RISK PROJECTION</span>
                <p>{region.civicAssessment?.risk || 'Elevated risk of localized commuter slowdowns and market trade friction.'}</p>
              </div>

              <div className="assess-block highlight">
                <span className="block-label">RECOMMENDED PUBLIC SERVICE RESPONSE</span>
                <p>{region.civicAssessment?.recommendedResponse}</p>
              </div>

              <div className="assess-block">
                <span className="block-label">EXPECTED INDICATORS TO MONITOR</span>
                <p>{region.civicAssessment?.expectedIndicators}</p>
              </div>
            </div>

            <div className="guardrail-footer">
              GUARDRAIL: Recommendations strictly address administrative and service delivery transparency. No individual political persuasion.
            </div>
          </article>

          {/* Regional Anomalies */}
          {region.anomalies?.length > 0 && (
            <article className="hud-card alert-card">
              <div className="hud-card-header">
                <div>
                  <span className="card-kicker">ANOMALY SURVEILLANCE</span>
                  <h3 className="card-title">Recent Irregularities</h3>
                </div>
                <AlertTriangle size={18} className="text-amber" />
              </div>
              <div className="anomalies-stack">
                {region.anomalies.map(anom => (
                  <div key={anom.id} className="anomaly-item">
                    <div className="anom-top">
                      <span className="anom-type">{anom.type}</span>
                      <span className="anom-score">SURGE SCORE: {anom.score}/100</span>
                    </div>
                    <p className="anom-desc">{anom.description}</p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* Associated Verifiable Evidence */}
          <article className="hud-card">
            <div className="hud-card-header">
              <div>
                <span className="card-kicker">OPEN-SOURCE EVIDENCE TRACE</span>
                <h3 className="card-title">Ground Observation Logs</h3>
              </div>
              <button className="hud-btn-sm" onClick={() => onNavigate('Evidence')}>ALL EVIDENCE</button>
            </div>

            <div className="evidence-mini-list">
              {regionEvidence.length === 0 ? (
                <div className="empty-state-text">No anomalous critical evidence flagged in current window.</div>
              ) : (
                regionEvidence.map(ev => (
                  <div key={ev.id} className="evidence-mini-card">
                    <div className="ev-top">
                      <span className="ev-plat">{ev.platform}</span>
                      <time className="ev-time">{ev.timestamp}</time>
                    </div>
                    <p className="ev-excerpt">"{ev.excerpt}"</p>
                    <div className="ev-foot">
                      <span>CONF: {ev.confidence}%</span>
                      <a href={ev.url} target="_blank" rel="noreferrer" className="ev-link">
                        <span>SOURCE RECORD</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
