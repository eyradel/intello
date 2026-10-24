import React from 'react';
import { ShieldAlert, AlertTriangle, Cpu, Radio, Activity, Eye, CheckCircle2, RefreshCw } from 'lucide-react';
import { COORDINATION_DATA } from '../../data/coordination.js';

export default function CoordinationWatch({ useAdjustedSentiment, onToggleAdjustedSentiment }) {
  const data = COORDINATION_DATA;

  return (
    <div className="coordination-module-view">
      {/* Topbar */}
      <div className="module-topbar">
        <div>
          <span className="telemetry-badge">INAUTHENTIC ACTIVITY & SYNCHRONIZED AMPLIFICATION</span>
          <h2 className="module-title">Coordination Watch & Sybil Detection</h2>
        </div>

        <button 
          className={`hud-action-btn ${useAdjustedSentiment ? 'primary' : ''}`}
          onClick={onToggleAdjustedSentiment}
        >
          <RefreshCw size={14} />
          <span>{useAdjustedSentiment ? 'USING ADJUSTED SENTIMENT' : 'ACTIVATE ORGANIC ADJUSTMENT'}</span>
        </button>
      </div>

      {/* Top Analytics Triad */}
      <div className="coordination-stat-strip">
        <div className="stat-box">
          <small>GLOBAL COORDINATION RISK</small>
          <strong className="amber">{data.globalCoordinationRisk} ({data.globalRiskScore}%)</strong>
          <span>Elevated cluster activity detected</span>
        </div>

        <div className="stat-box">
          <small>ACTIVE AMPLIFICATION CLUSTERS</small>
          <strong className="crit">{data.activeClustersCount} CAMPAIGNS</strong>
          <span>{data.flaggedAccountsCount} suspicious account nodes</span>
        </div>

        <div className="stat-box">
          <small>RAW VS ADJUSTED NATIONAL SENTIMENT</small>
          <div className="sentiment-compare-duo">
            <div>RAW: <b className="neg">{data.rawNationalSentiment}</b></div>
            <div>ADJUSTED: <b className="pos">{data.adjustedNationalSentiment}</b></div>
          </div>
          <span className="delta-note">+6.0 pts organic recovery</span>
        </div>

        <div className="stat-box">
          <small>TEXT SIMILARITY SYNDICATES</small>
          <strong className="pos">{data.metrics.textSimilarityClusters} ACTIVE</strong>
          <span>Peak synchrony: {data.metrics.simultaneousPostsPeak} posts/min</span>
        </div>
      </div>

      {/* Methodology Explanation Banner */}
      <div className="methodology-card">
        <div className="meth-header">
          <Cpu size={16} className="text-cyan" />
          <h4>ORGANIC SENTIMENT FILTERING METHODOLOGY</h4>
        </div>
        <p>{data.adjustmentExplanation}</p>
        <div className="meth-footer">
          <span>COORDINATION PRINCIPLE: We report probabilistic risk tiers, not definitive bot labels, preserving evidentiary rigor.</span>
        </div>
      </div>

      {/* Active Coordinated Clusters List */}
      <div className="clusters-section">
        <div className="section-title">IDENTIFIED INAUTHENTIC BEHAVIOR CLUSTERS ({data.clusters.length})</div>

        <div className="clusters-grid">
          {data.clusters.map(cluster => (
            <div key={cluster.id} className="cluster-card">
              <div className="cluster-card-top">
                <div className="cluster-id-wrap">
                  <span className="cluster-id">{cluster.id}</span>
                  <span className="cluster-level-badge">{cluster.level}</span>
                </div>
                <div className="risk-score-pill">
                  RISK SCORE: <b>{cluster.riskScore}%</b>
                </div>
              </div>

              <h3 className="cluster-title">{cluster.title}</h3>

              <div className="copypasta-box">
                <span className="box-label">IDENTICAL PHRASE CLUSTER:</span>
                <p className="copypasta-text">"{cluster.identicalPhrase}"</p>
              </div>

              <div className="cluster-metrics-grid">
                <div>
                  <small>SYNCHRONY WINDOW</small>
                  <b>{cluster.temporalSpreadMinutes} mins</b>
                </div>
                <div>
                  <small>SIMILARITY INDEX</small>
                  <b>{cluster.similarityScore}%</b>
                </div>
                <div>
                  <small>ACCOUNT NODES</small>
                  <b>{cluster.uniqueAccounts} handles</b>
                </div>
                <div>
                  <small>MEDIAN ACC. AGE</small>
                  <b>{cluster.accountAgeMedianDays} days</b>
                </div>
              </div>

              <div className="probability-duo">
                <div className="prob-item">
                  <span>BOTNET PROBABILITY:</span>
                  <strong className="crit">{cluster.botProbability}%</strong>
                </div>
                <div className="prob-item">
                  <span>ASTROTURFING PROBABILITY:</span>
                  <strong className="amber">{cluster.astroturfingProbability}%</strong>
                </div>
              </div>

              <div className="cluster-impact-box">
                <b>ORGANIC IMPACT:</b> {cluster.organicImpact}
              </div>

              <div className="cluster-card-foot">
                <span>STATUS: <b>{cluster.status}</b></span>
                <span className="first-det">Detected: {cluster.firstDetected}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
