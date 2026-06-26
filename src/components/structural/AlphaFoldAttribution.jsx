import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function AlphaFoldAttribution({ includeAlphaMissense = false }) {
  return (
    <div className="mt-6 pt-4 border-t border-slate-700/40 space-y-2">
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Protein structure data provided by{' '}
        <a
          href="https://alphafold.ebi.ac.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0D9E8E] hover:underline inline-flex items-center gap-0.5"
        >
          AlphaFold DB <ExternalLink className="w-2.5 h-2.5" />
        </a>
        , EMBL-EBI. Developed by Google DeepMind. Licensed CC BY 4.0.
      </p>
      {includeAlphaMissense && (
        <p className="text-[11px] text-slate-500 leading-relaxed">
          AlphaMissense Copyright 2023 DeepMind Technologies Limited.
        </p>
      )}
      <p className="text-[11px] text-slate-600 leading-relaxed italic">
        All predictions are for theoretical modelling and research purposes only. Not a substitute for professional medical or toxicological advice.
      </p>
    </div>
  );
}