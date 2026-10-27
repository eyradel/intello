import React, { useEffect, useState } from 'react';
const initial = { q: '', source: '', region: '', figure: '', issue: '', mediaType: '', after: '', before: '', sort: 'relevance' };
export default function EvidenceSearch() {
  const [filters, setFilters] = useState(initial), [submitted, setSubmitted] = useState(initial);
  const [report, setReport] = useState(null), [selected, setSelected] = useState(null);
  const [offset, setOffset] = useState(0), [refresh, setRefresh] = useState(0);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams(Object.entries(submitted).filter(([, value]) => value));
    query.set('offset', offset); query.set('limit', '20'); setBusy(true); setError('');
    fetch(`/api/v1/evidence/search?${query}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) })
      .then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`); if (!Array.isArray(data.results)) throw new Error('Invalid search response'); return data; })
      .then(data => { if (!controller.signal.aborted) { setReport(data); setSelected(data.results[0] || null); } })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [submitted, offset, refresh]);
  const change = (key, value) => setFilters(f => ({ ...f, [key]: value }));
  const search = e => { e?.preventDefault(); setOffset(0); setSubmitted({ ...filters }); };
  const pivot = patch => { const next = { ...filters, ...patch }; setFilters(next); setSubmitted(next); setOffset(0); };
  const exportPage = () => {
    const blob = new Blob([JSON.stringify({ ...report, search: submitted, exportedAt: new Date().toISOString(), exportScope: 'current-result-page; aggregates-cover-all-matches' }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'public-evidence-search.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const facets = report?.facets;
  return <div className="evidence-search-view">
    <div className="module-topbar"><div><span className="telemetry-badge">PUBLIC-SOURCE SEARCH AND CORRELATION</span><h2 className="module-title">Evidence Search Workspace</h2></div><button className="hud-action-btn" disabled={!report || busy || !!error} onClick={exportPage}>Export result page</button></div>
    <p className="evidence-scope">Search collected public reports. No private communications or intercepted traffic are indexed. Relevance scores are not credibility assessments.</p>
    <form className="evidence-search-form" onSubmit={search}>
      <label>Keywords, quoted phrases and exclusions<input aria-label="Evidence query" maxLength={512} value={filters.q} onChange={e => change('q', e.target.value)} placeholder={'Example: "water supply" -football'}/></label>
      <div className="evidence-filter-grid">{[['source', 'Source', facets?.sources], ['region', 'Region mention', facets?.regions], ['issue', 'Issue', facets?.issues], ['mediaType', 'Record type', facets?.mediaTypes]].map(([key, label, options]) => <label key={key}>{label}<select value={filters[key]} onChange={e => change(key, e.target.value)}><option value="">All</option>{options?.map(v => <option key={v}>{v}</option>)}</select></label>)}
        <label>Reference public figure<select value={filters.figure} onChange={e => change('figure', e.target.value)}><option value="">All</option>{facets?.figures.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
        <label>Published from (GMT)<input type="date" value={filters.after} onChange={e => change('after', e.target.value)}/></label>
        <label>Published through (GMT)<input type="date" value={filters.before} onChange={e => change('before', e.target.value)}/></label>
        <label>Order<select value={filters.sort} onChange={e => change('sort', e.target.value)}><option value="relevance">Relevance</option><option value="recent">Newest first</option></select></label>
      </div><div className="evidence-search-actions"><button className="hud-action-btn primary" disabled={busy} type="submit">{busy ? 'Searching' : 'Search evidence'}</button><button className="hud-action-btn" type="button" disabled={busy} onClick={() => { setFilters(initial); setSubmitted({ ...initial }); setOffset(0); }}>Clear filters</button><button className="hud-action-btn" type="button" disabled={busy} onClick={() => setRefresh(v => v + 1)}>Refresh index</button><small>All positive terms must match. Double quotes match a phrase; minus excludes a term.</small></div>
    </form>
    {error && <p role="alert" className="evidence-error">{error}. Previous results below belong to the last successful query.</p>}
    {report && <><div className="evidence-search-summary"><strong>{report.total}</strong> matching reports / {report.indexedCount} indexed · Collection: {report.collection?.status} · Last collected: {report.collection?.lastCollectedAt || 'Not recorded'}</div>
      <section className="evidence-timeline"><h3>Reports by publication day</h3>{report.timeline.map(day => <button key={day.date} onClick={() => pivot({ after: day.date, before: day.date })}><span>{day.date}</span><i style={{ width: `${100 * day.count / Math.max(...report.timeline.map(d => d.count))}%` }}/><b>{day.count}</b></button>)}{!report.timeline.length && <p>No dated matches.</p>}</section>
      <div className="evidence-workspace-grid"><section className="evidence-results"><h3>Source records</h3>{report.results.map(result => <button className={selected?.id === result.id ? 'selected' : ''} key={result.id} onClick={() => setSelected(result)}><small>{result.source} · {result.timestamp || 'Publication date unknown'}</small><strong>{result.headline}</strong><span>{result.text.slice(0, 180)}</span><small>Relevance {result.score} · {result.region} · {result.mediaType}</small></button>)}{!report.results.length && <p>No matching collected evidence. This does not establish that no events occurred.</p>}<div className="evidence-pagination"><button disabled={busy || offset === 0} onClick={() => setOffset(n => Math.max(0, n - 20))}>Previous</button><span>{report.total ? report.offset + 1 : 0}–{report.offset + report.results.length} / {report.total}</span><button disabled={busy || offset + 20 >= report.total} onClick={() => setOffset(n => n + 20)}>Next</button></div></section>
      <section className="evidence-record-detail">{selected ? <><span className="telemetry-badge">COLLECTED REPORT / UNVERIFIED</span><h3>{selected.headline}</h3><a href={selected.url} target="_blank" rel="noopener noreferrer">Open original source</a><p>{selected.text}</p><div className="evidence-pivots"><button onClick={() => pivot({ source: selected.source })}>{selected.source}</button><button onClick={() => pivot({ issue: selected.issue })}>{selected.issue}</button>{selected.figures.map(f => <button key={f.id} onClick={() => pivot({ figure: f.id })}>{f.name}</button>)}</div><h4>Provenance</h4><p>Record ID: {selected.id}<br/>Ingested: {selected.ingestedAt || 'Not recorded'}</p><code className="evidence-hash">SHA-256: {selected.contentHash}</code><p>The hash identifies indexed text; it does not authenticate the publisher.</p>{selected.media.map((m, i) => <p key={i}><a href={m.url} target="_blank" rel="noopener noreferrer">Open linked {m.type || 'media'}</a></p>)}{Array.isArray(selected.provenance) && selected.provenance.map((p, i) => <p key={i}>{p.publisher || p.feedId} · {p.feedUrl || 'Feed URL not recorded'}</p>)}</> : <p>Select a report to inspect provenance.</p>}</section></div>
      <section className="evidence-correlations"><h3>Public-figure co-mentions</h3><p>Names appear in the same report. This does not establish contact, coordination or a relationship.</p>{report.correlations.map((pair, i) => <article key={i}><span>{pair.figures.map(f => f.name).join(' + ')}</span><strong>{pair.reportCount} shared reports</strong><button onClick={() => pivot({ q: pair.figures.map(f => `"${f.name}"`).join(' ') })}>Search both full names</button></article>)}{!report.correlations.length && <p>No public-figure pairs in the matched evidence.</p>}</section>
      <p className="evidence-search-limitations">{report.limitations} Receipt: {report.receipt.id}. Export includes only the displayed result page.</p></>}
  </div>;
}
