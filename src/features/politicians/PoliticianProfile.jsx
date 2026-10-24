import React from 'react';
import { ArrowLeft, Brain, TrendingUp, TrendingDown, ExternalLink, Calendar, MessageSquare, ShieldAlert } from 'lucide-react';
import MiniChart from '../../components/MiniChart.jsx';

export default function PoliticianProfile({ politician, onBack, onNavigate }) {
  if (!politician) return null;

  const isPos = politician.nationalSentiment > 5;
  const isNeg = politician.nationalSentiment < -5;

  return (
    <div className="politician-profile-view">
      <div className="profile-header-bar">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>BACK TO PUBLIC FIGURES DIRECTORY</span>
        </button>
        <div className="disclaimer-chip">AUTHENTIC PUBLIC ENTITY INTELLIGENCE</div>
      </div>

      <div className="profile-hero-card">
        <div className="avatar-portrait">
          <span className="portrait-initials">{politician.initials}</span>
          <span className="portrait-party-badge">{politician.party}</span>
        </div>

        <div className="profile-bio-wrap">
          <h1 className="figure-name">{politician.name}</h1>
          <p className="figure-role">{politician.role}</p>
          <div className="figure-meta-tags">
            <span className="tag">AFFILIATION: <b>{politician.affiliation}</b></span>
            {politician.popularityScore !== undefined && (
              <span className="tag" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}>
                POPULARITY: <b>{politician.popularityScore}/100 ({politician.popularityLevel || 'HIGH'})</b>
              </span>
            )}
            <span className="tag">MENTIONS: <b>{politician.mentions}</b></span>
            <span className="tag">VELOCITY: <b>{politician.velocity}</b></span>
            <span className="tag">CONFIDENCE: <b>{politician.confidence}%</b></span>
            {politician.isLiveScraped && (
              <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                ● LIVE SCRAPED (0-QUOTA)
              </span>
            )}
          </div>
        </div>

        <div className="profile-sentiment-scorebox">
          <small>NATIONAL SENTIMENT INDEX</small>
          <strong className={`sentiment-score ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
            {politician.nationalSentiment > 0 ? '+' : ''}{politician.nationalSentiment}
          </strong>
          <span className={`movement-stat ${politician.movement24h > 0 ? 'pos' : 'neg'}`}>
            {politician.movement24h > 0 ? '▲ +' : '▼ '}{politician.movement24h} pts / 24H
          </span>
          <span className="movement-sub">
            7D: {politician.movement7d > 0 ? '+' : ''}{politician.movement7d} pts · 30D: {politician.movement30d > 0 ? '+' : ''}{politician.movement30d} pts
          </span>
        </div>
      </div>

      {/* Sentiment Split & Historical Trajectory */}
      <div className="profile-middle-grid">
        <article className="hud-card">
          <div className="hud-card-header">
            <span className="card-kicker">PUBLIC DISCUSSION RATIO</span>
            <span className="ratio-total">100% SAMPLED</span>
          </div>
          <div className="sentiment-ratio-bar tall">
            <div className="seg pos" style={{ width: `${politician.positivePct}%` }} title={`Positive: ${politician.positivePct}%`} />
            <div className="seg neu" style={{ width: `${politician.neutralPct}%` }} title={`Neutral: ${politician.neutralPct}%`} />
            <div className="seg neg" style={{ width: `${politician.negativePct}%` }} title={`Negative: ${politician.negativePct}%`} />
          </div>
          <div className="ratio-legend">
            <span className="r-item pos"><b>{politician.positivePct}%</b> POSITIVE</span>
            <span className="r-item neu"><b>{politician.neutralPct}%</b> NEUTRAL</span>
            <span className="r-item neg"><b>{politician.negativePct}%</b> NEGATIVE</span>
          </div>
        </article>

        <article className="hud-card">
          <div className="hud-card-header">
            <span className="card-kicker">14-DAY SENTIMENT TIMELINE</span>
            <span className="card-kicker">TRAJECTORY</span>
          </div>
          <MiniChart values={politician.sentimentHistory || [0, 2, 4, 6, 8, 10, 12]} />
          <div className="chart-foot">
            <span>D-14</span>
            <span>VELOCITY: {politician.velocity}</span>
            <span>NOW</span>
          </div>
        </article>

        <article className="hud-card">
          <div className="hud-card-header">
            <span className="card-kicker">SOURCE CHANNELS</span>
            <span className="card-kicker">DISTRIBUTION</span>
          </div>
          <div className="source-dist-list">
            <div className="source-row"><span>News Media</span><b>{politician.sourceDistribution?.news}%</b></div>
            <div className="source-row"><span>Public Social Media</span><b>{politician.sourceDistribution?.social}%</b></div>
            <div className="source-row"><span>Broadcast Call-ins</span><b>{politician.sourceDistribution?.broadcast}%</b></div>
            <div className="source-row"><span>Public Forums</span><b>{politician.sourceDistribution?.forums}%</b></div>
          </div>
        </article>
      </div>

      {/* Driver Analysis & Regional Breakdown */}
      <div className="profile-bottom-grid">
        {/* Driver Topics */}
        <article className="hud-card">
          <div className="hud-card-header">
            <span className="card-kicker">DISCUSSION DRIVERS</span>
            <h3 className="card-title">Top Associated Issues</h3>
          </div>

          <div className="topic-block-wrap">
            <div className="topic-sub-col">
              <span className="sub-title pos">POSITIVE DISCUSSION DRIVERS</span>
              <ul>
                {(politician.topPositiveIssues || []).map((t, idx) => (
                  <li key={idx}><span className="bullet pos"></span>{t}</li>
                ))}
              </ul>
            </div>

            <div className="topic-sub-col">
              <span className="sub-title neg">NEGATIVE GRIEVANCE DRIVERS</span>
              <ul>
                {(politician.topNegativeIssues || []).map((t, idx) => (
                  <li key={idx}><span className="bullet neg"></span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        {/* AI Summary */}
        <article className="hud-card">
          <div className="hud-card-header">
            <span className="card-kicker">CIVIC SUMMARY ENGINE</span>
            <Brain size={16} className="text-cyan animate-pulse" />
          </div>
          <p className="ai-brief-text">{politician.aiSummary}</p>

          <div className="events-timeline-sub">
            <span className="sub-title">RECENT CORRELATED EVENTS</span>
            {(politician.events || []).map((ev, idx) => (
              <div key={idx} className="event-sub-row">
                <span className="ev-date">{ev.date}</span>
                <span className="ev-name">{ev.title}</span>
                <span className="ev-impact">{ev.impact}</span>
              </div>
            ))}
          </div>

          <div className="guardrail-footer">
            PUBLIC-SOURCE AGGREGATE ONLY // No private messages or personal voter profiling data.
          </div>
        </article>
      </div>

      {/* Live Policy Points & Scraped Web Citations */}
      {politician.points && politician.points.length > 0 && (
        <article className="hud-card mb-4" style={{ marginTop: '16px' }}>
          <div className="hud-card-header">
            <span className="card-kicker">KEY POLICY POSITIONS & PUBLIC STANCES</span>
            <span className="ratio-total text-cyan-400 font-mono text-xs">LIVE HEURISTIC EXTRACTION</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            {politician.points.map((pt, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 p-2.5 rounded flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span className="text-xs text-slate-200 leading-relaxed font-sans">{pt}</span>
              </div>
            ))}
          </div>
        </article>
      )}

      {politician.recentArticles && politician.recentArticles.length > 0 && (
        <article className="hud-card mb-4" style={{ marginTop: '16px' }}>
          <div className="hud-card-header">
            <span className="card-kicker">VERIFIED PRESS WIRE CITATIONS ({politician.recentArticles.length})</span>
            <span className="ratio-total text-emerald-400 font-mono text-xs">REAL-TIME WEB WIRE</span>
          </div>
          <div className="divide-y divide-slate-800/80 p-2">
            {politician.recentArticles.map((art, idx) => (
              <div key={idx} className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-900/50 rounded transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    {art.url ? (
                      <a 
                        href={art.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        <span>{art.headline}</span>
                        <ExternalLink size={11} className="text-cyan-400 opacity-70" />
                      </a>
                    ) : (
                      <span>{art.headline}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Source: {art.source} · Published: {new Date(art.time).toLocaleDateString()}
                  </div>
                </div>
                {art.sentiment !== undefined && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    art.sentiment > 10 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    art.sentiment < -10 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {art.sentiment > 0 ? `+${art.sentiment}` : art.sentiment}
                  </span>
                )}
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}
