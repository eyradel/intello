import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  Map as MapIcon,
  Globe,
  Users,
  Flag,
  Flame,
  Activity,
  Radio,
  FileCheck,
  ShieldAlert,
  Printer,
  Server,
  Settings,
  Search,
  Bell,
  Shield,
  Layers,
  ChevronDown,
  TrendingUp,
  Zap,
  Menu,
  Brain,
  X as XIcon
} from 'lucide-react';

import CommandCenter from './features/command/CommandCenter.jsx';
import GhanaIntelligenceMap from './components/map/GhanaIntelligenceMap.jsx';
import RegionsModule from './features/regions/RegionsModule.jsx';
import PoliticiansModule from './features/politicians/PoliticiansModule.jsx';
import PartiesModule from './features/parties/PartiesModule.jsx';
import IssuesModule from './features/issues/IssuesModule.jsx';
import NarrativesModule from './features/narratives/NarrativesModule.jsx';
import SignalsModule from './features/signals/SignalsModule.jsx';
import EvidenceExplorer from './features/evidence/EvidenceExplorer.jsx';
import CoordinationWatch from './features/coordination/CoordinationWatch.jsx';
import ReportsModule from './features/reports/ReportsModule.jsx';
import SystemModule from './features/system/SystemModule.jsx';
import SettingsModule from './features/settings/SettingsModule.jsx';
import TrendingModule from './features/trending/TrendingModule.jsx';
import LocalBrainModule from './features/brain/LocalBrainModule.jsx';

import CommandPalette from './components/common/CommandPalette.jsx';
import NotificationsDrawer from './components/common/NotificationsDrawer.jsx';

import { REGIONS_DATA } from './data/regions.js';
import { NATIONAL_STATS } from './data/mockData.js';


const NAVIGATION_ITEMS = [
  { id: 'Command', label: 'Command', icon: LayoutGrid, count: null },
  { id: 'Brain', label: 'Local Brain', icon: Brain, count: '0-Q' },
  { id: 'Map', label: 'Geospatial Map', icon: MapIcon, count: null },
  { id: 'Regions', label: '16 Regions', icon: Globe, count: '16' },
  { id: 'Politicians', label: 'Public Figures', icon: Users, count: null },
  { id: 'Trending', label: 'Trending Entities', icon: TrendingUp, count: null },
  { id: 'Parties', label: 'Parties', icon: Flag, count: null },
  { id: 'Issues', label: 'Civic Issues', icon: Flame, count: '18' },
  { id: 'Narratives', label: 'Narrative Command', icon: Activity, count: '04' },
  { id: 'Signals', label: 'Live Signals', icon: Radio, count: 'LIVE' },
  { id: 'Evidence', label: 'Evidence Trace', icon: FileCheck, count: null },
  { id: 'Coordination', label: 'Coordination Watch', icon: ShieldAlert, count: '04' },
  { id: 'Reports', label: 'Reports', icon: Printer, count: null },
  { id: 'System', label: 'System Health', icon: Server, count: '7/7' },
  { id: 'Settings', label: 'Settings', icon: Settings, count: null }
];

const TIME_WINDOWS = ['LIVE', '24H', '7D', '30D', '90D', '1Y', 'CUSTOM'];

export default function App() {
  const [activeTab, setActiveTab] = useState('Command');
  const [selectedRegion, setSelectedRegion] = useState(REGIONS_DATA[0]);
  const [activeLayer, setActiveLayer] = useState('public_sentiment');
  const [timeWindow, setTimeWindow] = useState('24H');
  const [useAdjustedSentiment, setUseAdjustedSentiment] = useState(false);

  // Command palette & notification drawer state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [polSearchQuery, setPolSearchQuery] = useState('');
  const [selectedPolId, setSelectedPolId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = (tab, params = {}) => {
    setActiveTab(tab);
    if (params.search !== undefined) {
      setPolSearchQuery(params.search);
    }
    if (params.selectPolId !== undefined) {
      setSelectedPolId(params.selectPolId);
    }
  };

  const [clock, setClock] = useState(new Date());
  const [collection, setCollection] = useState(null);
  const [coverage, setCoverage] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const update = () => {
      fetch('/api/v1/scraper/status', {signal:controller.signal}).then(r=>r.ok?r.json():null).then(setCollection).catch(()=>{});
      fetch('/api/v1/coverage/regions', {signal:controller.signal}).then(r=>r.ok?r.json():null).then(setCoverage).catch(()=>{});
    };
    update();
    const timer = setInterval(update,60000);
    const ticker = setInterval(()=>setClock(new Date()),1000);
    return ()=>{controller.abort();clearInterval(timer);clearInterval(ticker);};
  }, []);
  // Close sidebar when navigating on mobile
  const handleMobileNavigate = (tab, params = {}) => {
    handleNavigate(tab, params);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`app-frame${isSidebarOpen ? ' sidebar-open' : ''}`}>
      <div className="noise"></div>
      <div className="scanline"></div>

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={handleNavigate}
        onSelectRegion={setSelectedRegion}
        onSelectLayer={setActiveLayer}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer 
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* Mobile sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Left HUD Sidebar Navigation */}
      <aside className={`sidebar${isSidebarOpen ? ' sidebar-mobile-open' : ''}`}>
        <div className="brand-mark" onClick={() => setActiveTab('Command')} style={{ cursor: 'pointer' }}>
          <div className="ms-brand-logo">
            <span className="sq sq-blue"></span>
            <span className="sq sq-cyan"></span>
            <span className="sq sq-green"></span>
            <span className="sq sq-amber"></span>
          </div>
          <div>
            <b>Ghana Post</b>
            <small>INTELLIGENCE & OPERATIONS</small>
          </div>
        </div>

        <div className="side-status">
          <span className="live-dot"></span>
          <span>System: Healthy</span> <em>16/16</em>
        </div>

        <nav className="side-nav-scroll">
          {NAVIGATION_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={isActive ? 'active' : ''}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                title={item.label}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.count && <i className="nav-counter">{item.count}</i>}
              </button>
            );
          })}
        </nav>

        <div className="side-divider"></div>

        {/* Sentiment Layer Fast Select */}
        <div className="side-label">GEOSPATIAL LAYER</div>
        <div className="mode-stack">
          {[
            { id: 'public_sentiment', label: 'National Pulse', dot: 'pulse', badge: 'LIVE' },
            { id: 'government_sentiment', label: 'Government', dot: 'npp', badge: 'SIM' },
            { id: 'cost_of_living', label: 'Cost of Living', dot: 'crit', badge: 'HOT' },
            { id: 'emerging_narratives', label: 'Narrative Spread', dot: 'narr', badge: 'NEW' }
          ].map(m => (
            <button
              key={m.id}
              className={activeLayer === m.id ? 'selected' : ''}
              onClick={() => {
                setActiveLayer(m.id);
                if (activeTab !== 'Command' && activeTab !== 'Map') {
                  setActiveTab('Command');
                }
              }}
            >
              <span className={`mode-dot ${m.dot}`}></span>
              <span>{m.label}</span>
              <em>{m.badge}</em>
            </button>
          ))}
        </div>

        <div className="side-footer">
          <div className="operator">
            <span className="operator-avatar">AO</span>
            <div>
              <b>Analytics Ops</b>
              <small>Operations Directorate</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Command Center Application View */}
      <main>
        {/* Top Operational Telemetry Bar */}
        <header className="topbar">
          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <XIcon size={20} /> : <Menu size={20} />}
          </button>

          <div className="topbar-title-group">
            <div className="eyebrow">GHANA POST INTELLIGENCE &gt; OPERATIONS &gt; {activeTab.toUpperCase()}</div>
            <h1 className="topbar-title">
              {activeTab === 'Command' && 'Executive Operations Dashboard'}
              {activeTab === 'Brain' && 'Local Intelligence & Causal Thinking Brain'}
              {activeTab === 'Map' && 'Geospatial Intelligence Map'}
              {activeTab === 'Regions' && '16 Administrative Regions Directory'}
              {activeTab === 'Politicians' && 'Public Figures & Discourse Analytics'}
              {activeTab === 'Trending' && 'Trending Entities — Live Rising Figures'}
              {activeTab === 'Parties' && 'Political Parties & Organization Monitor'}
              {activeTab === 'Issues' && '18 Tracked Civic Issues & Citizen Feedback'}
              {activeTab === 'Narratives' && 'Narrative Analysis & Propagation Velocity'}
              {activeTab === 'Signals' && 'Live Public-Source Signal Feed'}
              {activeTab === 'Evidence' && 'Ground Evidence & Citation Records'}
              {activeTab === 'Coordination' && 'Coordination & Anomaly Detection'}
              {activeTab === 'Reports' && 'Executive Briefings & Export Reports'}
              {activeTab === 'System' && 'Platform Health & Architecture'}
              {activeTab === 'Settings' && 'Configuration & Data Governance'}
            </h1>
          </div>

          <div className="top-actions">
            {/* Global Search Button / Trigger */}
            <div className="search" onClick={() => setIsPaletteOpen(true)} style={{ cursor: 'pointer' }}>
              <Search size={14} />
              <input 
                placeholder="Search signals, regions, entities... (Ctrl+K)" 
                readOnly 
              />
              <kbd>⌘ K</kbd>
            </div>

            {/* Global Time Filter */}
            <div className="time-filter-wrap">
              {TIME_WINDOWS.slice(0, 5).map(tw => (
                <button
                  key={tw}
                  className={`tw-btn ${timeWindow === tw ? 'active' : ''}`}
                  onClick={() => setTimeWindow(tw)}
                >
                  {tw}
                </button>
              ))}
            </div>

            {/* Live GMT Clock */}
            <div className="clock">
              <b>{clock.toLocaleTimeString('en-GB',{timeZone:'Africa/Accra'})}</b>
              <small>{clock.toLocaleDateString('en-GB',{timeZone:'Africa/Accra',day:'2-digit',month:'short',year:'numeric'}).toUpperCase()} · GMT</small>
            </div>

            {/* Local Brain 0-Quota Badge */}
            <div 
              className="data-mode-badge" 
              onClick={() => setActiveTab('Brain')} 
              style={{ cursor: 'pointer', background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '5px' }} 
              title="Click to view Local Thinking Engine (0 Quota Used)"
            >
              <Brain size={12} />
              <span>LOCAL ANALYSIS</span>
            </div>

            {/* Data Mode Pill */}
            <div className="data-mode-badge" title="Data powered by live Ghanaian open-source intelligence feed">
              <span className="dot"></span>
              <span>COLLECTED PUBLIC SOURCES</span>
            </div>

            {/* Notifications Trigger */}
            <button 
              className="notif-trigger-btn"
              onClick={() => setIsNotifOpen(true)}
              title="View Intelligence Notifications"
            >
              <Bell size={16} />
              <span className="notif-ping"></span>
            </button>
          </div>
        </header>

        {/* Top National Telemetry Metrics Strip */}
        <section className="metric-strip">
          <div className="strip-item"><span>COLLECTION STATUS</span><strong>{collection?.status || 'UNAVAILABLE'}</strong><small>Measured collection state</small></div>
          <div className="strip-item"><span>RETAINED ARTICLES</span><strong>{collection?.signalsCount ?? '—'}</strong><small>Seven-day bounded retention</small></div>
          <div className="strip-item"><span>REGIONAL COVERAGE / 24H</span><strong>{coverage ? coverage.regions.filter(r=>r.articleCount>0).length : '—'} / 16</strong><small>Regions with matched reports</small></div>
          <div className="strip-item"><span>RESPONDING FEEDS</span><strong>{collection?.stats?.activeFeedsCount ?? '—'} / {collection?.stats?.configuredFeedsCount ?? '—'}</strong><small>Feed queries, not independent publishers</small></div>
          <div className="strip-item"><span>ANALYTICAL ASSURANCE</span><strong>UNVALIDATED</strong><small>Human source review required</small></div>
        </section>
        <div className="operational-data-notice">DEVELOPMENT SYSTEM · The map and collected feed use public-source records. Other analytical modules contain demonstration data. No operational accreditation or classified-data handling is established.</div>

        {/* Dynamic Route Content */}
        <div className="module-content-area">
          {activeTab === 'Command' && (
            <CommandCenter 
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onNavigate={setActiveTab}
              activeLayer={activeLayer}
              onChangeLayer={setActiveLayer}
              useAdjustedSentiment={useAdjustedSentiment}
              onToggleAdjustedSentiment={() => setUseAdjustedSentiment(!useAdjustedSentiment)}
            />
          )}

          {activeTab === 'Map' && (
            <div className="fullscreen-map-page">
              <GhanaIntelligenceMap 
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                activeLayer={activeLayer}
                onChangeLayer={setActiveLayer}
                isFullScreen={true}
              />
            </div>
          )}

          {activeTab === 'Regions' && (
            <RegionsModule 
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Politicians' && (
            <PoliticiansModule 
              onNavigate={handleNavigate}
              initialQuery={polSearchQuery}
              selectedPolId={selectedPolId}
              onClearInitialState={() => {
                setPolSearchQuery('');
                setSelectedPolId(null);
              }}
            />
          )}

          {activeTab === 'Trending' && (
            <TrendingModule onNavigate={setActiveTab} />
          )}

          {activeTab === 'Brain' && (
            <LocalBrainModule onNavigate={handleNavigate} />
          )}

          {activeTab === 'Parties' && (
            <PartiesModule />
          )}

          {activeTab === 'Issues' && (
            <IssuesModule 
              onSelectLayer={setActiveLayer}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Narratives' && (
            <NarrativesModule 
              onNavigate={setActiveTab}
              onSelectLayer={setActiveLayer}
            />
          )}

          {activeTab === 'Signals' && (
            <SignalsModule />
          )}

          {activeTab === 'Evidence' && (
            <EvidenceExplorer />
          )}

          {activeTab === 'Coordination' && (
            <CoordinationWatch 
              useAdjustedSentiment={useAdjustedSentiment}
              onToggleAdjustedSentiment={() => setUseAdjustedSentiment(!useAdjustedSentiment)}
            />
          )}

          {activeTab === 'Reports' && (
            <ReportsModule />
          )}

          {activeTab === 'System' && (
            <SystemModule />
          )}

          {activeTab === 'Settings' && (
            <SettingsModule />
          )}
        </div>

        {/* Enterprise Platform Footer */}
        <footer className="system-footer flex items-center justify-between px-5 py-2.5 text-xs text-slate-400 bg-[#0e1626] border-t border-[#25354e]">
          <span>Ghana Post Intelligence · Operations Directorate v2.4</span>
          <span>Public source collection · Administrative reference boundaries</span>
          <span>Compliance: Lawful Public Information Only</span>
        </footer>
      </main>
    </div>
  );
}
