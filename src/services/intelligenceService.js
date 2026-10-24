// Intelligence Service Abstraction Layer for Ghana Post Intelligence
// Provides standard repository interfaces that cleanly toggle between Mock and API backends

import {
  REGIONS_DATA,
  ISSUES_DATA,
  POLITICIANS_DATA,
  PARTIES_DATA,
  NARRATIVES_DATA,
  SIGNALS_DATA,
  EVIDENCE_DATA,
  COORDINATION_DATA,
  EVENTS_DATA,
  NATIONAL_STATS,
  trend
} from '../data/mockData.js';

const USE_REAL_API = import.meta.env.VITE_DATA_MODE === 'api' && !!import.meta.env.VITE_API_BASE_URL;
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class IntelligenceRepository {
  async getNationalSummary(timeWindow = '24h') {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/national/summary?window=${timeWindow}`);
      return await res.json();
    }
    return {
      stats: NATIONAL_STATS,
      trend: trend,
      timeWindow
    };
  }

  async getRegions(timeWindow = '24h') {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/regions?window=${timeWindow}`);
      return await res.json();
    }
    return [...REGIONS_DATA];
  }

  async getRegionDetail(regionId, timeWindow = '24h') {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/regions/${regionId}?window=${timeWindow}`);
      return await res.json();
    }
    return REGIONS_DATA.find(r => r.id === regionId) || REGIONS_DATA[0];
  }

  async getIssues(timeWindow = '24h') {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/issues?window=${timeWindow}`);
      return await res.json();
    }
    return [...ISSUES_DATA];
  }

  async getNarratives(timeWindow = '24h') {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/narratives?window=${timeWindow}`);
      return await res.json();
    }
    return [...NARRATIVES_DATA];
  }

  async getPoliticians() {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/entities?type=politician`);
      return await res.json();
    }
    return [...POLITICIANS_DATA];
  }

  async getParties() {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/entities?type=parties`);
      return await res.json();
    }
    return [...PARTIES_DATA];
  }

  async getSignals(params = {}) {
    if (USE_REAL_API) {
      const q = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/signals?${q}`);
      return await res.json();
    }
    const { category = 'ALL', query = '', limit = 50 } = params;
    return SIGNALS_DATA.filter(s => {
      const matchCat = category === 'ALL' || s.category === category;
      const matchQuery = !query || `${s.headline} ${s.text} ${s.region} ${s.entity}`.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    }).slice(0, limit);
  }

  async getEvidence(params = {}) {
    if (USE_REAL_API) {
      const q = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/evidence?${q}`);
      return await res.json();
    }
    const { region = '', issue = '', query = '' } = params;
    return EVIDENCE_DATA.filter(e => {
      const matchReg = !region || e.region === region;
      const matchIss = !issue || e.issue.toLowerCase().includes(issue.toLowerCase());
      const matchQ = !query || `${e.excerpt} ${e.entity} ${e.platform}`.toLowerCase().includes(query.toLowerCase());
      return matchReg && matchIss && matchQ;
    });
  }

  async getCoordinationData() {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/coordination`);
      return await res.json();
    }
    return { ...COORDINATION_DATA };
  }

  async getEventsTimeline() {
    if (USE_REAL_API) {
      const res = await fetch(`${API_BASE}/events`);
      return await res.json();
    }
    return [...EVENTS_DATA];
  }
}

export const intelligenceService = new IntelligenceRepository();
