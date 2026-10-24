import React, { useState, useMemo } from 'react';
import {
  Search, ExternalLink, ShieldCheck, FileText, CheckCircle2,
  Radio, Newspaper, Monitor, MessageSquare, ChevronRight, X,
  Hash, AlertTriangle, Eye, BarChart2, Users
} from 'lucide-react';
import { EVIDENCE_DATA } from '../../data/evidence.js';
import { REGIONS_DATA } from '../../data/regions.js';

const PLATFORM_TYPES = ['ALL', 'Broadcast Audio Transcript', 'Public Social Media', 'Verified News Report', 'Government Release'];
const ISSUE_TYPES = ['ALL', ...new Set(EVIDENCE_DATA.map(e => e.issue))];
const PAGE_SIZE = 10;

function PlatformIcon({ type }) {
  if (type?.includes('Broadcast')) return <Radio size={13} className="text-cyan" />;
  if (type?.includes('Social')) return <MessageSquare size={13} className="text-amber-400" />;
  if (type?.includes('News')) return <Newspaper size={13} className="text-sky-400" />;
  return <Monitor size={13} className="text-slate-400" />;
}

export default function EvidenceExplorer() {
  const [regionFilter, setRegionFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [issueFilter, setIssueFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return EVIDENCE_DATA.filter(ev => {
      const matchReg = !regionFilter || ev.region === regionFilter;
      const matchPlatform = platformFilter === 'ALL' || ev.platformType === platformFilter;
      const matchIssue = issueFilter === 'ALL' || ev.issue === issueFilter;
      const matchQ = !searchQuery ||
        `${ev.excerpt} ${ev.platform} ${ev.entity} ${ev.issue} ${ev.region}`
          .toLowerCase().includes(searchQuery.toLowerCase());
      return matchReg && matchPlatform && matchIssue && matchQ;
    });
  }, [regionFilter, platformFilter, issueFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
    setSelectedEvidence(null);
  };

  // Summary stats
  const avgConf = filtered.length ? Math.round(filtered.reduce((s, e) => s + e.confidence, 0) / filtered.length) : 0;
  const negCount = filtered.filter(e => e.sentiment < -20).length;
  const posCount = filtered.filter(e => e.sentiment > 10).length;

  return (
    <div className="evidence-module-view">
      {/* Topbar */}
      <div className="module-topbar">
        <div>
          <span className="telemetry-badge">PROVENANCE TRACEABILITY &amp; VERIFICATION</span>
          <h2 className="module-title">Open-Source Ground Evidence Repository</h2>
        </div>
        <div className="provenance-chip">
          <ShieldCheck size={14} className="text-cyan" />
          <span>100% LAWFUL PUBLIC SOURCE // NO SURVEILLANCE</span>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="evidence-stats-strip">
        <div className="ev-stat">
          <small>TOTAL RECORDS</small>
          <strong>{EVIDENCE_DATA.length}</strong>
        </div>
        <div className="ev-stat">
          <small>FILTERED</small>
          <strong className="text-cyan">{filtered.length}</strong>
        </div>
        <div className="ev-stat">
          <small>AVG CONFIDENCE</small>
          <strong className="pos">{avgConf}%</strong>
        </div>
        <div className="ev-stat">
          <small>NEGATIVE SIGNALS</small>
          <strong className="neg">{negCount}</strong>
        </div>
        <div className="ev-stat">
          <small>POSITIVE SIGNALS</small>
          <strong className="pos">{posCount}</strong>
        </div>
        <div className="ev-stat">
          <small>SOURCE TYPES</small>
          <strong>{new Set(EVIDENCE_DATA.map(e => e.platformType)).size}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="evidence-filter-bar">
        <div className="search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search excerpts, entities, platforms, URLs..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setPage(1); }} className="search-clear-btn">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="region-filter-wrap">
          <label>REGION:</label>
          <select
            value={regionFilter}
            onChange={e => handleFilterChange(setRegionFilter)(e.target.value)}
            className="hud-select"
          >
            <option value="">ALL 16 REGIONS</option>
            {REGIONS_DATA.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="region-filter-wrap">
          <label>ISSUE:</label>
          <select
            value={issueFilter}
            onChange={e => handleFilterChange(setIssueFilter)(e.target.value)}
            className="hud-select"
          >
            {ISSUE_TYPES.map(t => (
              <option key={t} value={t}>{t === 'ALL' ? 'ALL ISSUES' : t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Platform type tabs */}
      <div className="evidence-platform-tabs">
        {PLATFORM_TYPES.map(pt => (
          <button
            key={pt}
            className={`platform-tab-btn ${platformFilter === pt ? 'active' : ''}`}
            onClick={() => handleFilterChange(setPlatformFilter)(pt)}
          >
            <PlatformIcon type={pt} />
            <span>{pt === 'ALL' ? 'ALL SOURCES' : pt.toUpperCase()}</span>
            <i>{EVIDENCE_DATA.filter(e => pt === 'ALL' || e.platformType === pt).length}</i>
          </button>
        ))}
      </div>

      {/* Main layout: Table + detail panel */}
      <div className={`evidence-main-layout ${selectedEvidence ? 'panel-open' : ''}`}>

        {/* Evidence Table */}
        <div className="evidence-table-container">
          <table className="evidence-hud-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>PLATFORM / MEDIUM</th>
                <th>REGION</th>
                <th>ISSUE &amp; ENTITY</th>
                <th>RECORD EXCERPT</th>
                <th>SENTIMENT</th>
                <th>CONFIDENCE</th>
                <th>TRACE</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                    No evidence records match current filters.
                  </td>
                </tr>
              )}
              {paged.map(ev => {
                const isPos = ev.sentiment > 0;
                const isSelected = selectedEvidence?.id === ev.id;
                return (
                  <tr
                    key={ev.id}
                    className={`evidence-row ${isSelected ? 'selected-row' : ''}`}
                    onClick={() => setSelectedEvidence(isSelected ? null : ev)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="cell-time">{ev.timestamp}</td>
                    <td className="cell-platform">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlatformIcon type={ev.platformType} />
                        <div>
                          <b>{ev.platform}</b>
                          <small>{ev.platformType}</small>
                        </div>
                      </div>
                    </td>
                    <td className="cell-region">{ev.region}</td>
                    <td className="cell-issue">
                      <span className="iss-badge">{ev.issue}</span>
                      <small className="ent-name">{ev.entity}</small>
                    </td>
                    <td className="cell-excerpt">
                      <p>"{ev.excerpt?.substring(0, 90)}{ev.excerpt?.length > 90 ? '…' : ''}"</p>
                    </td>
                    <td className="cell-sentiment">
                      <span className={`sent-pill ${isPos ? 'pos' : 'neg'}`}>
                        {ev.sentiment > 0 ? '+' : ''}{ev.sentiment}
                      </span>
                    </td>
                    <td className="cell-confidence">
                      <span className="conf-score">{ev.confidence}%</span>
                    </td>
                    <td className="cell-action">
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="trace-link-btn"
                        title="Inspect original public record"
                        onClick={e => e.stopPropagation()}
                      >
                        <span>OPEN</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="evidence-pagination">
              <button
                className="hud-btn-outline"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← PREV
              </button>
              <span className="pag-info">
                PAGE {page} / {totalPages} · {filtered.length} RECORDS
              </span>
              <button
                className="hud-btn-outline"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                NEXT →
              </button>
            </div>
          )}
        </div>

        {/* Detail Side Panel */}
        {selectedEvidence && (
          <aside className="evidence-detail-panel">
            <div className="detail-panel-header">
              <div>
                <span className="card-kicker">EVIDENCE RECORD</span>
                <h3 className="card-title">{selectedEvidence.id}</h3>
              </div>
              <button
                className="detail-close-btn"
                onClick={() => setSelectedEvidence(null)}
                title="Close detail panel"
              >
                <X size={16} />
              </button>
            </div>

            <div className="detail-meta-grid">
              <div className="detail-field">
                <small>PLATFORM</small>
                <strong>{selectedEvidence.platform}</strong>
              </div>
              <div className="detail-field">
                <small>TYPE</small>
                <span>{selectedEvidence.platformType}</span>
              </div>
              <div className="detail-field">
                <small>TIMESTAMP</small>
                <span>{selectedEvidence.timestamp}</span>
              </div>
              <div className="detail-field">
                <small>REGION</small>
                <span>{selectedEvidence.region}</span>
              </div>
              <div className="detail-field">
                <small>ISSUE</small>
                <span className="iss-badge">{selectedEvidence.issue}</span>
              </div>
              <div className="detail-field">
                <small>ENTITY</small>
                <span>{selectedEvidence.entity}</span>
              </div>
            </div>

            <div className="detail-excerpt-box">
              <div className="excerpt-label">VERBATIM EXCERPT</div>
              <blockquote>"{selectedEvidence.excerpt}"</blockquote>
            </div>

            <div className="detail-metrics-row">
              <div className="dm-box">
                <small>SENTIMENT</small>
                <strong className={selectedEvidence.sentiment > 0 ? 'pos' : 'neg'}>
                  {selectedEvidence.sentiment > 0 ? '+' : ''}{selectedEvidence.sentiment}
                </strong>
              </div>
              <div className="dm-box">
                <small>CONFIDENCE</small>
                <strong className="pos">{selectedEvidence.confidence}%</strong>
              </div>
              <div className="dm-box">
                <small>PUBLIC SOURCE</small>
                <strong className="pos">SOURCE RECORD</strong>
              </div>
            </div>

            <div className="detail-diversity-box">
              <div className="excerpt-label">SOURCE DIVERSITY</div>
              <p>{selectedEvidence.sourceDiversityScore}</p>
            </div>

            <a
              href={selectedEvidence.url}
              target="_blank"
              rel="noreferrer"
              className="hud-action-btn primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', textDecoration: 'none' }}
            >
              <ExternalLink size={13} />
              <span>OPEN ORIGINAL SOURCE</span>
            </a>

            <div className="guardrail-footer" style={{ marginTop: '12px' }}>
              Evidence Governance: All records are lawful public-domain sources. No private messages, no surveillance data.
            </div>
          </aside>
        )}
      </div>

      <div className="evidence-footer-guarantee">
        <b>EVIDENTIARY PRINCIPLE:</b> Every AI civic recommendation and sentiment score generated in Ghana Post Intelligence is tied directly to verifiable, public-domain observations with cross-source diversity weighting.
      </div>
    </div>
  );
}
