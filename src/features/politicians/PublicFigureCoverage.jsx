import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { buildPublicFigureAnalytics, validateSocialImport } from '../../services/intelligence/publicFigureAnalytics.js';

export default function PublicFigureCoverage({ partyView = false, initialQuery = '' }) {
  const [news, setNews] = useState([]);
  const [social, setSocial] = useState([]);
  const [party, setParty] = useState('ALL');
  const [query, setQuery] = useState(initialQuery);
  const [hours, setHours] = useState(168);
  const [platform, setPlatform] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState(null);
  const refresh = useCallback(async signal => {
    setBusy(true);
    try {
      const response = await fetch('/api/v1/live-signals', { signal });
      if (!response.ok) throw new Error(`Collection service returned HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid collection response');
      setNews(data); setError(''); setUpdated(new Date());
    } catch (e) { if (e.name !== 'AbortError') setError(e.message); }
    finally { if (!signal?.aborted) setBusy(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController(); refresh(controller.signal);
    const timer = setInterval(() => refresh(controller.signal), 60000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [refresh]);
  useEffect(() => setQuery(initialQuery), [initialQuery]);
  const analysis = useMemo(() => buildPublicFigureAnalytics([...news, ...social], { hours }), [news, social, hours]);
  const visible = analysis.figures.filter(f => (party === 'ALL' || f.party === party) && f.name.toLowerCase().includes(query.toLowerCase()) && (platform === 'ALL' || platform === 'news' ? platform !== 'news' || f.newsArticles > 0 : f.platforms.includes(platform)));
  const current = analysis.figures.find(f => f.id === selected);
  async function importRecords(event) {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Import is limited to 2 MiB.');
      const records = validateSocialImport(JSON.parse(await file.text()));
      setSocial(records); setNotice(`${records.length} public posts loaded in this browser session. They are not uploaded to the server.`);
    } catch (e) { setNotice(`Import rejected: ${e.message}`); }
    event.target.value = '';
  }
  return <div className="public-coverage-view">
    <div className="module-topbar"><div><span className="telemetry-badge">PUBLIC EVIDENCE / MEDIA VISIBILITY</span><h2 className="module-title">{partyView ? 'Party Media Coverage' : 'Public Figures and Media Coverage'}</h2></div><button className="hud-action-btn" disabled={busy} onClick={() => refresh()}>{busy ? 'Loading' : 'Refresh evidence'}</button></div>
    <p className="coverage-methodology">{analysis.methodology}</p>
    {error && <p role="alert">{error}. Previously loaded evidence remains visible.</p>}
    <div className="coverage-summary"><span><strong>{analysis.recordCount}</strong> records in window</span><span><strong>{analysis.figures.filter(f => f.totalRecords).length}</strong> figures with evidence</span><span><strong>{social.length}</strong> imported posts in session</span><span>{updated ? `News checked ${updated.toLocaleTimeString('en-GB', { timeZone: 'Africa/Accra' })} GMT` : 'News not loaded'}</span></div>
    <section className="coverage-source-status"><h3>Social collection status</h3><div>{analysis.socialCoverage.map(source => <article key={source.platform}><strong>{source.platform}{source.aliases ? ' / Twitter' : ''}</strong><span>{source.status.replaceAll('_', ' ')}</span><small>{source.method}</small></article>)}</div>
      <p>Social posts require an authorized public export or configured feed. Import counts are analyst supplied; account ownership and party affiliation require verification.</p>
      <label className="coverage-file-label">Import public-post JSON <input type="file" accept="application/json,.json" onChange={importRecords}/></label>
      <a href="/social-import.example.json" download>Download empty import template</a>
      {social.length > 0 && <button className="hud-action-btn" onClick={() => { setSocial([]); setNotice('Imported posts cleared from this session.'); }}>Clear imported posts</button>}
      {notice && <p role="status">{notice}</p>}
    </section>
    <div className="coverage-filter-row"><input aria-label="Search public figures" value={query} placeholder="Search reference public figures" onChange={e => setQuery(e.target.value)}/><select aria-label="Party reference" value={party} onChange={e => setParty(e.target.value)}><option value="ALL">All party references</option>{analysis.parties.map(p => <option key={p.party}>{p.party}</option>)}</select><select aria-label="Evidence time window" value={hours} onChange={e => setHours(Number(e.target.value))}><option value={24}>Past 24 hours</option><option value={72}>Past 3 days</option><option value={168}>Past 7 days</option></select><select aria-label="Evidence platform" value={platform} onChange={e => setPlatform(e.target.value)}><option value="ALL">All collected evidence</option><option value="news">News articles</option><option value="facebook">Facebook imports</option><option value="x">X / Twitter imports</option><option value="instagram">Instagram imports</option><option value="youtube">YouTube imports</option></select></div>
    <section className="coverage-party-grid">{analysis.parties.filter(p => party === 'ALL' || party === p.party).map(p => <article key={p.party}><h3>{p.party}</h3><strong>{p.newsVisibilityShare == null ? 'No sample' : `${p.newsVisibilityShare}%`}</strong><p>Share of collected figure/article assignments</p><small>{p.newsAssignments} assignments · {p.trackedFigures} reference figures · {p.socialPosts} social post assignments</small><div className="coverage-share-track"><i style={{ width: `${p.newsVisibilityShare || 0}%` }}/></div><p className="coverage-affiliation-note">Party mapping is a reference, not a verified current affiliation.</p></article>)}</section>
    <div className="coverage-figure-layout"><section className="coverage-figure-list"><h3>Figures ordered by news visibility</h3>{visible.map(figure => <button className={selected === figure.id ? 'selected' : ''} key={figure.id} onClick={() => setSelected(figure.id)}><span><strong>{figure.name}</strong><small>{figure.party} · reference affiliation</small></span><span><b>{figure.newsArticles}</b> articles<br/><small>{figure.socialPosts} social posts · {figure.newsPublishers} publisher labels</small></span></button>)}{!visible.length && <p>No matching reference figures. Add verified identities to the registry to expand coverage.</p>}</section>
    <section className="coverage-figure-evidence">{current ? <><h3>{current.name}</h3><p>{current.party} · affiliation requires verification. No current office or biographical claims are inferred.</p><p>{current.newsArticles} news articles · {current.socialPosts} social posts · {current.mediaCount} linked media files</p><p>Within-party news reference share: {analysis.parties.find(p => p.party === current.party)?.figures.find(f => f.id === current.id)?.withinPartyShare ?? 'No sample'}{current.newsArticles ? '%' : ''}</p>{current.evidence.filter(e => platform === 'ALL' || (platform === 'news' ? e.mediaType !== 'social' : e.socialPlatform === platform)).map((e, index) => <article key={`${e.url}-${index}`}><small>{e.source} · {new Date(e.timestamp).toLocaleString('en-GB', { timeZone: 'Africa/Accra' })} GMT · {e.mediaType === 'social' ? (e.collectionMethod === 'authorized-feed' ? 'Authorized feed post; identity unverified' : 'Imported public post; identity unverified') : 'Collected report; unverified'}</small><h4><a href={e.url} target="_blank" rel="noopener noreferrer">{e.headline}</a></h4><p>{e.text?.slice(0, 600)}</p>{e.media?.map((media, i) => <a className="coverage-media-link" key={i} href={media.url} target="_blank" rel="noopener noreferrer">Open linked {media.type} media</a>)}</article>)}{!current.evidence.length && <p>No collected evidence for this figure in the selected window.</p>}</> : <p>Select a figure to inspect source links, dates and linked media.</p>}</section></div>
  </div>;
}
