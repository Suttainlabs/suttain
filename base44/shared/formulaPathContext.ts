// Turns the bounded path profile from the Formula Generator into prompt context.
const str = (v: unknown, max = 300) => (v ?? '').toString().replace(/[\r\n]+/g, ' ').slice(0, max);
const num = (v: unknown, max: number) => Math.min(Math.max(Number(v) || 0, 0), max);
const pick = (v: unknown, allowed: string[], fallback: string) => allowed.includes(String(v)) ? String(v) : fallback;

export function pathContext(profile: any, isBusiness: boolean): string {
  if (!profile || typeof profile !== 'object') return '';
  if (isBusiness) {
    return `\n\nPRODUCTION CONTEXT:
- Batch size: ${num(profile.batch_kg, 100000)} kg producing ${num(profile.units_per_batch, 10000000)} units
- Primary market: ${pick(profile.region, ['US', 'EU', 'UK', 'Canada'], 'US')} (use that market's ingredient restrictions and labelling rules)
- Sales channel: ${pick(profile.channel, ['direct', 'wholesale', 'private_label'], 'direct')}
- Target retail price: $${num(profile.retail_price, 10000)} per unit; choose ingredients that leave a healthy gross margin at that price
Write procedure quantities and equipment for this batch size (industrial mixers, vessels), not a 100 g bench batch.`;
  }
  const budget = pick(profile.budget, ['low', 'medium', 'high'], 'low');
  return `\n\nPERSONAL PREFERENCES (must be respected):
- Budget: ${budget === 'low' ? 'under $20 total' : budget === 'medium' ? '$20 to $50 total' : 'flexible'}
- Scent: ${pick(profile.scent, ['none', 'light', 'citrus', 'floral', 'herbal'], 'light')}${profile.scent === 'none' ? ' (no fragrance or essential oils at all)' : ''}
- NEVER include these or derivatives of them: ${str(profile.sensitivities) || 'none stated'}
- Prefer ingredients the user already has: ${str(profile.on_hand) || 'none stated'}
- Equipment available: ${profile.equipment === 'basic_lab' ? 'kitchen tools plus thermometer, pH strips and stick blender' : 'ordinary kitchen tools only, no lab equipment'}`;
}