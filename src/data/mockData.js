// Compatibility aggregator for backwards compatibility and service layers

export { REGIONS_DATA as regions, getRegionById, getRegionByShapeName, normalizeRegionName } from './regions.js';
export { ISSUES_DATA as issues, getIssueByKey } from './issues.js';
export { POLITICIANS_DATA as politicians, getPoliticianById } from './politicians.js';
export { PARTIES_DATA as parties, getPartyById } from './parties.js';
export { NARRATIVES_DATA as narratives, getNarrativeById } from './narratives.js';
export { SIGNALS_DATA as signals, getFilteredSignals } from './signals.js';
export { EVIDENCE_DATA as evidence, getFilteredEvidence } from './evidence.js';
export { COORDINATION_DATA as coordination } from './coordination.js';
export { EVENTS_DATA as events } from './events.js';

export const trend = [-18, -16, -19, -17, -21, -20, -23, -19, -22, -24, -27, -25, -29, -31];

export const NATIONAL_STATS = {
  nationalSentiment: -24.6,
  sentiment24h: -4.2,
  sentiment7d: -7.8,
  sentiment30d: -13.4,
  adjustedSentiment: -18.6,
  publicSignals: '284,710',
  activeNarratives: 147,
  emergingNarratives: 23,
  anomalyIndex: 7.4,
  anomalyStatus: 'ELEVATED',
  modelConfidence: 91.8,
  confidenceLabel: 'HIGH',
  regionsImproving: 4,
  regionsDeclining: 12,
  criticalIssuesCount: 5,
  coordinationAlertsCount: 4,
  lastUpdated: '14:32:12 GMT',
  dataFreshness: 'LIVE TICKING',
  dataMode: 'LIVE OSINT FEED'
};
