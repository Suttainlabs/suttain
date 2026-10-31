import React from 'react';
import {
  Loader2, AlertTriangle, CheckCircle, ShieldCheck, ShieldAlert, Leaf, HeartPulse,
  RefreshCw, Sparkles, Info, Salad, Recycle, Factory, XCircle, Lightbulb, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Response handling ──────────────────────────────────────────────────────
// base44.functions.invoke returns an axios-style response ({ data }). Unwrap it and
// refuse empty/error payloads so the UI never renders blank shells or invented values.
export function unwrapInvoke(res) {
  const d = res && typeof res === 'object' && 'data' in res && 'status' in res ? res.data : (res?.data ?? res);
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('The analysis came back empty.');
  if (d.error) throw new Error(typeof d.error === 'string' ? d.error : 'The analysis failed.');
  return d;
}

export function errorMessage(err) {
  const status = err?.response?.status;
  if (status === 401) return 'Please sign in to run this check.';
  if (status === 429) return 'Too many requests right now. Wait a moment and try again.';
  return err?.response?.data?.error || err?.message || 'Something went wrong while running this check.';
}

const arr = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const strList = (v) => arr(v).map(str).filter(Boolean);

export function normalizeCompliance(d) {
  return {
    status: ['Compliant', 'Issues Found', 'Requires Review'].includes(d.overall_status) ? d.overall_status : 'Requires Review',
    summary: str(d.summary),
    flagged: arr(d.flagged_ingredients).filter((f) => str(f?.name)),
    recommendations: strList(d.recommendations),
  };
}

const gradeFromScore = (s) => (s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 50 ? 'C' : s >= 30 ? 'D' : 'F');

export function normalizeSustainability(d) {
  const raw = Number(d.overall_score);
  const score = Number.isFinite(raw) ? Math.round(Math.min(100, Math.max(0, raw))) : null;
  // Grade is derived from the score when we have one, so the two can never disagree.
  const grade = score != null ? gradeFromScore(score) : (['A', 'B', 'C', 'D', 'F'].includes(d.grade) ? d.grade : null);
  return {
    score, grade,
    summary: str(d.summary),
    biodegradability: str(d.biodegradability),
    carbon: str(d.carbon_footprint),
    concerns: strList(d.eco_concerns),
    positives: strList(d.green_positives),
    tips: strList(d.improvement_tips),
  };
}

export function normalizeHealth(d) {
  return {
    rating: ['Excellent', 'Good', 'Fair', 'Poor'].includes(d.overall_health_rating) ? d.overall_health_rating : null,
    summary: str(d.health_summary),
    diets: arr(d.dietary_suitability).filter((x) => str(x?.diet)),
    warnings: arr(d.health_warnings).filter((x) => str(x?.warning)),
    highlights: strList(d.nutritional_highlights),
    alternatives: arr(d.healthier_alternatives).filter((x) => str(x?.name)),
    tips: strList(d.consumption_tips),
  };
}

// ── Visual primitives ──────────────────────────────────────────────────────
const TONES = {
  good: { tile: 'bg-emerald-500', border: 'border-emerald-200', soft: 'bg-emerald-50', text: 'text-emerald-800', chip: 'bg-emerald-100 text-emerald-800' },
  ok: { tile: 'bg-[#02988C]', border: 'border-teal-200', soft: 'bg-teal-50', text: 'text-teal-800', chip: 'bg-teal-100 text-teal-800' },
  warn: { tile: 'bg-amber-500', border: 'border-amber-200', soft: 'bg-amber-50', text: 'text-amber-800', chip: 'bg-amber-100 text-amber-800' },
  bad: { tile: 'bg-red-500', border: 'border-red-200', soft: 'bg-red-50', text: 'text-red-800', chip: 'bg-red-100 text-red-800' },
  neutral: { tile: 'bg-slate-400', border: 'border-slate-200', soft: 'bg-slate-50', text: 'text-slate-700', chip: 'bg-slate-100 text-slate-700' },
};

const sevTone = (s) => (s === 'high' ? 'bad' : s === 'medium' ? 'warn' : 'neutral');

const SeverityPill = ({ severity }) => {
  if (!severity) return null;
  const t = TONES[sevTone(severity)];
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${t.chip}`}>{severity}</span>;
};

const Hero = ({ tone, tile, eyebrow, title, summary, children }) => {
  const t = TONES[tone] || TONES.neutral;
  return (
    <div className={`rounded-2xl border ${t.border} bg-white p-5`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white ${t.tile}`}>{tile}</div>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{eyebrow}</p>}
          <p className={`text-xl font-bold leading-tight ${t.text}`}>{title}</p>
          {summary && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{summary}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

const Section = ({ title, icon: Icon, children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
      {Icon && <Icon className="h-4 w-4 text-slate-500" />}{title}
    </h4>
    {children}
  </section>
);

const BulletList = ({ items, icon: Icon, iconClass }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />{item}
      </li>
    ))}
  </ul>
);

const Provenance = ({ children }) => (
  <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-slate-500">
    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    <span>{children}</span>
  </p>
);

// Loading / error / not-yet-run states shared by every AI-backed step.
export function InsightState({ loading, error, hasData, onRun, loadingText, idleText, children }) {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <Loader2 className="h-5 w-5 animate-spin text-[#02988C]" />
          <span className="text-sm text-slate-600">{loadingText}</span>
        </div>
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">This check didn't finish</p>
            <p className="mt-1 text-sm text-red-800">{error}</p>
            <Button size="sm" variant="outline" className="mt-3 border-red-300 bg-white text-red-800 hover:bg-red-100" onClick={onRun}>
              <RefreshCw className="mr-2 h-4 w-4" />Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!hasData) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">{idleText}</p>
        <Button size="sm" className="mt-3 bg-[#02988C] text-white hover:bg-[#02988C]/90" onClick={onRun}>
          <Play className="mr-2 h-4 w-4" />Run check
        </Button>
      </div>
    );
  }
  return children;
}

// ── Compliance ─────────────────────────────────────────────────────────────
const REGIONS = [
  { key: 'EU', re: /\b(eu|europe|european)\b/i },
  { key: 'US', re: /\b(us|usa|fda|united states)\b/i },
  { key: 'Canada', re: /canada/i },
];

export function ComplianceView({ data }) {
  const tone = data.status === 'Compliant' ? 'good' : data.status === 'Issues Found' ? 'bad' : 'warn';
  const Icon = data.status === 'Compliant' ? ShieldCheck : ShieldAlert;
  const regions = REGIONS.map((r) => ({ ...r, count: data.flagged.filter((f) => r.re.test(f.region || '')).length }));
  const title = data.status === 'Compliant' ? 'No regulatory flags found'
    : data.status === 'Issues Found' ? `${data.flagged.length || 'Some'} regulatory issue${data.flagged.length === 1 ? '' : 's'} found`
    : 'Needs a closer review';

  return (
    <div className="space-y-4">
      <Hero tone={tone} tile={<Icon className="h-8 w-8" />} eyebrow="Compliance check" title={title} summary={data.summary}>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {regions.map((r) => (
            <div key={r.key} className={`rounded-xl px-3 py-2 text-center ${r.count ? TONES.warn.soft : 'bg-slate-50'}`}>
              <p className="text-xs font-semibold text-slate-700">{r.key}</p>
              <p className={`text-xs ${r.count ? 'font-semibold text-amber-800' : 'text-slate-500'}`}>
                {r.count ? `${r.count} flag${r.count === 1 ? '' : 's'}` : 'No flags'}
              </p>
            </div>
          ))}
        </div>
      </Hero>

      {data.flagged.length > 0 && (
        <Section title="Flagged ingredients" icon={AlertTriangle}>
          <ul className="divide-y divide-slate-100">
            {data.flagged.map((f, i) => (
              <li key={i} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                  {(f.region || f.issue) && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{[f.region, f.issue].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
                <SeverityPill severity={f.severity} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.recommendations.length > 0 && (
        <Section title="What to do" icon={Lightbulb}>
          <BulletList items={data.recommendations} icon={CheckCircle} iconClass="text-[#02988C]" />
        </Section>
      )}

      <Provenance>
        AI-assisted screen of the listed ingredients, not a legal compliance determination. Confirm anything
        important against EU CosIng, the US FDA and Health Canada's Cosmetic Ingredient Hotlist.
      </Provenance>
    </div>
  );
}

// ── Environmental impact ───────────────────────────────────────────────────
export function SustainabilityView({ data, ingredientEcoAvg }) {
  const s = data.score;
  const tone = s == null ? 'neutral' : s >= 70 ? 'good' : s >= 50 ? 'warn' : 'bad';
  const title = s == null ? 'Impact not scored'
    : s >= 85 ? 'Low environmental impact' : s >= 70 ? 'Moderate-low impact' : s >= 50 ? 'Moderate impact' : 'High environmental impact';

  return (
    <div className="space-y-4">
      <Hero
        tone={tone}
        tile={<>
          <span className="text-2xl font-extrabold leading-none">{data.grade ?? '–'}</span>
          {s != null && <span className="mt-0.5 text-[11px] opacity-90">{s}/100</span>}
        </>}
        eyebrow="Environmental impact"
        title={title}
        summary={data.summary}
      >
        {(data.biodegradability || data.carbon || ingredientEcoAvg > 0) && (
          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            {data.biodegradability && (
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Recycle className="h-3.5 w-3.5" />Biodegradability</dt>
                <dd className="mt-0.5 text-xs text-slate-600">{data.biodegradability}</dd>
              </div>
            )}
            {data.carbon && (
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Factory className="h-3.5 w-3.5" />Carbon footprint</dt>
                <dd className="mt-0.5 text-xs text-slate-600">{data.carbon}</dd>
              </div>
            )}
            {ingredientEcoAvg > 0 && (
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Leaf className="h-3.5 w-3.5" />Ingredient eco average</dt>
                <dd className="mt-0.5 text-xs text-slate-600">{ingredientEcoAvg}/100 across listed ingredients</dd>
              </div>
            )}
          </dl>
        )}
      </Hero>

      {(data.positives.length > 0 || data.concerns.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.positives.length > 0 && (
            <Section title="What's good" icon={Leaf}>
              <BulletList items={data.positives} icon={CheckCircle} iconClass="text-emerald-500" />
            </Section>
          )}
          {data.concerns.length > 0 && (
            <Section title="Concerns" icon={AlertTriangle}>
              <BulletList items={data.concerns} icon={AlertTriangle} iconClass="text-amber-500" />
            </Section>
          )}
        </div>
      )}

      {data.tips.length > 0 && (
        <Section title="How it could be better" icon={Lightbulb}>
          <BulletList items={data.tips} icon={CheckCircle} iconClass="text-[#02988C]" />
        </Section>
      )}

      <Provenance>
        AI-assisted estimate from the ingredient list. It does not include packaging, sourcing or manufacturing data.
      </Provenance>
    </div>
  );
}

// ── Health notes ───────────────────────────────────────────────────────────
export function HealthView({ data, isFood }) {
  const toneMap = { Excellent: 'good', Good: 'ok', Fair: 'warn', Poor: 'bad' };
  const tone = toneMap[data.rating] || 'neutral';
  return (
    <div className="space-y-4">
      <Hero
        tone={tone}
        tile={<HeartPulse className="h-8 w-8" />}
        eyebrow={isFood ? 'Health & nutrition' : 'Health considerations'}
        title={data.rating ? `${data.rating}` : 'Not rated'}
        summary={data.summary}
      />

      {data.warnings.length > 0 && (
        <Section title="Watch out for" icon={AlertTriangle}>
          <ul className="divide-y divide-slate-100">
            {data.warnings.map((w, i) => (
              <li key={i} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{w.warning}</p>
                  {str(w.affected_groups) && <p className="mt-0.5 text-xs text-slate-500">Most relevant for: {w.affected_groups}</p>}
                </div>
                <SeverityPill severity={w.severity} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.diets.length > 0 && (
        <Section title={isFood ? 'Dietary suitability' : 'Suitability'} icon={Salad}>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.diets.map((d, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-xl border p-3 ${d.suitable ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                {d.suitable ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />}
                <div>
                  <p className={`text-xs font-semibold ${d.suitable ? 'text-emerald-900' : 'text-red-900'}`}>{d.diet}</p>
                  {str(d.reason) && <p className={`text-xs ${d.suitable ? 'text-emerald-700' : 'text-red-700'}`}>{d.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.highlights.length > 0 && (
        <Section title={isFood ? 'Nutritional highlights' : 'Highlights'} icon={Sparkles}>
          <BulletList items={data.highlights} icon={CheckCircle} iconClass="text-[#02988C]" />
        </Section>
      )}

      {data.alternatives.length > 0 && (
        <Section title="Gentler alternatives" icon={Leaf}>
          <ul className="space-y-2">
            {data.alternatives.map((a, i) => (
              <li key={i} className="text-sm text-slate-700">
                <span className="font-semibold text-slate-800">{a.name}</span>
                {str(a.benefit) && <span className="text-slate-600"> — {a.benefit}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.tips.length > 0 && (
        <Section title={isFood ? 'Tips' : 'How to use it well'} icon={Lightbulb}>
          <BulletList items={data.tips} icon={CheckCircle} iconClass="text-[#02988C]" />
        </Section>
      )}

      <Provenance>
        General information generated from the ingredient list, not medical advice. If you have a condition or reaction,
        check with a doctor, dermatologist or pharmacist.
      </Provenance>
    </div>
  );
}
