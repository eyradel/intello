// Coordination Watch & Inauthentic Amplification Detection
// Identifies synchronized messaging, copy-paste clusters, and calculates Organic Adjusted Sentiment

export const COORDINATION_DATA = {
  globalCoordinationRisk: 'ELEVATED',
  globalRiskScore: 68,
  activeClustersCount: 4,
  flaggedAccountsCount: 312,
  rawNationalSentiment: -24.6,
  adjustedNationalSentiment: -18.6, // Discounting coordinated amplification spikes
  adjustmentExplanation: 'When coordinated amplification clusters are filtered using Bayesian temporal-burst decay, the organic national sentiment improves from -24.6 to -18.6, indicating that extreme outrage spikes are partially magnified by non-organic volume.',
  clusters: [
    {
      id: 'COORD-CL-01',
      title: 'Fuel Price Panicking Copypasta Syndicate',
      riskScore: 84,
      level: 'HIGH PROBABILITY',
      firstDetected: 'Today 13:42 GMT',
      regionsInvolved: ['Greater Accra', 'Ashanti'],
      detectedVolume: 1420,
      identicalPhrase: 'Fuel will cross 20 GHS by midnight today buy now immediately!',
      temporalSpreadMinutes: 3.5,
      similarityScore: 96,
      uniqueAccounts: 48,
      accountAgeMedianDays: 14,
      botProbability: 82,
      astroturfingProbability: 76,
      organicImpact: 'Artificial amplification of transport anxiety by ~6.2 sentiment points.',
      status: 'UNDER ACTIVE MONITORING'
    },
    {
      id: 'COORD-CL-02',
      title: 'Synchronized Utility Outage Hashtag Burst',
      riskScore: 62,
      level: 'MODERATE PROBABILITY',
      firstDetected: 'Today 11:35 GMT',
      regionsInvolved: ['Greater Accra', 'Central'],
      detectedVolume: 890,
      identicalPhrase: '#DUMSOR_RETURNS_NOW_CHECK_METER_OUTAGE',
      temporalSpreadMinutes: 8.2,
      similarityScore: 88,
      uniqueAccounts: 29,
      accountAgeMedianDays: 45,
      botProbability: 58,
      astroturfingProbability: 64,
      organicImpact: 'Exaggerated geographical scope of localized 45-minute server sync lag.',
      status: 'INVESTIGATING'
    },
    {
      id: 'COORD-CL-03',
      title: 'Duplicate Port Tariff Smear Campaign',
      riskScore: 71,
      level: 'ELEVATED PROBABILITY',
      firstDetected: 'Yesterday 19:10 GMT',
      regionsInvolved: ['Greater Accra', 'Western'],
      detectedVolume: 1140,
      identicalPhrase: '100% tax increment on container clearing introduced secretly',
      temporalSpreadMinutes: 12.0,
      similarityScore: 91,
      uniqueAccounts: 38,
      accountAgeMedianDays: 22,
      botProbability: 70,
      astroturfingProbability: 78,
      organicImpact: 'Spurred genuine importer panic before official GRA tariff clarification.',
      status: 'MITIGATED BY OFFICIAL FACT-CHECK'
    },
    {
      id: 'COORD-CL-04',
      title: 'Coordinated Agri-Coupon Rumor Loop',
      riskScore: 54,
      level: 'MODERATE PROBABILITY',
      firstDetected: '20 Oct 16:30 GMT',
      regionsInvolved: ['Northern', 'Upper East'],
      detectedVolume: 610,
      identicalPhrase: 'Fertilizer vouchers cancelled in northern sector effective tomorrow',
      temporalSpreadMinutes: 18.5,
      similarityScore: 84,
      uniqueAccounts: 21,
      accountAgeMedianDays: 60,
      botProbability: 46,
      astroturfingProbability: 59,
      organicImpact: 'Triggered temporary rush at retail distribution sheds.',
      status: 'RESOLVED'
    }
  ],
  metrics: {
    textSimilarityClusters: 18,
    simultaneousPostsPeak: 42,
    newAccountsRatio: '14.8%',
    temporalSynchrony: 0.74,
    organicConfidence: '88.2%'
  }
};
