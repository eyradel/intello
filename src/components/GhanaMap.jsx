import React from 'react';
import { regions } from '../data/mockData';

const outline = "M37 5 L51 7 L59 13 L67 16 L66 24 L73 31 L68 38 L70 47 L76 55 L73 66 L69 72 L66 80 L60 86 L58 95 L49 92 L43 96 L35 91 L28 88 L23 80 L18 73 L20 64 L16 57 L22 49 L21 41 L27 34 L28 24 L33 18 Z";

function nodeClass(v){ return v <= -20 ? 'node danger' : v < -5 ? 'node warn' : v < 10 ? 'node neutral' : 'node good'; }

export default function GhanaMap({selected,onSelect,mode,playing=true}){
  const getValue=r => mode==='npp'?r.npp:mode==='ndc'?r.ndc:r.sentiment;
  return <div className={`map-shell ${playing?'':'paused'}`}>
    <div className="map-coordinates top">LAT 11.173°N</div>
    <div className="map-coordinates bottom">GEO // GH-INT-001</div>
    <svg className="ghana-map" viewBox="0 0 100 105" role="img" aria-label="Stylized map of Ghana with regional sentiment nodes">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id="hex" width="6" height="5.2" patternUnits="userSpaceOnUse"><path d="M1.5 0h3L6 2.6 4.5 5.2h-3L0 2.6Z" fill="none" stroke="rgba(98,255,230,.11)" strokeWidth=".18"/></pattern>
      </defs>
      <path d={outline} className="country-glow"/>
      <path d={outline} className="country-base"/>
      <path d={outline} fill="url(#hex)" opacity=".85"/>
      <g className="grid-lines" opacity=".28">
        {[20,30,40,50,60,70,80].map(x=><line key={'x'+x} x1={x} y1="7" x2={x} y2="96"/>)}
        {[15,25,35,45,55,65,75,85].map(y=><line key={'y'+y} x1="18" y1={y} x2="75" y2={y}/>)}
      </g>
      {regions.map((r,i)=>{
        const active=r.id===selected.id;
        return <g key={r.id} className={`map-node ${active?'active':''}`} onClick={()=>onSelect(r)} tabIndex="0" role="button" aria-label={`${r.name}: ${getValue(r)} sentiment`}>
          {(r.signal==='volatile'||active) && <>
            <circle cx={r.x} cy={r.y} r={active?8:5.5} className="ripple r1"/>
            <circle cx={r.x} cy={r.y} r={active?12:8.5} className="ripple r2"/>
          </>}
          <circle cx={r.x} cy={r.y} r={active?3.5:2.4} className={nodeClass(getValue(r))}/>
          <circle cx={r.x} cy={r.y} r={active?1.4:.8} className="node-core"/>
          {active && <>
            <line x1={r.x+4} y1={r.y-1} x2={Math.min(r.x+17,92)} y2={r.y-7} className="pointer"/>
            <text x={Math.min(r.x+18,80)} y={r.y-8} className="region-label">{r.name.toUpperCase()}</text>
            <text x={Math.min(r.x+18,80)} y={r.y-4.3} className="region-score">SIG {getValue(r)>0?'+':''}{getValue(r)}</text>
          </>}
        </g>
      })}
      <g className="crosshair"><circle cx="50" cy="52" r="28"/><circle cx="50" cy="52" r="18"/><line x1="50" y1="18" x2="50" y2="86"/><line x1="21" y1="52" x2="79" y2="52"/></g>
    </svg>
    <div className="map-legend"><span><i className="lg good"></i>POSITIVE</span><span><i className="lg warn"></i>NEGATIVE</span><span><i className="lg danger"></i>CRITICAL</span></div>
  </div>
}
