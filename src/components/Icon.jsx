import React from 'react';

export default function Icon({name,size=18}) {
  const common={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.7',strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true};
  const paths={
    grid:<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    map:<><path d="M3 6.5 8 4l8 3 5-2v12.5L16 20l-8-3-5 2z"/><path d="M8 4v13M16 7v13"/></>,
    pulse:<><path d="M3 12h4l2-6 4 12 2-6h6"/></>,
    users:<><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2"/><path d="M15.5 14.5a4.5 4.5 0 0 1 5 4.5"/></>,
    eye:<><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    brain:<><path d="M9.5 5A3.5 3.5 0 0 0 6 8.5v.3A3.7 3.7 0 0 0 4 12a3.5 3.5 0 0 0 3 3.5V17a3 3 0 0 0 5 2.2V4.8A3 3 0 0 0 9.5 5Z"/><path d="M14.5 5A3.5 3.5 0 0 1 18 8.5v.3a3.7 3.7 0 0 1 2 3.2 3.5 3.5 0 0 1-3 3.5V17a3 3 0 0 1-5 2.2V4.8A3 3 0 0 1 14.5 5Z"/></>,
    target:<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88L4.2 6.66l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.38.27.76.55 1 .95.2.35.3.75.3 1.15v.1h.3v1.6h-.1a1.7 1.7 0 0 0-1.5 1.2Z"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bolt:<path d="m13 2-8 12h6l-1 8 8-12h-6z"/>,
    shield:<><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6z"/><path d="m9.5 12 1.7 1.7 3.5-3.8"/></>
  };
  return <svg {...common}>{paths[name]||paths.grid}</svg>;
}
