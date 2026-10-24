import React, { useState } from 'react';
const KEY='gpi-analyst-review-v1';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {};}}
export default function RegionalReview({region,windowHours}){
  const [records,setRecords]=useState(read);
  const [message,setMessage]=useState('');
  const record=records[region.id] || {status:'UNREVIEWED',note:''};
  function update(patch){
    const next={...records,[region.id]:{...record,...patch,updatedAt:new Date().toISOString()}};
    setRecords(next);
    try{localStorage.setItem(KEY,JSON.stringify(next));setMessage('Saved in this browser.');}
    catch{setMessage('Storage unavailable; changes are only in memory.');}
  }
  function exportEvidence(){
    const data={schemaVersion:1,exportedAt:new Date().toISOString(),windowHours,region,review:record,
      limitations:['Public-source reports are unverified.','Region markers are reference points, not incident coordinates.','Review notes are editable local records, not a protected audit trail.','Export may contain analyst notes.']};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`ghana-${region.id}-evidence-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    setMessage('Evidence package exported.');
  }
  return <section className="regional-review"><h4>Analyst review</h4>
    <label>Review disposition<select value={record.status} onChange={e=>update({status:e.target.value})}><option value="UNREVIEWED">Unreviewed</option><option value="IN_REVIEW">In review</option><option value="FOLLOW_UP">Follow-up required</option><option value="REVIEWED">Reviewed</option></select></label>
    <label>Assessment notes<textarea maxLength={2000} value={record.note} onChange={e=>update({note:e.target.value})} placeholder="Record source limitations and follow-up actions."/></label>
    <small>Notes remain in this browser and are included in exports. This is not a protected audit log.</small>
    <button onClick={exportEvidence}>Export evidence package</button><p role="status">{message}</p>
  </section>;
}
