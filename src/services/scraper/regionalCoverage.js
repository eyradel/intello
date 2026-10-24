// Gazetteer rules are hints, not authoritative administrative geocoding.
export const REGION_ALIASES = {
  'Greater Accra': ['greater accra', 'accra', 'tema'],
  'Ashanti': ['ashanti', 'kumasi', 'obuasi'],
  'Western North': ['western north', 'sefwi', 'wiawso'],
  'Western': ['western region', 'sekondi', 'takoradi', 'tarkwa'],
  'Central': ['central region', 'cape coast', 'elmina', 'winneba', 'kasoa'],
  'Volta': ['volta region', 'ho', 'aflao', 'anlo', 'tongu'],
  'Upper East': ['upper east', 'bolgatanga', 'navrongo', 'bawku'],
  'Upper West': ['upper west', 'wa', 'nandom', 'lawra'],
  'Bono East': ['bono east', 'techiman', 'kintampo'],
  'Bono': ['bono region', 'sunyani', 'dormaa'],
  'Eastern': ['eastern region', 'koforidua', 'nkawkaw', 'akuapem'],
  'Savannah': ['savannah region', 'damongo', 'salaga'],
  'North East': ['north east region', 'nalerigu', 'walewale'],
  'Northern': ['northern region', 'tamale', 'yendi', 'savelugu'],
  'Oti': ['oti region', 'dambai', 'nkwanta'],
  'Ahafo': ['ahafo region', 'goaso']
};
const slug = name => name.toLowerCase().replaceAll(' ', '-');
export function inferGeography(text) {
  let remaining = String(text).toLowerCase().replace(/[-–]/g, ' ');
  const regionMatches = [];
  // Longer administrative names consume their spans before shorter names.
  const aliases = Object.entries(REGION_ALIASES).flatMap(([region, words]) => words.map(word => ({region, word})))
    .sort((a, b) => b.word.length - a.word.length);
  for (const {region, word} of aliases) {
    const pattern = new RegExp(`\\b${word}\\b`, 'g');
    if (pattern.test(remaining)) {
      if (!regionMatches.some(r => r.region === region)) regionMatches.push({region, regionId: slug(region)});
      remaining = remaining.replace(pattern, ' ');
    }
  }
  return {
    region: regionMatches.length === 1 ? regionMatches[0].region : regionMatches.length ? 'Multiple regions' : 'Unassigned',
    regionId: regionMatches.length === 1 ? regionMatches[0].regionId : null,
    regionMatches,
    method: 'gazetteer-mention',
    limitation: 'A place mention does not establish the location of an incident. Constituency requires a verified boundary gazetteer.'
  };
}
export function regionalSummaries(signals, now = Date.now(), hours = 24) {
  const recent = signals.filter(s => s.publicationDateKnown !== false && Number.isFinite(Date.parse(s.timestamp)) && Date.parse(s.timestamp) <= now && Date.parse(s.timestamp) >= now - hours * 3600000);
  return {
    generatedAt: new Date(now).toISOString(), windowHours: hours,
    methodology: 'Extractive news coverage summary; place mentions can span regions. Counts are articles, not residents or public opinion. Publisher independence is unverified.',
    unassignedCount: recent.filter(s => !s.regionMatches?.length).length,
    unknownPublicationDateCount: signals.filter(s => s.publicationDateKnown === false).length,
    regions: Object.keys(REGION_ALIASES).map(name => {
      const articles = recent.filter(s => s.regionMatches?.some(r => r.region === name));
      const issues = {};
      for (const article of articles) issues[article.issue] = (issues[article.issue] || 0) + 1;
      return {
        id: slug(name), name, articleCount: articles.length,
        sourceCount: new Set(articles.map(s => s.source)).size,
        coverage: articles.length === 0 ? 'NO_COVERAGE' : articles.length < 3 ? 'SPARSE' : 'OBSERVED',
        topIssues: Object.entries(issues).sort((a,b) => b[1]-a[1]).map(([issue,count]) => ({issue,count})),
        summary: articles.length ? articles.slice(0,3).map(s => s.headline).join('; ') : 'No recent collected evidence. This does not establish that no events occurred.',
        evidence: articles.sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp)).slice(0,10).map(s => ({id:s.id,headline:s.headline,url:s.url,source:s.source,timestamp:s.timestamp})),
        constituencies: [], constituencyCoverage: 'NOT_CONFIGURED'
      };
    })
  };
}
