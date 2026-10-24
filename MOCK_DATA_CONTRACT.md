# Mock Data Contract

All frontend components should consume service functions rather than importing raw arrays directly.

Suggested types:

```ts
export type ConfidenceMeta = {
  confidence: number;
  sampleSize: number;
  sourceCount: number;
  sourceDiversity: number;
  freshness: 'live' | 'current' | 'delayed' | 'stale';
  synthetic: boolean;
};

export type RegionSummary = {
  id: string;
  name: string;
  publicSentiment: number;
  movement24h: number;
  movement7d: number;
  topIssues: IssueSignal[];
  topNarratives: NarrativeSummary[];
  meta: ConfidenceMeta;
};

export type IssueSignal = {
  key: string;
  label: string;
  pressure: number;
  sentiment: number;
  velocity: number;
  mentionCount: number;
  meta: ConfidenceMeta;
};

export type NarrativeSummary = {
  id: string;
  title: string;
  velocity: number;
  sentiment: number;
  amplificationScore: number;
  firstDetectedAt: string;
  affectedRegionIds: string[];
  meta: ConfidenceMeta;
};
```

Suggested service interface:
```ts
interface IntelligenceService {
  getNationalSummary(window: string): Promise<NationalSummary>;
  getRegions(window: string): Promise<RegionSummary[]>;
  getRegion(id: string, window: string): Promise<RegionDetail>;
  getEntities(params: EntityQuery): Promise<EntitySummary[]>;
  getIssues(window: string): Promise<IssueSignal[]>;
  getNarratives(window: string): Promise<NarrativeSummary[]>;
  getSignals(since?: string): Promise<SignalEvent[]>;
}
```

Provide two implementations:
- `MockIntelligenceService`
- `ApiIntelligenceService`

UI code should switch via environment/config, not code changes.
