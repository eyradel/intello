import { loadRegionalCoverage } from '../../services/coverageClient.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
maplibregl.setWorkerUrl(workerUrl);
import { Maximize2, Minimize2, RotateCcw, Radio, ExternalLink, RefreshCw, X } from 'lucide-react';
import { REGIONS_DATA, normalizeRegionName } from '../../data/regions.js';
import RegionalReview from './RegionalReview.jsx';
import SentimentRippleControls from './SentimentRippleControls.jsx';

const CENTER = [-1.0232, 7.9465];
const TILES = {
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  street: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
};

export default function GhanaIntelligenceMap({ selectedRegion, onSelectRegion, isFullScreen, onToggleFullScreen }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef([]);
  const [ready, setReady] = useState(false);
  const [coverage, setCoverage] = useState(null);
  const [error, setError] = useState('');
  const [mapError, setMapError] = useState('');
  const [loading, setLoading] = useState(false);
  const [base, setBase] = useState('dark');
  const [activeId, setActiveId] = useState(null);
  const [isPlaying, setPlaying] = useState(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [speed, setSpeed] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [windowHours, setWindowHours] = useState(24);
  const [showRipples, setShowRipples] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const refreshController = useRef(null);
  const requestVersion = useRef(0);
  const selection = useRef(onSelectRegion);
  selection.current = onSelectRegion;

  const refresh = useCallback(async () => {
    refreshController.current?.abort();
    const controller = new AbortController();
    refreshController.current = controller;
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const data = await loadRegionalCoverage(windowHours, {signal:controller.signal});
      if (version !== requestVersion.current) return;
      setCoverage(data); setUpdatedAt(new Date());
    } catch (e) {
      if (!controller.signal.aborted && version === requestVersion.current) {
        setError(`Coverage service is temporarily unavailable after three attempts. ${e.message}. Use refresh to retry.`);
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [windowHours]);
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60000);
    const retryWhenOnline = () => refresh();
    window.addEventListener('online', retryWhenOnline);
    return () => { refreshController.current?.abort(); clearInterval(timer); window.removeEventListener('online', retryWhenOnline); };
  }, [refresh]);

  const regions = coverage?.regions || [];
  const steps = useMemo(() => {
    const unique = new Map();
    for (const region of coverage?.regions || []) for (const e of region.evidence) {
      const key = `${e.id}:${region.id}`;
      unique.set(key, { ...e, regionId: region.id, regionName: region.name, time: new Date(e.timestamp).toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',timeZone:'Africa/Accra'}), label: e.headline });
    }
    return [...unique.values()].sort((a,b) => Date.parse(a.timestamp)-Date.parse(b.timestamp));
  }, [coverage]);
  const current = steps[Math.min(stepIndex, Math.max(0, steps.length-1))];
  const active = regions.find(r => r.id === activeId);
  useEffect(() => { setStepIndex(0); }, [windowHours]);
  useEffect(() => {
    if (!isPlaying || steps.length < 2) return;
    const timer = setInterval(() => setStepIndex(i => (i+1) % steps.length), 3500/speed);
    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  useEffect(() => {
    setReady(false);
    const map = new maplibregl.Map({ container:container.current, center:CENTER, zoom:5.4, minZoom:4, maxZoom:13, attributionControl:false,
      style: {version:8,sources:{base:{type:'raster',tiles:[TILES.dark],tileSize:256,attribution:'© Esri · © OpenStreetMap contributors'}},layers:[{id:'base',type:'raster',source:'base'}]} });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({compact:true}), 'top-right');
    map.on('error', e => { if (e.error) setMapError('Some map tiles or boundaries could not load. Evidence is still available.'); });
    map.on('style.load', () => {
      map.addSource('regions',{type:'geojson',data:'/geodata/ghana-regions.geojson'});
      map.addLayer({id:'region-fill',type:'fill',source:'regions',paint:{'fill-color':'#162b3d','fill-opacity':0.65}});
      map.addLayer({id:'region-line',type:'line',source:'regions',paint:{'line-color':'#4b8797','line-width':1,'line-opacity':0.7}});
      map.addLayer({id:'region-selected',type:'line',source:'regions',filter:['==',['get','shapeName'],''],paint:{'line-color':'#a5f3fc','line-width':3}});
      map.on('click','region-fill',e => {
        const id = normalizeRegionName(e.features[0].properties.shapeName);
        setActiveId(id);
        const region = REGIONS_DATA.find(r=>r.id===id);
        if (region) selection.current?.(region);
      });
      map.on('mouseenter','region-fill',()=>{map.getCanvas().style.cursor='pointer';});
      map.on('mouseleave','region-fill',()=>{map.getCanvas().style.cursor='';});
      map.fitBounds([[-3.35,4.7],[1.25,11.2]],{padding:{top:110,bottom:225,left:55,right:55},duration:0});
      setReady(true);
    });
    const resize = new ResizeObserver(()=>map.resize());
    resize.observe(container.current);
    return ()=> {resize.disconnect(); markers.current.forEach(m=>m.remove()); map.remove(); mapRef.current=null;};
  }, [isFullScreen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.getSource('base').setTiles([TILES[base]]);
  }, [base,ready]);
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const colors = ['match',['get','shapeName']];
    for (const region of REGIONS_DATA) {
      const count = regions.find(r=>r.id===region.id)?.articleCount || 0;
      colors.push(region.shapeName,count >= 5 ? '#127e91' : count ? '#244f65' : '#142334');
    }
    colors.push('#142334');
    map.setPaintProperty('region-fill','fill-color',colors);
    markers.current.forEach(m=>m.remove());
    markers.current = REGIONS_DATA.map(region => {
      const data = regions.find(r=>r.id===region.id);
      const count = data?.articleCount || 0;
      const button = document.createElement('button');
      button.className = `information-beacon ${count ? 'has-evidence' : 'no-evidence'} ${showRipples && isPlaying ? 'animating' : ''} ${current?.regionId === region.id ? 'is-current' : ''}`;
      button.style.setProperty('--beacon-delay', `${REGIONS_DATA.indexOf(region)*-0.21}s`);
      button.style.setProperty('--beacon-size', `${Math.min(44,24+count*2)}px`);
      button.setAttribute('aria-label',`${region.name}: ${count} collected articles. Open evidence.`);
      button.title = `${region.name} · ${count} articles`;
      const rings = document.createElement('span'); rings.className='beacon-rings'; rings.innerHTML='<i></i><i></i><i></i>';
      const dot = document.createElement('span'); dot.className='beacon-core'; dot.textContent=String(count);
      const label = document.createElement('span'); label.className='beacon-label'; label.textContent=region.name;
      button.append(rings,dot,label);
      button.addEventListener('click',e=>{e.stopPropagation();setActiveId(region.id);selection.current?.(region);});
      return new maplibregl.Marker({element:button}).setLngLat(region.center).addTo(map);
    });
  }, [ready,coverage,showRipples,isPlaying,current?.regionId]);
  useEffect(() => {
    const map=mapRef.current;
    const region=REGIONS_DATA.find(r=>r.id===(activeId || selectedRegion?.id));
    if (ready && region) map.setFilter('region-selected',['==',['get','shapeName'],region.shapeName]);
  },[activeId,selectedRegion,ready]);

  const focusCurrent = () => {
    if (!current) return;
    setActiveId(current.regionId);
    const r=REGIONS_DATA.find(r=>r.id===current.regionId);
    if(r) mapRef.current?.easeTo({center:r.center,zoom:7,duration:800});
  };
  const content = <div className={`map-shell information-map ${isFullScreen ? 'fullscreen-mode' : ''}`}>
    <div ref={container} className="maplibre-container" />
    <header className="information-map-header">
      <div><span className="information-eyebrow"><Radio size={13}/> GHANA / OPEN-SOURCE MONITORING</span><strong>National Information Picture</strong><small>{coverage ? `${regions.filter(r=>r.articleCount>0).length} of 16 regions with collected coverage` : 'Loading regional evidence…'}</small></div>
      <div className="information-map-tools">
        <select aria-label="Coverage time window" value={windowHours} onChange={e=>setWindowHours(Number(e.target.value))}><option value={24}>Past 24 hours</option><option value={72}>Past 3 days</option><option value={168}>Past 7 days</option></select>
        <button onClick={()=>refresh()} disabled={loading} title="Refresh collected coverage"><RefreshCw size={15}/></button>
        <button onClick={()=>mapRef.current?.fitBounds([[-3.35,4.7],[1.25,11.2]],{padding:{top:110,bottom:225,left:55,right:55},duration:800})} title="Show all Ghana"><RotateCcw size={15}/></button>
        {onToggleFullScreen && <button onClick={onToggleFullScreen} title="Toggle full screen">{isFullScreen?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button>}
      </div>
    </header>
    <div className="information-map-options">
      {Object.keys(TILES).map(mode=><button key={mode} className={base===mode?'active':''} onClick={()=>setBase(mode)}>{mode}</button>)}
      <label><input type="checkbox" checked={showRipples} onChange={e=>setShowRipples(e.target.checked)}/> Ripples</label>
    </div>
    {(error || mapError) && <p className="information-map-error" role="status">{error || mapError}</p>}
    {active && <aside className="map-evidence-panel">
      <button className="map-evidence-close" onClick={()=>setActiveId(null)} aria-label="Close regional evidence"><X size={15}/></button>
      <span className="information-eyebrow">REGIONAL EVIDENCE</span><h3>{active.name}</h3>
      <div className="map-evidence-metrics"><strong>{active.articleCount}<small>articles</small></strong><strong>{active.sourceCount}<small>feeds</small></strong><span>{active.coverage.replaceAll('_',' ')}</span></div>
      <p className="map-evidence-note">Region reference point, not an incident coordinate.</p>
      {active.topIssues.slice(0,2).map(i=><span className="map-issue-chip" key={i.issue}>{i.issue} · {i.count}</span>)}
      {active.evidence.length ? active.evidence.map(e=><a key={e.id} className="map-evidence-story" href={e.url} target="_blank" rel="noopener noreferrer"><small>{e.source} · {new Date(e.timestamp).toLocaleString('en-GB',{timeZone:'Africa/Accra',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} GMT</small><span>{e.headline}<ExternalLink size={12}/></span></a>) : <p>No recent collected evidence. Events may still have occurred here.</p>}
      <RegionalReview key={active.id} region={active} windowHours={windowHours}/>
    </aside>}
    {!active && <div className="map-pulse-key"><span><i/>Collected reports</span><span><i className="empty"/>No collected coverage</span><small>Select a region to explore evidence.</small></div>}
    <div className="information-playback">
      {current && <button className="information-current-story" onClick={focusCurrent}><span>REPORT REPLAY · {current.regionName}</span><strong>{current.headline}</strong></button>}
      <SentimentRippleControls activeNarrative={{title:steps.length ? `${steps.length} mapped report entries · chronological replay` : 'No dated regional reports in this window'}} isPlaying={isPlaying} onTogglePlay={()=>setPlaying(p=>!p)} onRestart={()=>setStepIndex(0)} speed={speed} onChangeSpeed={setSpeed} currentStepIndex={Math.min(stepIndex,Math.max(0,steps.length-1))} onStepChange={setStepIndex} steps={steps}/>
      <p className="information-map-footnote">Ripples show collected coverage, not information spread. Region counts can overlap. {coverage?.unassignedCount || 0} unassigned articles. {updatedAt ? `Updated ${updatedAt.toLocaleTimeString('en-GB',{timeZone:'Africa/Accra'})} GMT` : ''}</p>
    </div>
  </div>;
  return isFullScreen ? createPortal(content, document.body) : content;
}
