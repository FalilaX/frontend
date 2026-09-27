import { translate, useLanguage } from './language';
import type { Locale } from './locale';

// Exact, versioned English templates only. Captured names, IDs, measurements,
// percentages and units remain unchanged. Never write this display text to an API.
const rules: Array<{ pattern: RegExp; key: string; fields: string[]; labels?: string[] }> = [
  { pattern: /^Last successful pull is older than expected threshold \((\d+) minutes\)\.$/, key: 'Last successful pull is older than expected threshold ({minutes} minutes).', fields: ['minutes'] },
  { pattern: /^Affected area: (.+)$/, key: 'Affected area: {area}', fields: ['area'] },
  { pattern: /^Likely source: (.+) \((\d+(?:\.\d+)?)% confidence\)$/, key: 'Likely source: {source} ({confidence}% confidence)', fields: ['source', 'confidence'] },
  { pattern: /^Full details: (https?:\/\/\S+)$/, key: 'Full details: {url}', fields: ['url'] },
  { pattern: /^(HIGH|LOW|MEDIUM|CRITICAL) [·-] (Turbidity|Chlorine|Nitrate|Temperature|Conductivity|pH)$/, key: '{severity} · {parameter}', fields: ['severity','parameter'], labels: ['severity','parameter'] },
  { pattern: /^(\d+) upstream infrastructure relationships identified$/, key: '{count} upstream infrastructure relationships identified', fields: ['count'] },
  { pattern: /^FalilaX resolved (.+) as the explicit incident source asset and traced its active upstream AssetRelationship topology for investigation\.$/, key: 'FalilaX resolved {asset} as the explicit incident source asset and traced its active upstream AssetRelationship topology for investigation.', fields: ['asset'] },
  { pattern: /^Asset (\d+) is (\d+) upstream steps? from the flagged asset\.$/, key: 'Asset {id} is {count} upstream steps from the flagged asset.', fields: ['id', 'count'] },
  { pattern: /^Topology relationship confidence: (\d+(?:\.\d+)?)%\.$/, key: 'Topology relationship confidence: {confidence}%.', fields: ['confidence'] },
  { pattern: /^Infrastructure type supports (central[_ ]system|distribution[_ ]network|treatment[_ ]plant|water[_ ]source)\.$/, key: 'Infrastructure type supports {type}.', fields: ['type'], labels: ['type'] },
  { pattern: /^Topology-aware evidence: (.+) is the highest-ranked upstream asset candidate at depth (\d+)\.$/, key: 'Topology-aware evidence: {asset} is the highest-ranked upstream asset candidate at depth {depth}.', fields: ['asset', 'depth'] },
  { pattern: /^Controlled FalilaX safety simulation generated (-?\d+(?:\.\d+)?) ([^\r\n]+?) for (turbidity|chlorine|nitrate|pH|temperature|conductivity) at (.+)\. This is not a real-world emergency\.$/, key: 'Controlled FalilaX safety simulation generated {value} {unit} for {parameter} at {location}. This is not a real-world emergency.', fields: ['value','unit','parameter','location'], labels: ['parameter'] },
  { pattern: /^(Low Pressure|Nitrate Attention|High Turbidity|Low Chlorine) at node (\d+)$/, key: '{event} at node {id}', fields: ['event','id'], labels: ['event'] },
  { pattern: /^Runtime event indicates an operational incident\. (\d+) affected assets\.$/, key: 'Runtime event indicates an operational incident. Affected assets: {count}.', fields: ['count'] },
];

const labels: Record<string, string> = {
  HIGH: 'High', LOW: 'Low', MEDIUM: 'Medium', CRITICAL: 'Critical',
  central_system: 'Central system', distribution_network: 'Distribution network',
  treatment_plant: 'Treatment plant', water_source: 'Water source',
  turbidity: 'Turbidity', chlorine: 'Chlorine', nitrate: 'Nitrate',
  temperature: 'Temperature', conductivity: 'Conductivity', pH: 'pH',
};

export function translateGenerated(value: string, locale: Locale): { text: string; translated: boolean } {
  if (locale === 'en' || !value) return { text: value, translated: false };
  const exact = translate(value, locale);
  if (exact !== value) return { text: exact, translated: true };
  for (const rule of rules) {
    const match = value.match(rule.pattern);
    if (!match) continue;
    const fields = Object.fromEntries(rule.fields.map((field, index) => {
      const raw = match[index + 1];
      return [field, rule.labels?.includes(field) ? translate(labels[raw.replace(/ /g, "_")] ?? raw, locale) : raw];
    }));
    return { text: translate(rule.key, locale).replace(/\{([a-zA-Z]+)\}/g, (token, key) => fields[key] ?? token), translated: true };
  }
  return { text: value, translated: false };
}

export function GeneratedText({ value }: { value: string | null | undefined }) {
  const { locale } = useLanguage();
  const raw = value ?? '';
  return <span className="break-words whitespace-pre-wrap">{raw.split(/(\r?\n)/).map((line, index) => {
    if (!line.trim() || locale === 'en') return line;
    const match = line.match(/^(\s*(?:[•*-]\s+)?)(.*?)(\s*)$/)!;
    const result = translateGenerated(match[2], locale);
    return <span key={index} title={result.translated ? line : undefined}>
      {match[1]}{!result.translated && <span className="mr-1 text-xs font-normal text-slate-400">{translate('Original text — translation unavailable:', locale)} </span>}
      {result.text}{match[3]}
    </span>;
  })}</span>;
}
