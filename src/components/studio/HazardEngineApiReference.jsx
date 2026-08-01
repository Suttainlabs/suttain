import React, { useState } from 'react';
import { ShieldAlert, BarChart2, Copy, Check, FlaskConical } from 'lucide-react';

const HAZARD_CLASSIFY_CODE = `import requests

# Classify a compound's hazard profile (random forest on Tox21)
response = requests.post(
    "https://api.suttain.com/v1/hazard-classify",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "query": "bisphenol A",
        "mode": "balanced"
    }
)

data = response.json()
print(data["verdict"], data["confidence_pct"], "%")`;

const HAZARD_VALIDATION_CODE = `import requests

# Fetch held-out validation metrics and ROC curve
response = requests.post(
    "https://api.suttain.com/v1/hazard-validation",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={"mode": "balanced"}
)

data = response.json()
print("ROC-AUC:", data["headline"]["roc_auc"])`;

const CLASSIFY_PARAMS = [
  { name: 'query', type: 'string', required: true, desc: 'Compound name (resolved via PubChem) or a SMILES string.' },
  { name: 'smiles', type: 'string', required: false, desc: 'Provide a SMILES string directly, skipping the name lookup.' },
  { name: 'mode', type: 'string', required: false, desc: 'Operating mode: "balanced" (default) or "safety". Safety lowers the threshold for a cautionary verdict.' },
];

const CLASSIFY_RESPONSE = [
  { name: 'verdict', type: 'string', desc: '"Hazardous" or "Likely safe", based on the selected threshold.' },
  { name: 'hazard_probability', type: 'number', desc: 'Calibrated probability (0 to 1) that the compound is hazardous.' },
  { name: 'confidence_pct', type: 'number', desc: 'Distance of the probability from 0.5, expressed as a percentage.' },
  { name: 'operating_mode', type: 'string', desc: 'The mode used for the decision.' },
  { name: 'decision_threshold', type: 'number', desc: 'Probability threshold applied for the verdict.' },
  { name: 'descriptors_used', type: 'object', desc: 'The 15 physicochemical descriptors fed to the model.' },
  { name: 'provenance', type: 'object', desc: 'Descriptor source, model name, and training dataset.' },
  { name: 'validation_metrics', type: 'object', desc: 'Held-out metrics for the selected operating point.' },
  { name: 'honesty_note', type: 'string', desc: 'Honest statement that this is a v1 baseline, not a transformer model.' },
];

const VALIDATION_RESPONSE = [
  { name: 'model', type: 'string', desc: 'Model name and version.' },
  { name: 'dataset', type: 'string', desc: 'Training dataset (Tox21, MoleculeNet).' },
  { name: 'split', type: 'string', desc: 'Train and test split description.' },
  { name: 'test_set', type: 'object', desc: 'Held-out test set size and class counts.' },
  { name: 'headline', type: 'object', desc: 'ROC-AUC and expected calibration error (ECE).' },
  { name: 'selected_operating_point', type: 'object', desc: 'Accuracy, balanced accuracy, recall, macro F1, and false-negative rate for the chosen mode.' },
  { name: 'operating_points', type: 'object', desc: 'Both balanced and safety operating points.' },
  { name: 'roc_curve', type: 'array', desc: 'ROC curve coordinates for plotting.' },
  { name: 'calibration_curve', type: 'array', desc: 'Calibration curve coordinates for plotting.' },
  { name: 'baseline_comparison', type: 'object', desc: 'Comparison against baseline expectations.' },
  { name: 'honesty_note', type: 'string', desc: 'Honest framing of the v1 baseline and the Phase I research goal.' },
];

function CodeBlock({ code, filename }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-[#0D2B22] rounded-xl overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-amber-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2">{filename}</span>
        </div>
        <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-slate-300">{code}</pre>
    </div>
  );
}

function ParamTable({ rows }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_3fr] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Field</span>
        <span>Type</span>
        <span>Description</span>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_3fr] px-3 py-2 text-xs">
            <span className="font-mono text-slate-800 font-semibold">{row.name}</span>
            <span className="font-mono text-slate-500">{row.type}</span>
            <span className="text-slate-600">{row.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HazardEngineApiReference() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B3FA0, #C42B2B)' }}>
          <FlaskConical className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">HazardEngine API reference</h3>
          <p className="text-sm text-slate-500">Two backend functions power hazard prediction and validation. Trained on the public Tox21 benchmark, with honest baseline framing.</p>
        </div>
      </div>

      {/* hazardClassifier */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#C42B2B]" />
          <span className="text-xs font-mono font-bold text-slate-800 bg-red-50 px-2 py-1 rounded">POST /v1/hazard-classify</span>
        </div>
        <p className="text-sm text-slate-600">
          Classifies a compound as hazardous or likely safe using a random forest trained on Tox21 (7,823 compounds, binary hazard). It pulls 15 physicochemical descriptors from PubChem, runs the forest, and returns a calibrated probability with the chosen operating point's held-out metrics.
        </p>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Request parameters</div>
          <ParamTable rows={CLASSIFY_PARAMS} />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Response fields</div>
          <ParamTable rows={CLASSIFY_RESPONSE} />
        </div>
        <CodeBlock code={HAZARD_CLASSIFY_CODE} filename="hazard_classify.py" />
      </div>

      {/* hazardValidation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#6B3FA0]" />
          <span className="text-xs font-mono font-bold text-slate-800 bg-violet-50 px-2 py-1 rounded">POST /v1/hazard-validation</span>
        </div>
        <p className="text-sm text-slate-600">
          Returns the model's held-out validation metrics, ROC curve, and calibration curve. Use it to report performance honestly, plot curves, or compare operating points without re-running predictions.
        </p>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Request parameters</div>
          <ParamTable rows={[{ name: 'mode', type: 'string', required: false, desc: 'Operating mode to surface: "balanced" (default) or "safety".' }]} />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Response fields</div>
          <ParamTable rows={VALIDATION_RESPONSE} />
        </div>
        <CodeBlock code={HAZARD_VALIDATION_CODE} filename="hazard_validation.py" />
      </div>
    </div>
  );
}