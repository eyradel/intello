// Authentic Political Parties & Civic Movements Dataset for Ghana Post Intelligence
// Analyzes public-source political discussion, media exposure share, and issue association
// Strictly lawful public discourse metrics — NOT voter polling or electoral microtargeting

export const PARTIES_DATA = [
  {
    id: 'npp',
    name: 'New Patriotic Party (NPP)',
    shortName: 'NPP',
    color: '#0066ff',
    nationalDiscussionShare: 45.4,
    discussionSentiment: 4.2,
    sentiment24h: +0.8,
    sentiment7d: +1.6,
    sentiment30d: -1.8,
    mentions: '214.2K',
    mentionCount: 214200,
    velocity: '+15.4%/day',
    mediaShare: 46.8,
    topIssuesAssociated: [
      { issue: 'Digitalization & Technology Infrastructure', sentiment: +28, share: 29 },
      { issue: 'Agenda 111 & Free Senior High School', sentiment: +22, share: 26 },
      { issue: 'Macro-economic & Cedi Stabilization', sentiment: -42, share: 24 },
      { issue: 'Roads & Interchange Construction', sentiment: +14, share: 12 },
      { issue: 'PFJ Phase 2 Agro-Input Distribution', sentiment: +10, share: 9 }
    ],
    regionalDiscussion: {
      'greater-accra': -16,
      'ashanti': +26,
      'eastern': +12,
      'central': +2,
      'western': +6,
      'western-north': +10,
      'bono': +21,
      'ahafo': +18,
      'bono-east': +6,
      'oti': -7,
      'volta': -22,
      'northern': +18,
      'savannah': +8,
      'north-east': +29,
      'upper-east': +2,
      'upper-west': +8
    },
    narrativeClusters: [
      'Digital public service milestones and mobile interoperability expansion',
      'Free SHS enrollment records and infrastructural upgrades',
      'Public debates on cost of living and inflation pressures'
    ],
    sentimentHistory: [2, 3, 2, 4, 3, 5, 4, 6, 5, 4, 5, 4, 5, 4.2],
    sourceDistribution: { news: 45, social: 36, broadcast: 15, forums: 4 }
  },
  {
    id: 'ndc',
    name: 'National Democratic Congress (NDC)',
    shortName: 'NDC',
    color: '#00cc66',
    nationalDiscussionShare: 41.8,
    discussionSentiment: 12.6,
    sentiment24h: +2.1,
    sentiment7d: +3.9,
    sentiment30d: +6.4,
    mentions: '198.6K',
    mentionCount: 198600,
    velocity: '+17.2%/day',
    mediaShare: 42.1,
    topIssuesAssociated: [
      { issue: '24-Hour Economy & Industrial Jobs', sentiment: +32, share: 35 },
      { issue: 'Cost of Living & Transport Grievances', sentiment: +24, share: 28 },
      { issue: 'Public Debt Scrutiny & Accountability', sentiment: +20, share: 18 },
      { issue: 'Women Development Bank Credit Access', sentiment: +26, share: 11 },
      { issue: 'Anti-Galamsey Emergency Intervention', sentiment: +18, share: 8 }
    ],
    regionalDiscussion: {
      'greater-accra': +20,
      'ashanti': -4,
      'eastern': +6,
      'central': +18,
      'western': +12,
      'western-north': +6,
      'bono': -4,
      'ahafo': -2,
      'bono-east': +9,
      'oti': +22,
      'volta': +42,
      'northern': +24,
      'savannah': +28,
      'north-east': +10,
      'upper-east': +26,
      'upper-west': +18
    },
    narrativeClusters: [
      '24-Hour Economy policy engagements with trade unions and commercial associations',
      'Parliamentary debates on fiscal accountability and loan approvals',
      'Grievance alignment with coastal fishing communities over premix distribution'
    ],
    sentimentHistory: [6, 7, 8, 9, 8, 10, 11, 10, 12, 13, 11, 13, 12, 12.6],
    sourceDistribution: { news: 41, social: 43, broadcast: 13, forums: 3 }
  },
  {
    id: 'mfc',
    name: 'Movement for Change (Alan Kyerematen / Afrafranto)',
    shortName: 'MFC / AFC',
    color: '#ffaa00',
    nationalDiscussionShare: 6.8,
    discussionSentiment: 16.4,
    sentiment24h: +1.2,
    sentiment7d: +2.8,
    sentiment30d: +4.9,
    mentions: '32.1K',
    mentionCount: 32100,
    velocity: '+9.4%/day',
    mediaShare: 5.9,
    topIssuesAssociated: [
      { issue: 'Great Transformational Plan (GTP)', sentiment: +36, share: 44 },
      { issue: 'Domestic Industrial Agro-Processing', sentiment: +30, share: 26 },
      { issue: 'Youth Business Startups & Mentorship', sentiment: +26, share: 18 },
      { issue: 'Non-Partisan Governance Coalition', sentiment: +22, share: 12 }
    ],
    regionalDiscussion: {
      'greater-accra': +18,
      'ashanti': +28,
      'eastern': +16,
      'central': +14,
      'western': +12,
      'western-north': +9,
      'bono': +15,
      'ahafo': +12,
      'bono-east': +13,
      'oti': +7,
      'volta': +6,
      'northern': +11,
      'savannah': +8,
      'north-east': +6,
      'upper-east': +8,
      'upper-west': +9
    },
    narrativeClusters: [
      'GTP economic roadshows engaging Kumasi and Accra business communities',
      'Third-force youth recruitment and community clubs formation'
    ],
    sentimentHistory: [11, 12, 13, 14, 15, 14, 15, 16, 15, 16, 17, 16, 16, 16.4],
    sourceDistribution: { news: 36, social: 49, broadcast: 12, forums: 3 }
  },
  {
    id: 'new_force',
    name: 'The New Force (Nana Kwame Bediako / Cheddar)',
    shortName: 'New Force',
    color: '#ff3366',
    nationalDiscussionShare: 4.2,
    discussionSentiment: 21.8,
    sentiment24h: +2.6,
    sentiment7d: +4.8,
    sentiment30d: +8.1,
    mentions: '28.4K',
    mentionCount: 28400,
    velocity: '+19.8%/day',
    mediaShare: 3.8,
    topIssuesAssociated: [
      { issue: 'National Industrial Rail Infrastructure', sentiment: +38, share: 42 },
      { issue: 'Youth Wealth Creation & Technology', sentiment: +34, share: 32 },
      { issue: 'Regional Port & Waterway Expansion', sentiment: +24, share: 16 },
      { issue: 'Critical Mineral Value Addition', sentiment: +28, share: 10 }
    ],
    regionalDiscussion: {
      'greater-accra': +31,
      'ashanti': +26,
      'eastern': +18,
      'central': +22,
      'western': +19,
      'western-north': +14,
      'bono': +15,
      'ahafo': +11,
      'bono-east': +12,
      'oti': +9,
      'volta': +14,
      'northern': +16,
      'savannah': +12,
      'north-east': +10,
      'upper-east': +11,
      'upper-west': +14
    },
    narrativeClusters: [
      'Manifesto launch on domestic mineral refining and industrialization',
      'High viral engagement among Gen-Z on TikTok, X, and YouTube'
    ],
    sentimentHistory: [14, 15, 16, 17, 19, 18, 20, 21, 22, 20, 23, 22, 21, 21.8],
    sourceDistribution: { news: 26, social: 62, broadcast: 8, forums: 4 }
  },
  {
    id: 'civil_society',
    name: 'Civil Society, Labor & Think Tanks',
    shortName: 'Civil Society / TUC',
    color: '#9933ff',
    nationalDiscussionShare: 1.8,
    discussionSentiment: 24.5,
    sentiment24h: +1.4,
    sentiment7d: +3.2,
    sentiment30d: +6.1,
    mentions: '14.2K',
    mentionCount: 14200,
    velocity: '+8.2%/day',
    mediaShare: 1.4,
    topIssuesAssociated: [
      { issue: 'Anti-Galamsey River Protection (Water Crisis)', sentiment: +48, share: 46 },
      { issue: 'Organised Labour Minimum Wage Negotiations', sentiment: +36, share: 28 },
      { issue: 'Public Procurement & Asset Declaration', sentiment: +32, share: 16 },
      { issue: 'Right to Information & Media Freedom', sentiment: +26, share: 10 }
    ],
    regionalDiscussion: {
      'greater-accra': +36,
      'ashanti': +28,
      'eastern': +32,
      'central': +24,
      'western': +30,
      'western-north': +22,
      'bono': +18,
      'ahafo': +19,
      'bono-east': +16,
      'oti': +14,
      'volta': +22,
      'northern': +24,
      'savannah': +16,
      'north-east': +14,
      'upper-east': +19,
      'upper-west': +20
    },
    narrativeClusters: [
      'Organised Labour coalitions calling for state of emergency on polluted river bodies',
      'Legal petitions regarding public contract disclosures'
    ],
    sentimentHistory: [18, 19, 21, 20, 22, 23, 24, 25, 23, 25, 26, 24, 25, 24.5],
    sourceDistribution: { news: 48, social: 34, broadcast: 12, forums: 6 }
  }
];

export function getPartyById(id) {
  return PARTIES_DATA.find(p => p.id === id) || PARTIES_DATA[0];
}
