import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const ELEMENTS = new Set([
  'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 'fluorine', 'neon', 'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'argon', 'potassium', 'calcium', 'scandium', 'titanium', 'vanadium', 'chromium', 'manganese', 'iron', 'cobalt', 'nickel', 'copper', 'zinc', 'gallium', 'germanium', 'arsenic', 'selenium', 'bromine', 'krypton', 'rubidium', 'strontium', 'yttrium', 'zirconium', 'niobium', 'molybdenum', 'technetium', 'ruthenium', 'rhodium', 'palladium', 'silver', 'cadmium', 'indium', 'tin', 'antimony', 'tellurium', 'iodine', 'xenon', 'cesium', 'barium', 'lanthanum', 'cerium', 'praseodymium', 'neodymium', 'promethium', 'samarium', 'europium', 'gadolinium', 'terbium', 'dysprosium', 'holmium', 'erbium', 'thulium', 'ytterbium', 'lutetium', 'hafnium', 'tantalum', 'tungsten', 'rhenium', 'osmium', 'iridium', 'platinum', 'gold', 'mercury', 'thallium', 'lead', 'bismuth', 'polonium', 'astatine', 'radon', 'francium', 'radium', 'actinium', 'thorium', 'protactinium', 'uranium', 'neptunium', 'plutonium', 'americium', 'curium', 'berkelium', 'californium', 'einsteinium', 'fermium', 'mendelevium', 'nobelium', 'lawrencium', 'rutherfordium', 'dubnium', 'seaborgium', 'bohrium', 'hassium', 'meitnerium', 'darmstadtium', 'roentgenium', 'copernicium', 'nihonium', 'flerovium', 'moscovium', 'livermorium', 'tennessine', 'oganesson'
]);

const RADIOACTIVE_KEYWORDS = ['uranium', 'plutonium', 'radium', 'thorium', 'polonium', 'radon', 'technetium', 'promethium', 'actinium', 'americium', 'curium', 'berkelium', 'californium', 'einsteinium'];

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

function inferTypeAndCategory(term = "") {
  const t = term.toLowerCase().trim();
  if (!t) return { type: "compound", category: "unknown" };

  if (RADIOACTIVE_KEYWORDS.some(key => t.includes(key))) {
    return { type: 'radioactive', category: 'radioactive' };
  }
  
  if (/-\d+$/.test(t) && t.includes('-')) {
    const base = t.substring(0, t.lastIndexOf('-'));
    if (ELEMENTS.has(base)) {
        return { type: 'isotope', category: 'isotope' };
    }
  }

  if (/^(cis-|trans-|d-|l-|r-|s-|\(+\)|ortho-|meta-|para-)/.test(t)) {
    return { type: 'isomer', category: 'isomer' };
  }

  if (ELEMENTS.has(t)) {
    return { type: 'element', category: 'element' };
  }
  
  if (/\s(mixture|solution|alloy|blend)\b/.test(t)) {
      return { type: 'mixture', category: 'mixture' };
  }

  if (/\b(enzyme|ase)\b/.test(t)) return { type: "enzyme", category: "biochemical" };
  if (/\b(nano|fullerene|graphene|quantum dot|nanotube)\b/.test(t)) return { type: "nanomaterial", category: "advanced_material" };
  if (/\b(acid)\b/.test(t)) return { type: "acid", category: "acid" };
  if (/\b(hydroxide)\b/.test(t)) return { type: "base", category: "alkali" };
  if (/\bperoxide|hypochlorite|permanganate|chromate|nitrate|nitrite\b/.test(t)) return { type: "oxidizer", category: "oxidizer" };
  if (/ (alcohol|ol)$/.test(t)) return { type: "alcohol", category: "solvent" };
  if (/ (chloride|sulfate|nitrate|carbonate|bicarbonate)$/.test(t)) return { type: "salt", category: "ionic" };
  if (/\bgas\b/.test(t)) return { type: "gas", category: "gas" };

  return { type: "compound", category: "compound" };
}


async function getPropertiesByName(name) {
  // Try to get properties for a single term (graceful fallbacks)
  try {
    const propUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/IsomericSMILES,CanonicalSMILES,MolecularFormula,MolecularWeight,IUPACName/JSON`;
    const data = await fetchJSON(propUrl);
    const props = data?.PropertyTable?.Properties?.[0] || {};
    return {
      name: props.IUPACName || name,
      display_name: name,
      formula: props.MolecularFormula || "",
      iupac: props.IUPACName || "",
      smiles: props.CanonicalSMILES || props.IsomericSMILES || "",
      molecular_weight: props.MolecularWeight || null
    };
  } catch {
    return {
      name,
      display_name: name,
      formula: "",
      iupac: "",
      smiles: "",
      molecular_weight: null
    };
  }
}

async function getAutocompleteTerms(query, limit) {
  try {
    const autoUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=${limit}`;
    const auto = await fetchJSON(autoUrl);
    return Array.isArray(auto?.dictionary_terms?.compound)
      ? auto.dictionary_terms.compound
      : [];
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Use POST with JSON {query, limit?}'}), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { query, limit = 15 } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const terms = await getAutocompleteTerms(query.trim(), Math.min(50, Math.max(5, limit * 3)));
    const uniqueTerms = Array.from(new Set(terms)).slice(0, Math.min(limit, 20));

    const items = [];
    for (const term of uniqueTerms) {
      const base = await getPropertiesByName(term);
      const meta = inferTypeAndCategory(term);
      items.push({
        name: base.display_name || term,
        formula: base.formula,
        iupac_name: base.iupac,
        smiles: base.smiles,
        molecular_weight: base.molecular_weight,
        type: meta.type,
        category: meta.category,
        source: "pubchem"
      });
    }

    return new Response(JSON.stringify({ items, source: "pubchem", query }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ items: [], error: e?.message || "Unknown error" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});