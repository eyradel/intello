// National Public Events & Policy Correlates for Ghana Post Intelligence
// Maps major real-world public announcements to observed national and regional sentiment shifts

export const EVENTS_DATA = [
  {
    id: 'evt-01',
    date: '22 Oct 2026',
    time: '07:00 GMT',
    title: 'Downstream Petroleum Price Window Review',
    category: 'ECONOMIC',
    impactLevel: 'CRITICAL',
    sentimentDelta: '-4.2 pts',
    regionsAffected: ['Greater Accra', 'Ashanti', 'Northern', 'Western'],
    description: 'OMCs post modest upward adjustments at the pumps; triggers instantaneous trotro fare agitation across Greater Accra and Kumasi.',
    correlatedIssues: ['fuel_prices', 'cost_of_living', 'roads'],
    associatedNarratives: ['narr-01']
  },
  {
    id: 'evt-02',
    date: '21 Oct 2026',
    time: '14:30 GMT',
    title: 'GUTA Emergency Consultative Summit in Accra',
    category: 'POLICY',
    impactLevel: 'HIGH',
    sentimentDelta: '+3.1 pts',
    regionsAffected: ['Greater Accra', 'Ashanti'],
    description: 'Traders association convenes leadership with Ministry of Trade and GRA to negotiate unified benchmark valuation at maritime ports.',
    correlatedIssues: ['taxes', 'cost_of_living'],
    associatedNarratives: []
  },
  {
    id: 'evt-03',
    date: '20 Oct 2026',
    time: '10:00 GMT',
    title: 'Suame Interchange Phase 1 Bypass Commissioning',
    category: 'INFRASTRUCTURE',
    impactLevel: 'MODERATE',
    sentimentDelta: '+5.4 pts',
    regionsAffected: ['Ashanti', 'Western North'],
    description: 'Handover of 14km asphalt bypass road easing cargo congestion at Kumasi northern arterial entrance.',
    correlatedIssues: ['roads', 'infrastructure'],
    associatedNarratives: []
  },
  {
    id: 'evt-04',
    date: '18 Oct 2026',
    time: '18:15 GMT',
    title: 'Tamale Water Supply Nawuni Dredging Announcement',
    category: 'CIVIC',
    impactLevel: 'HIGH',
    sentimentDelta: '+2.8 pts',
    regionsAffected: ['Northern'],
    description: 'GWCL deploys amphibious excavators to dredge intake channels; restores raw water volume to Tamale treatment plant.',
    correlatedIssues: ['water', 'sanitation'],
    associatedNarratives: ['narr-02']
  },
  {
    id: 'evt-05',
    date: '15 Oct 2026',
    time: '09:00 GMT',
    title: 'National Cocoa Producer Price Bonus Disbursal',
    category: 'ECONOMIC',
    impactLevel: 'HIGH',
    sentimentDelta: '+8.2 pts',
    regionsAffected: ['Western North', 'Ahafo', 'Ashanti', 'Eastern'],
    description: 'COCOBOD begins paying approved seasonal farmer loyalty bonuses through electronic cocoa wallet platform.',
    correlatedIssues: ['agriculture', 'jobs'],
    associatedNarratives: []
  },
  {
    id: 'evt-06',
    date: '12 Oct 2026',
    time: '16:00 GMT',
    title: 'ECG Server Upgrade Notice & PURC Tariff Hearing',
    category: 'UTILITIES',
    impactLevel: 'MODERATE',
    sentimentDelta: '-3.6 pts',
    regionsAffected: ['Greater Accra', 'Central'],
    description: 'Public utility regulator opens consultative forum regarding multi-year electricity distribution tariffs.',
    correlatedIssues: ['electricity', 'digital_services'],
    associatedNarratives: ['narr-03']
  }
];
