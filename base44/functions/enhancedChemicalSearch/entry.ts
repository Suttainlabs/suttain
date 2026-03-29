import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ELEMENTS = new Set([
  'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 'fluorine', 'neon', 'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'argon', 'potassium', 'calcium', 'scandium', 'titanium', 'vanadium', 'chromium', 'manganese', 'iron', 'cobalt', 'nickel', 'copper', 'zinc', 'gallium', 'germanium', 'arsenic', 'selenium', 'bromine', 'krypton', 'rubidium', 'strontium', 'yttrium', 'zirconium', 'niobium', 'molybdenum', 'technetium', 'ruthenium', 'rhodium', 'palladium', 'silver', 'cadmium', 'indium', 'tin', 'antimony', 'tellurium', 'iodine', 'xenon', 'cesium', 'barium', 'lanthanum', 'cerium', 'praseodymium', 'neodymium', 'promethium', 'samarium', 'europium', 'gadolinium', 'terbium', 'dysprosium', 'holmium', 'erbium', 'thulium', 'ytterbium', 'lutetium', 'hafnium', 'tantalum', 'tungsten', 'rhenium', 'osmium', 'iridium', 'platinum', 'gold', 'mercury', 'thallium', 'lead', 'bismuth', 'polonium', 'astatine', 'radon', 'francium', 'radium', 'actinium', 'thorium', 'protactinium', 'uranium', 'neptunium', 'plutonium', 'americium', 'curium', 'berkelium', 'californium', 'einsteinium', 'fermium', 'mendelevium', 'nobelium', 'lawrencium'
]);

const RADIOACTIVE_KEYWORDS = ['uranium', 'plutonium', 'radium', 'thorium', 'polonium', 'radon', 'technetium', 'promethium', 'actinium', 'americium', 'curium', 'berkelium', 'californium', 'einsteinium'];

// WHO Essential Medicines (2023 list)
const WHO_ESSENTIAL_MEDICINES = new Set([
  'aspirin', 'acetylsalicylic acid', 'paracetamol', 'acetaminophen', 'ibuprofen',
  'amoxicillin', 'ampicillin', 'penicillin', 'erythromycin', 'tetracycline',
  'ciprofloxacin', 'metronidazole', 'fluconazole', 'ketoconazole',
  'chloroquine', 'artemisinin', 'quinine', 'primaquine',
  'morphine', 'codeine', 'tramadol', 'fentanyl', 'naloxone',
  'diazepam', 'lorazepam', 'phenobarbital', 'phenytoin', 'carbamazepine', 'valproic acid',
  'metformin', 'insulin', 'glibenclamide',
  'amlodipine', 'atenolol', 'bisoprolol', 'captopril', 'enalapril', 'lisinopril',
  'furosemide', 'hydrochlorothiazide', 'spironolactone',
  'digoxin', 'warfarin', 'heparin', 'atorvastatin', 'simvastatin',
  'prednisolone', 'dexamethasone', 'hydrocortisone', 'budesonide',
  'salbutamol', 'ipratropium', 'theophylline',
  'omeprazole', 'ranitidine', 'zinc sulfate', 'folic acid', 'ferrous sulfate',
  'vitamin a', 'retinol', 'levothyroxine',
  'rifampicin', 'isoniazid', 'pyrazinamide', 'ethambutol', 'streptomycin',
  'zidovudine', 'lamivudine', 'efavirenz', 'nevirapine',
  'chloramphenicol', 'gentamicin', 'kanamycin',
  'magnesium sulfate', 'oxytocin', 'ergometrine', 'mifepristone',
  'atropine', 'epinephrine', 'adrenaline', 'dopamine',
  'lidocaine', 'bupivacaine', 'ketamine', 'propofol',
  'sodium chloride', 'potassium chloride', 'glucose', 'dextrose',
  'activated charcoal', 'sodium bicarbonate',
  'aciclovir', 'ganciclovir', 'oseltamivir',
]);

function isWHOEssential(name) {
  const lower = (name || '').toLowerCase();
  return WHO_ESSENTIAL_MEDICINES.has(lower) || 
    Array.from(WHO_ESSENTIAL_MEDICINES).some(m => lower.includes(m) || m.includes(lower));
}

function inferTypeAndCategory(term = "") {
  const t = term.toLowerCase().trim();
  if (!t) return { type: "compound", category: "unknown" };
  if (RADIOACTIVE_KEYWORDS.some(key => t.includes(key))) return { type: 'radioactive', category: 'radioactive' };
  if (/-\d+$/.test(t) && t.includes('-')) {
    const base = t.substring(0, t.lastIndexOf('-'));
    if (ELEMENTS.has(base)) return { type: 'isotope', category: 'isotope' };
  }
  if (/^(cis-|trans-|d-|l-|r-|s-|\(+\)|ortho-|meta-|para-)/.test(t)) return { type: 'isomer', category: 'isomer' };
  if (ELEMENTS.has(t)) return { type: 'element', category: 'element' };
  if (/\s(mixture|solution|alloy|blend)\b/.test(t)) return { type: 'mixture', category: 'mixture' };
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

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function getPropertiesByName(name) {
  try {
    const data = await fetchJSON(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/IsomericSMILES,CanonicalSMILES,MolecularFormula,MolecularWeight,IUPACName/JSON`);
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
    return { name, display_name: name, formula: "", iupac: "", smiles: "", molecular_weight: null };
  }
}

async function searchChEMBL(query, limit) {
  try {
    const data = await fetchJSON(`https://www.ebi.ac.uk/chembl/api/data/molecule/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    const molecules = data?.molecules || [];
    return molecules
      .filter(m => m.pref_name)
      .map(m => {
        const meta = inferTypeAndCategory(m.pref_name);
        return {
          name: m.pref_name,
          formula: m.molecule_properties?.full_molformula || '',
          iupac_name: m.pref_name,
          smiles: m.molecule_structures?.canonical_smiles || '',
          molecular_weight: m.molecule_properties?.full_mwt ? parseFloat(m.molecule_properties.full_mwt) : null,
          type: meta.type,
          category: meta.category,
          source: 'chembl',
          source_db: 'ChEMBL',
          chembl_id: m.molecule_chembl_id,
          who_essential: isWHOEssential(m.pref_name),
        };
      });
  } catch (e) {
    console.error('ChEMBL search failed:', e.message);
    return [];
  }
}

async function searchChEBI(query, limit) {
  try {
    const data = await fetchJSON(`https://www.ebi.ac.uk/chebi/websrvices2/rest/search?search=${encodeURIComponent(query)}&ontologyDataOutput=false&searchCategory=ALL&stars=ALL&maximumResults=${limit}`);
    const results = data?.searchResults?.results || [];
    return results
      .filter(r => r.chebiAsciiName)
      .map(r => {
        const meta = inferTypeAndCategory(r.chebiAsciiName);
        return {
          name: r.chebiAsciiName,
          formula: r.formulae?.[0]?.data || '',
          iupac_name: r.iupacNames?.[0] || r.chebiAsciiName,
          molecular_weight: r.mass ? parseFloat(r.mass) : null,
          type: meta.type,
          category: meta.category,
          source: 'chebi',
          source_db: 'ChEBI',
          chebi_id: r.chebiId,
          who_essential: isWHOEssential(r.chebiAsciiName),
        };
      });
  } catch (e) {
    console.error('ChEBI search failed:', e.message);
    return [];
  }
}

async function getAutocompleteTerms(query, limit) {
  try {
    const auto = await fetchJSON(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=${limit}`);
    return Array.isArray(auto?.dictionary_terms?.compound) ? auto.dictionary_terms.compound : [];
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  if (!(await base44.auth.isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Use POST with JSON {query, limit?}' }, { status: 405 });
  }

  try {
    const { query, limit = 15 } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return Response.json({ items: [] });
    }

    const q = query.trim();
    const perSource = Math.min(5, Math.ceil(limit / 3));

    // Run all sources in parallel
    const [pubchemTerms, chemblItems, chebiItems] = await Promise.allSettled([
      getAutocompleteTerms(q, perSource * 3),
      searchChEMBL(q, perSource),
      searchChEBI(q, perSource),
    ]);

    // Process PubChem autocomplete results
    const terms = pubchemTerms.status === 'fulfilled'
      ? Array.from(new Set(pubchemTerms.value)).slice(0, perSource * 2)
      : [];

    const pubchemItems = [];
    for (const term of terms) {
      const base = await getPropertiesByName(term);
      const meta = inferTypeAndCategory(term);
      pubchemItems.push({
        name: base.display_name || term,
        formula: base.formula,
        iupac_name: base.iupac,
        smiles: base.smiles,
        molecular_weight: base.molecular_weight,
        type: meta.type,
        category: meta.category,
        source: 'pubchem',
        source_db: 'PubChem',
        who_essential: isWHOEssential(term),
      });
    }

    // Merge all results, deduplicate by name
    const allItems = [
      ...pubchemItems,
      ...(chemblItems.status === 'fulfilled' ? chemblItems.value : []),
      ...(chebiItems.status === 'fulfilled' ? chebiItems.value : []),
    ];

    const seen = new Set();
    const items = allItems
      .filter(item => {
        const key = (item.name || '').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);

    const sources = [...new Set(items.map(i => i.source_db).filter(Boolean))];
    console.log(`Enhanced search: ${items.length} results from ${sources.join(', ')}`);

    return Response.json({ items, source: sources.join('+'), sources, query });

  } catch (e) {
    console.error('Enhanced chemical search error:', e.message);
    return Response.json({ items: [], error: e?.message || "Unknown error" });
  }
});