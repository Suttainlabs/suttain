import React from 'react';

/**
 * Renders a chemical formula string with proper HTML subscripts.
 * e.g. "H2O" -> H<sub>2</sub>O, "C6H12O6" -> C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>
 * Also handles charge superscripts like "Ca2+" -> Ca<sup>2+</sup>
 */
export function parseChemicalFormula(formula) {
  if (!formula) return null;

  // Tokenise: runs of letters, digits, +/- at end (charges), brackets
  const tokens = [];
  let i = 0;
  while (i < formula.length) {
    // Superscript charge at very end: digits followed by +/-
    if (/[0-9]/.test(formula[i])) {
      let num = '';
      while (i < formula.length && /[0-9]/.test(formula[i])) {
        num += formula[i++];
      }
      // Check if followed by + or - (charge superscript)
      if (i < formula.length && /[+\-]/.test(formula[i])) {
        tokens.push({ type: 'sup', value: num + formula[i++] });
      } else {
        tokens.push({ type: 'sub', value: num });
      }
    } else if (/[+\-]/.test(formula[i]) && i === formula.length - 1) {
      // Lone + or - at end = charge
      tokens.push({ type: 'sup', value: formula[i++] });
    } else {
      tokens.push({ type: 'text', value: formula[i++] });
    }
  }

  return tokens;
}

export default function ChemicalFormula({ formula, className = '' }) {
  if (!formula) return null;
  const tokens = parseChemicalFormula(formula);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.type === 'sub') return <sub key={idx} style={{ fontSize: '0.75em', lineHeight: 0 }}>{token.value}</sub>;
        if (token.type === 'sup') return <sup key={idx} style={{ fontSize: '0.75em', lineHeight: 0 }}>{token.value}</sup>;
        return <span key={idx}>{token.value}</span>;
      })}
    </span>
  );
}