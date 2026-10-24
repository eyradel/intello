// Narrative Intelligence & Geospatial Propagation Model for Ghana Post Intelligence
// Powers the "Sentiment Ripple" engine and narrative cluster analytics

export const NARRATIVES_DATA = [
  {
    id: 'narr-01',
    title: 'Transport fares becoming increasingly unaffordable for daily commuters',
    summary: 'Public grievance cluster regarding intra-city minibus (trotro) fare increases following fuel price reviews, spreading along the primary transit corridor from Accra through Koforidua to Kumasi and Tamale.',
    category: 'Cost of Living / Transit',
    firstDetected: 'Today 08:30 GMT',
    firstDetectedTime: '08:30',
    intensity: 'CRITICAL',
    intensityScore: 92,
    growthRate: '+47%',
    sentiment: -72,
    originRegionId: 'greater-accra',
    originRegionName: 'Greater Accra',
    originCoordinates: [-0.186964, 5.603717],
    currentReach: '4 Regions (68% Urban Transit Hubs)',
    affectedRegions: ['greater-accra', 'eastern', 'ashanti', 'northern'],
    velocity: '+19.4%/hr',
    signalVolume: 24890,
    sourcesCount: 142,
    confidence: 93,
    organicProbability: 88,
    coordinatedProbability: 12,
    associatedIssues: ['cost_of_living', 'fuel_prices', 'roads'],
    associatedEntities: ['GPRTU', 'Ministry of Transport', 'National Petroleum Authority'],
    timeline: [
      {
        step: 1,
        time: '08:30 GMT',
        label: 'Detection in Greater Accra',
        regionId: 'greater-accra',
        regionName: 'Greater Accra',
        coords: [-0.186964, 5.603717],
        sentiment: -68,
        volume: 4820,
        description: 'Morning rush-hour commuter complaints spike at Circle and Kaneshie bus terminals following driver notices.'
      },
      {
        step: 2,
        time: '10:15 GMT',
        label: 'Propagation to Eastern Region',
        regionId: 'eastern',
        regionName: 'Eastern',
        coords: [-0.259132, 6.094094],
        sentiment: -64,
        volume: 3120,
        description: 'Intercity commuters on Accra-Koforidua and Nsawam routes echo fare dispute videos on local radio.'
      },
      {
        step: 3,
        time: '12:45 GMT',
        label: 'Escalation into Ashanti Region',
        regionId: 'ashanti',
        regionName: 'Ashanti',
        coords: [-1.624431, 6.688480],
        sentiment: -71,
        volume: 9410,
        description: 'Kejetia and Asafo market commercial driver unions hold emergency briefing, multiplying broadcast mentions.'
      },
      {
        step: 4,
        time: '15:20 GMT',
        label: 'Acceleration into Northern Region',
        regionId: 'northern',
        regionName: 'Northern',
        coords: [-0.839300, 9.400786],
        sentiment: -75,
        volume: 7540,
        description: 'Long-distance freight drivers and Tamale metro transit users report compounding freight surcharges on food commodities.'
      }
    ],
    arcPaths: [
      { from: [-0.186964, 5.603717], to: [-0.259132, 6.094094], label: 'Accra -> Eastern' },
      { from: [-0.259132, 6.094094], to: [-1.624431, 6.688480], label: 'Eastern -> Ashanti' },
      { from: [-1.624431, 6.688480], to: [-0.839300, 9.400786], label: 'Ashanti -> Northern' }
    ]
  },
  {
    id: 'narr-02',
    title: 'Northern grain buffer stock release requests mount amid staple food spikes',
    summary: 'Public call-in discussions and trader communiques across Upper East, Northern, and North East demanding immediate release of strategic grain reserves to temper sorghum, millet, and corn prices.',
    category: 'Food Security / Markets',
    firstDetected: 'Yesterday 14:15 GMT',
    firstDetectedTime: '14:15',
    intensity: 'HIGH',
    intensityScore: 84,
    growthRate: '+33%',
    sentiment: -64,
    originRegionId: 'upper-east',
    originRegionName: 'Upper East',
    originCoordinates: [-0.850000, 10.785556],
    currentReach: '3 Regions (82% Northern Markets)',
    affectedRegions: ['upper-east', 'northern', 'north-east'],
    velocity: '+14.2%/hr',
    signalVolume: 16420,
    sourcesCount: 96,
    confidence: 89,
    organicProbability: 92,
    coordinatedProbability: 8,
    associatedIssues: ['food_prices', 'cost_of_living', 'agriculture'],
    associatedEntities: ['National Buffer Stock Company', 'Ministry of Food and Agriculture'],
    timeline: [
      {
        step: 1,
        time: '14:15 GMT',
        label: 'Bolgatanga Market Assembly',
        regionId: 'upper-east',
        regionName: 'Upper East',
        coords: [-0.850000, 10.785556],
        sentiment: -62,
        volume: 4200,
        description: 'Market women association issues public plea over 25% weekly grain price increase.'
      },
      {
        step: 2,
        time: '17:30 GMT',
        label: 'Echo in Tamale Grain Enclave',
        regionId: 'northern',
        regionName: 'Northern',
        coords: [-0.839300, 9.400786],
        sentiment: -65,
        volume: 7100,
        description: 'Northern youth groups and student caterers highlight boarding school kitchen budget pressures.'
      },
      {
        step: 3,
        time: '21:00 GMT',
        label: 'Spread to Nalerigu & Walewale',
        regionId: 'north-east',
        regionName: 'North East',
        coords: [-0.366667, 10.533333],
        sentiment: -67,
        volume: 5120,
        description: 'Rural farmer cooperatives voice inability to purchase certified seeds without grain sales revenue.'
      }
    ],
    arcPaths: [
      { from: [-0.850000, 10.785556], to: [-0.839300, 9.400786], label: 'Upper East -> Northern' },
      { from: [-0.839300, 9.400786], to: [-0.366667, 10.533333], label: 'Northern -> North East' }
    ]
  },
  {
    id: 'narr-03',
    title: 'Prepaid electricity mobile token downtime during month-end recharge window',
    summary: 'Consumers reporting electronic token recharge latency and network timeout messages on utility payment applications, generating high chatter in southern urban clusters.',
    category: 'Utilities / Infrastructure',
    firstDetected: 'Today 11:20 GMT',
    firstDetectedTime: '11:20',
    intensity: 'HIGH',
    intensityScore: 78,
    growthRate: '+39%',
    sentiment: -58,
    originRegionId: 'greater-accra',
    originRegionName: 'Greater Accra',
    originCoordinates: [-0.186964, 5.603717],
    currentReach: '3 Regions (Metropolitan areas)',
    affectedRegions: ['greater-accra', 'ashanti', 'central'],
    velocity: '+16.5%/hr',
    signalVolume: 18900,
    sourcesCount: 88,
    confidence: 94,
    organicProbability: 95,
    coordinatedProbability: 5,
    associatedIssues: ['electricity', 'digital_services'],
    associatedEntities: ['Electricity Company of Ghana (ECG)', 'PURC'],
    timeline: [
      {
        step: 1,
        time: '11:20 GMT',
        label: 'Accra Suburban Outcry',
        regionId: 'greater-accra',
        regionName: 'Greater Accra',
        coords: [-0.186964, 5.603717],
        sentiment: -55,
        volume: 9100,
        description: 'Social posts and radio call-ins surge in Madina, Tema, and Kasoa over mobile token generation timeouts.'
      },
      {
        step: 2,
        time: '13:00 GMT',
        label: 'Spread to Kumasi Urban Districts',
        regionId: 'ashanti',
        regionName: 'Ashanti',
        coords: [-1.624431, 6.688480],
        sentiment: -60,
        volume: 6400,
        description: 'Commercial retail shops report power disconnects due to vendor terminal downtime.'
      },
      {
        step: 3,
        time: '14:40 GMT',
        label: 'Central Region Coastal Nodes',
        regionId: 'central',
        regionName: 'Central',
        coords: [-1.246604, 5.105353],
        sentiment: -58,
        volume: 3400,
        description: 'Cape Coast and Winneba residents join discussion requesting emergency manual token credits.'
      }
    ],
    arcPaths: [
      { from: [-0.186964, 5.603717], to: [-1.624431, 6.688480], label: 'Accra -> Ashanti' },
      { from: [-0.186964, 5.603717], to: [-1.246604, 5.105353], label: 'Accra -> Central' }
    ]
  },
  {
    id: 'narr-04',
    title: 'Birim River water treatment turbidity and community river protection audits',
    summary: 'Ecological watchdogs and water utility workers report elevated sediment levels at Kyebi and Bunso treatment plants, triggering broader public discussion on water security.',
    category: 'Environment / Water',
    firstDetected: '20 Oct 09:10 GMT',
    firstDetectedTime: '09:10',
    intensity: 'MODERATE',
    intensityScore: 68,
    growthRate: '+15%',
    sentiment: -66,
    originRegionId: 'eastern',
    originRegionName: 'Eastern',
    originCoordinates: [-0.259132, 6.094094],
    currentReach: '2 Regions (Eastern and Western basins)',
    affectedRegions: ['eastern', 'western'],
    velocity: '+8.3%/hr',
    signalVolume: 12400,
    sourcesCount: 74,
    confidence: 91,
    organicProbability: 90,
    coordinatedProbability: 10,
    associatedIssues: ['environment', 'water'],
    associatedEntities: ['Ghana Water Company', 'Environmental Protection Authority', 'Minerals Commission'],
    timeline: [
      {
        step: 1,
        time: '09:10 GMT',
        label: 'Eastern Water Treatment Intake',
        regionId: 'eastern',
        regionName: 'Eastern',
        coords: [-0.259132, 6.094094],
        sentiment: -68,
        volume: 7200,
        description: 'Plant engineers disclose rising aluminum sulfate treatment chemical consumption.'
      },
      {
        step: 2,
        time: '14:20 GMT',
        label: 'Western Mining Basin Alignment',
        regionId: 'western',
        regionName: 'Western',
        coords: [-1.755357, 4.901554],
        sentiment: -64,
        volume: 5200,
        description: 'Pra and Ankobra environmental civil society coalitions co-sign open letter demanding buffer enforcement.'
      }
    ],
    arcPaths: [
      { from: [-0.259132, 6.094094], to: [-1.755357, 4.901554], label: 'Eastern -> Western' }
    ]
  }
];

export function getNarrativeById(id) {
  return NARRATIVES_DATA.find(n => n.id === id) || NARRATIVES_DATA[0];
}
