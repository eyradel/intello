import React from 'react';
export default function MiniChart({values}){
  const w=330,h=92,p=6; const min=Math.min(...values)-4,max=Math.max(...values)+4;
  const pts=values.map((v,i)=>`${p+i*(w-p*2)/(values.length-1)},${p+(max-v)*(h-p*2)/(max-min)}`).join(' ');
  const area=`${p},${h-p} ${pts} ${w-p},${h-p}`;
  return <svg className="mini-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
    <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(84,255,225,.30)"/><stop offset="1" stopColor="rgba(84,255,225,0)"/></linearGradient></defs>
    {[.25,.5,.75].map(n=><line key={n} x1="0" y1={h*n} x2={w} y2={h*n} className="chart-grid"/>)}
    <polygon points={area} fill="url(#areaGrad)"/>
    <polyline points={pts} className="chart-line"/>
  </svg>
}
