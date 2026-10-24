import React, { useState } from 'react';
import { Layers, ChevronDown, Check } from 'lucide-react';

export const MAP_LAYERS = [
  { id: 'public_sentiment', label: 'PUBLIC SENTIMENT', category: 'Core Pulse' },
  { id: 'government_sentiment', label: 'GOVERNMENT SENTIMENT', category: 'Core Pulse' },
  { id: 'npp_discussion', label: 'NPP DISCUSSION', category: 'Political' },
  { id: 'ndc_discussion', label: 'NDC DISCUSSION', category: 'Political' },
  { id: 'politician_sentiment', label: 'POLITICIAN SENTIMENT', category: 'Political' },
  { id: 'cost_of_living', label: 'COST OF LIVING', category: 'Civic Issues' },
  { id: 'employment', label: 'EMPLOYMENT', category: 'Civic Issues' },
  { id: 'roads', label: 'ROADS', category: 'Civic Issues' },
  { id: 'healthcare', label: 'HEALTHCARE', category: 'Civic Issues' },
  { id: 'education', label: 'EDUCATION', category: 'Civic Issues' },
  { id: 'electricity', label: 'ELECTRICITY', category: 'Civic Issues' },
  { id: 'water', label: 'WATER', category: 'Civic Issues' },
  { id: 'housing', label: 'HOUSING', category: 'Civic Issues' },
  { id: 'crime', label: 'CRIME', category: 'Civic Issues' },
  { id: 'sanitation', label: 'SANITATION', category: 'Civic Issues' },
  { id: 'corruption', label: 'CORRUPTION', category: 'Civic Issues' },
  { id: 'transport', label: 'TRANSPORT', category: 'Civic Issues' },
  { id: 'emerging_narratives', label: 'EMERGING NARRATIVES', category: 'Signals' },
  { id: 'signal_density', label: 'SIGNAL DENSITY', category: 'Signals' },
  { id: 'coordinated_activity', label: 'COORDINATED ACTIVITY', category: 'Signals' }
];

export default function MapLayerSwitcher({ currentLayer, onSelectLayer }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeLayer = MAP_LAYERS.find(l => l.id === currentLayer) || MAP_LAYERS[0];

  return (
    <div className="layer-switcher-container">
      <button 
        className={`layer-switcher-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Switch Geospatial Intelligence Layer"
      >
        <Layers size={14} className="icon-pulse" />
        <span className="layer-label">LAYER: <b>{activeLayer.label}</b></span>
        <ChevronDown size={14} className={`caret ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="layer-dropdown-menu">
          <div className="dropdown-title">SELECT INTELLIGENCE OVERLAY</div>
          <div className="dropdown-scroll">
            {MAP_LAYERS.map(layer => {
              const isSelected = layer.id === currentLayer;
              return (
                <button
                  key={layer.id}
                  className={`layer-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectLayer(layer.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="cat-bullet"></span>
                  <span className="opt-label">{layer.label}</span>
                  {isSelected && <Check size={13} className="check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
