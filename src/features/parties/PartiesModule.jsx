import React, { useState } from 'react';
import { Flag, BarChart2, Share2, Layers, TrendingUp, Info } from 'lucide-react';
import { PARTIES_DATA } from '../../data/parties.js';
import MiniChart from '../../components/MiniChart.jsx';

export default function PartiesModule() {
  const [activePartyId, setActivePartyId] = useState('npp');

  const selectedParty = PARTIES_DATA.find(p => p.id === activePartyId) || PARTIES_DATA[0];

  return (
    <div className="parties-module-view">
      {/* Header */}
      <div className="module-topbar">
        <div>
          <span className="telemetry-badge">POLITICAL PARTY & MOVEMENT DISCUSSION INTELLIGENCE</span>
          <h2 className="module-title">Party Discussion Share & Issue Alignment</h2>
        </div>
        <div className="synthetic-disclaimer-pill">
          PUBLIC DISCUSSION VOLUME · NOT VOTER POLLING DATA
        </div>
      </div>

      {/* Comparative Party Overview Strip */}
      <div className="parties-overview-strip">
        {PARTIES_DATA.map(party => {
          const isSelected = party.id === activePartyId;
          const isPos = party.discussionSentiment > 5;
          const isNeg = party.discussionSentiment < -5;

          return (
            <div 
              key={party.id}
              className={`party-strip-card ${isSelected ? 'active' : ''}`}
              onClick={() => setActivePartyId(party.id)}
            >
              <div className="strip-top">
                <span className="party-dot" style={{ backgroundColor: party.color }}></span>
                <span className="party-name-abbr">{party.shortName}</span>
                <span className="share-pct">{party.nationalDiscussionShare}% SHARE</span>
              </div>

              <div className="strip-metric-row">
                <div>
                  <small>SENTIMENT</small>
                  <strong className={`metric-val ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
                    {party.discussionSentiment > 0 ? '+' : ''}{party.discussionSentiment}
                  </strong>
                </div>
                <div>
                  <small>MENTIONS</small>
                  <span>{party.mentions}</span>
                </div>
                <div>
                  <small>VELOCITY</small>
                  <span className="pos">{party.velocity}</span>
                </div>
              </div>

              <div className="party-progress-track">
                <div 
                  className="party-progress-bar" 
                  style={{ width: `${party.nationalDiscussionShare * 2}%`, backgroundColor: party.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Party Deep Intelligence Breakdown */}
      <div className="party-detail-grid">
        {/* Left Column: Associated Issues & Regional Discussion */}
        <div className="col-stack">
          {/* Issue Ownership & Association */}
          <article className="hud-card">
            <div className="hud-card-header">
              <span className="card-kicker">ISSUE ASSOCIATION & OWNERSHIP</span>
              <span className="card-kicker">{selectedParty.name}</span>
            </div>

            <div className="party-issues-stack">
              {selectedParty.topIssuesAssociated.map(item => {
                const isItemPos = item.sentiment > 0;
                return (
                  <div key={item.issue} className="party-issue-row">
                    <div className="iss-title-wrap">
                      <b>{item.issue}</b>
                      <span className={`iss-sent ${isItemPos ? 'pos' : 'neg'}`}>
                        {item.sentiment > 0 ? '+' : ''}{item.sentiment}
                      </span>
                    </div>
                    <div className="hud-progress-track">
                      <div 
                        className={`hud-progress-fill ${isItemPos ? 'mint' : 'crit'}`}
                        style={{ width: `${item.share * 2.8}%` }}
                      />
                    </div>
                    <div className="iss-share-sub">Discussion Share: {item.share}%</div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Regional Discussion Sentiment Distribution */}
          <article className="hud-card">
            <div className="hud-card-header">
              <span className="card-kicker">REGIONAL SENTIMENT SPREAD</span>
              <span className="card-kicker">16 REGIONS</span>
            </div>

            <div className="regional-spread-grid">
              {Object.entries(selectedParty.regionalDiscussion || {}).map(([regId, score]) => (
                <div key={regId} className="spread-item">
                  <span className="reg-abbr">{regId.replace(/-/g, ' ').toUpperCase()}</span>
                  <span className={`reg-val ${score < 0 ? 'neg' : 'pos'}`}>
                    {score > 0 ? '+' : ''}{score}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Right Column: Narratives & Sentiment Trajectory */}
        <div className="col-stack">
          {/* Historical Sentiment */}
          <article className="hud-card">
            <div className="hud-card-header">
              <span className="card-kicker">14-DAY SENTIMENT TRAJECTORY</span>
              <span className="card-kicker">{selectedParty.shortName}</span>
            </div>
            <MiniChart values={selectedParty.sentimentHistory || [2, 3, 4, 5, 4, 6, 5]} />
            <div className="chart-foot">
              <span>D-14</span>
              <span>24H DELTA: {selectedParty.sentiment24h > 0 ? '+' : ''}{selectedParty.sentiment24h} pts</span>
              <span>NOW</span>
            </div>
          </article>

          {/* Major Narrative Clusters */}
          <article className="hud-card">
            <div className="hud-card-header">
              <span className="card-kicker">ACTIVE NARRATIVE CLUSTERS</span>
              <Layers size={15} className="text-cyan" />
            </div>

            <div className="party-narrative-list">
              {selectedParty.narrativeClusters.map((narr, idx) => (
                <div key={idx} className="party-narr-item">
                  <div className="narr-num">CLUSTER 0{idx + 1}</div>
                  <p className="narr-txt">"{narr}"</p>
                </div>
              ))}
            </div>
          </article>

          {/* Channel Share */}
          <article className="hud-card">
            <div className="hud-card-header">
              <span className="card-kicker">MEDIA & SOURCE EXPOSURE</span>
              <span className="card-kicker">{selectedParty.mediaShare}% MEDIA SHARE</span>
            </div>
            <div className="source-dist-list">
              <div className="source-row"><span>News Portals</span><b>{selectedParty.sourceDistribution?.news}%</b></div>
              <div className="source-row"><span>Public Social Discussions</span><b>{selectedParty.sourceDistribution?.social}%</b></div>
              <div className="source-row"><span>Broadcast Call-ins</span><b>{selectedParty.sourceDistribution?.broadcast}%</b></div>
              <div className="source-row"><span>Townhall / Forums</span><b>{selectedParty.sourceDistribution?.forums}%</b></div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
