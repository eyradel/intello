import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, MapPin, AlertTriangle, Layers, Users, FileText, ArrowRight, X } from 'lucide-react';
import { REGIONS_DATA } from '../../data/regions.js';
import { ISSUES_DATA } from '../../data/issues.js';
import { POLITICIANS_DATA, searchPoliticians } from '../../data/politicians.js';
import { NARRATIVES_DATA } from '../../data/narratives.js';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onSelectRegion,
  onSelectLayer
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggle open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build command suggestions
  const quickActions = [
    { label: 'SCAN GREATER ACCRA', type: 'region', action: () => { onSelectRegion(REGIONS_DATA[0]); onNavigate('Regions'); } },
    { label: 'SCAN ASHANTI REGION', type: 'region', action: () => { onSelectRegion(REGIONS_DATA[1]); onNavigate('Regions'); } },
    { label: 'SHOW COST OF LIVING HEATMAP', type: 'layer', action: () => { onSelectLayer('cost_of_living'); onNavigate('Command'); } },
    { label: 'SHOW TRANSPORT GRIEVANCE LAYER', type: 'layer', action: () => { onSelectLayer('transport'); onNavigate('Command'); } },
    { label: 'SHOW NPP DISCUSSION SHARE', type: 'layer', action: () => { onSelectLayer('npp_discussion'); onNavigate('Command'); } },
    { label: 'SHOW NDC DISCUSSION SHARE', type: 'layer', action: () => { onSelectLayer('ndc_discussion'); onNavigate('Command'); } },
    { label: 'OPEN NARRATIVE PROPAGATION', type: 'page', action: () => onNavigate('Narratives') },
    { label: 'OPEN COORDINATION WATCH (BOT SCAN)', type: 'page', action: () => onNavigate('Coordination') },
    { label: 'OPEN EVIDENCE REPOSITORY', type: 'page', action: () => onNavigate('Evidence') },
    { label: 'GENERATE NATIONAL DAILY BRIEF', type: 'page', action: () => onNavigate('Reports') }
  ];

  const searchResults = [];
  if (query.trim().length > 0) {
    const q = query.toLowerCase();

    // Match regions
    REGIONS_DATA.forEach(r => {
      if (r.name.toLowerCase().includes(q) || r.dominantIssue?.toLowerCase().includes(q)) {
        searchResults.push({
          label: `REGION: ${r.name}`,
          detail: `Sentiment: ${r.sentiment > 0 ? '+' : ''}${r.sentiment} · Top: ${r.top}`,
          icon: MapPin,
          action: () => { onSelectRegion(r); onNavigate('Regions'); }
        });
      }
    });

    // Match issues
    ISSUES_DATA.forEach(iss => {
      if (iss.label.toLowerCase().includes(q) || iss.category.toLowerCase().includes(q)) {
        searchResults.push({
          label: `ISSUE: ${iss.label}`,
          detail: `Intensity: ${iss.nationalIntensity}% · Sentiment: ${iss.sentiment}`,
          icon: AlertTriangle,
          action: () => { onSelectLayer(iss.key); onNavigate('Issues'); }
        });
      }
    });

    // Match politicians & multi-entity queries
    const matchedPols = searchPoliticians(q);
    const isMultiEntity = q.match(/\s+(?:and|or|vs|\&|\+)\s+|,\s*/i) && matchedPols.length >= 2;

    if (isMultiEntity) {
      searchResults.push({
        label: `COMPARE FIGURES: ${matchedPols[0].name.split(' (')[0]} & ${matchedPols[1].name.split(' (')[0]}`,
        detail: `Head-to-head discourse comparison · ${matchedPols[0].party} vs ${matchedPols[1].party}`,
        icon: Users,
        action: () => onNavigate('Politicians', { search: q })
      });
    }

    matchedPols.forEach(p => {
      searchResults.push({
        label: `PUBLIC FIGURE: ${p.name}`,
        detail: `${p.role} · ${p.party} · Mentions: ${p.mentions} · Sentiment: ${p.nationalSentiment > 0 ? '+' : ''}${p.nationalSentiment}`,
        icon: Users,
        action: () => onNavigate('Politicians', { selectPolId: p.id, search: p.name })
      });
    });

    // Match narratives
    NARRATIVES_DATA.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)) {
        searchResults.push({
          label: `NARRATIVE: ${n.title.slice(0, 48)}...`,
          detail: `Reach: ${n.currentReach} · Growth: ${n.growthRate}`,
          icon: Layers,
          action: () => onNavigate('Narratives')
        });
      }
    });
  }

  const itemsToDisplay = query.trim().length > 0 ? searchResults : quickActions;

  if (!isOpen) return null;

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        <div className="palette-input-wrap">
          <Search size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search regions, entities, issues, evidence..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % Math.max(1, itemsToDisplay.length));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + itemsToDisplay.length) % Math.max(1, itemsToDisplay.length));
              } else if (e.key === 'Enter' && itemsToDisplay[selectedIndex]) {
                itemsToDisplay[selectedIndex].action();
                onClose();
              }
            }}
          />
          <kbd className="palette-esc-badge" onClick={onClose}>ESC</kbd>
        </div>

        <div className="palette-results-list">
          <div className="palette-section-title">
            {query.trim().length > 0 ? `FOUND ${itemsToDisplay.length} RESULTS` : 'TACTICAL COMMANDS & SHORTCUTS'}
          </div>

          {itemsToDisplay.length === 0 ? (
            <div className="palette-empty">NO MATCHING INTELLIGENCE SIGNALS LOCATED</div>
          ) : (
            itemsToDisplay.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  className={`palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="item-left">
                    <span className="item-icon-wrap">
                      {item.icon ? <item.icon size={14} /> : <Command size={14} />}
                    </span>
                    <div>
                      <div className="item-primary">{item.label}</div>
                      {item.detail && <div className="item-secondary">{item.detail}</div>}
                    </div>
                  </div>
                  <ArrowRight size={14} className="item-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="palette-footer">
          <span>NAVIGATION: <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>SELECT: <kbd>ENTER</kbd></span>
          <span>CLOSE: <kbd>ESC</kbd></span>
        </div>
      </div>
    </div>
  );
}
