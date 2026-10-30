// Single source of truth for the scientific databases Suttain queries.
// Counts are verified against each provider; update `asOf` whenever a figure is refreshed.
// Only databases with a working integration in Suttain's code are listed as `integrated: true`.

export const DATA_SOURCES = [
  {
    id: 'pubchem', name: 'PubChem', org: 'NCBI / NIH',
    count: '119M+', unit: 'compounds', extra: '322M+ substances',
    detail: 'Compound identity, properties, GHS hazard classifications and safety data.',
    asOf: 'PubChem 2025 update', url: 'https://pubchem.ncbi.nlm.nih.gov',
    pillars: ['consumer', 'research'], integrated: true,
    usedBy: ['Chemical Analysis', 'SDS Analyzer', 'Formula Generator', 'Atomistic Simulation'],
  },
  {
    id: 'chembl', name: 'ChEMBL', org: 'EMBL-EBI',
    count: '2.9M+', unit: 'compounds', extra: '24.5M+ bioactivities · 18.5k targets',
    detail: 'Bioactivity, drug and molecular target data.',
    asOf: 'ChEMBL 37, May 2026', url: 'https://www.ebi.ac.uk/chembl/',
    pillars: ['research'], integrated: true,
    usedBy: ['Drug Design', 'Chemical search'],
  },
  {
    id: 'chebi', name: 'ChEBI', org: 'EMBL-EBI',
    count: null, unit: 'chemical ontology',
    detail: 'Curated dictionary of biologically relevant small molecules.',
    asOf: null, url: 'https://www.ebi.ac.uk/chebi/',
    pillars: ['consumer', 'research'], integrated: true,
    usedBy: ['Chemical search'],
  },
  {
    id: 'chemspider', name: 'ChemSpider', org: 'Royal Society of Chemistry',
    count: null, unit: 'chemical structures',
    detail: 'Structure, name and identifier cross-references.',
    asOf: null, url: 'https://www.chemspider.com',
    pillars: ['consumer', 'research'], integrated: true,
    usedBy: ['Chemical search'],
  },
  {
    id: 'pdb', name: 'RCSB PDB', org: 'Protein Data Bank',
    count: '261k+', unit: 'experimental structures', extra: null,
    detail: '3D structures of proteins and nucleic acids.',
    asOf: 'October 2026', url: 'https://www.rcsb.org',
    pillars: ['research'], integrated: true,
    usedBy: ['Drug Design', 'Atomistic Simulation'],
  },
  {
    id: 'uniprot', name: 'UniProt', org: 'UniProt Consortium',
    count: '150M+', unit: 'protein entries', extra: '575k+ reviewed (Swiss-Prot)',
    detail: 'Protein sequences and functional annotation for targets.',
    asOf: 'October 2026', url: 'https://www.uniprot.org',
    pillars: ['research'], integrated: true,
    usedBy: ['Drug Design'],
  },
  {
    id: 'alphafold', name: 'AlphaFold DB', org: 'EMBL-EBI / Google DeepMind',
    count: '200M+', unit: 'predicted structures', extra: null,
    detail: 'Predicted protein structures with per-residue confidence.',
    asOf: 'AlphaFold DB', url: 'https://alphafold.ebi.ac.uk',
    pillars: ['research'], integrated: true,
    usedBy: ['Drug Design'],
  },
  {
    id: 'openfoodfacts', name: 'Open Food Facts', org: 'Open Food Facts',
    count: '4.8M+', unit: 'products', extra: null,
    detail: 'Barcoded food products with ingredient lists.',
    asOf: 'October 2026', url: 'https://world.openfoodfacts.org',
    pillars: ['consumer'], integrated: true,
    usedBy: ['Product Scanner'],
  },
  {
    id: 'openbeautyfacts', name: 'Open Beauty Facts', org: 'Open Food Facts',
    count: '79k+', unit: 'products', extra: null,
    detail: 'Barcoded cosmetics and personal-care products with ingredient lists.',
    asOf: 'October 2026', url: 'https://world.openbeautyfacts.org',
    pillars: ['consumer'], integrated: true,
    usedBy: ['Product Scanner'],
  },
  {
    id: 'comptox', name: 'EPA CompTox', org: 'US EPA',
    count: null, unit: 'chemical identifiers (DTXSID)',
    detail: 'Resolves EPA DSSTox identifiers so results link to the CompTox Chemicals Dashboard.',
    asOf: null, url: 'https://comptox.epa.gov/dashboard',
    pillars: ['consumer', 'research'], integrated: true,
    usedBy: ['Chemical Analysis'],
  },
  {
    id: 'tri', name: 'EPA Envirofacts (TRI)', org: 'US EPA',
    count: null, unit: 'regulatory flags',
    detail: 'Toxics Release Inventory listing, carcinogen, PBT and PFAS flags.',
    asOf: null, url: 'https://www.epa.gov/enviro',
    pillars: ['consumer'], integrated: true,
    usedBy: ['Chemical Analysis'],
  },
  {
    id: 'nist', name: 'NIST Chemistry WebBook', org: 'NIST',
    count: null, unit: 'thermophysical data',
    detail: 'Boiling point, melting point and phase-change data.',
    asOf: null, url: 'https://webbook.nist.gov',
    pillars: ['consumer', 'research'], integrated: true,
    usedBy: ['Chemical Analysis'],
  },
  {
    id: 'bindingdb', name: 'BindingDB', org: 'UC San Diego',
    count: null, unit: 'measured binding affinities',
    detail: 'Measured protein–ligand binding data used as screening evidence.',
    asOf: null, url: 'https://www.bindingdb.org',
    pillars: ['research'], integrated: true,
    usedBy: ['Drug Design'],
  },
  {
    id: 'openfda', name: 'openFDA · DailyMed · RxNorm', org: 'US FDA / NLM',
    count: null, unit: 'drug labels and names',
    detail: 'Medicine labels, active ingredients and drug name normalisation.',
    asOf: null, url: 'https://open.fda.gov',
    pillars: ['consumer'], integrated: true,
    usedBy: ['Product Scanner', 'Regulatory checks'],
  },
];

export const sourceById = id => DATA_SOURCES.find(source => source.id === id);
export const sourcesFor = pillar => DATA_SOURCES.filter(source => source.pillars.includes(pillar));

// Headline figure used on the homepage and marketing copy.
export const HEADLINE = { value: '119M+', label: 'compounds in PubChem', note: 'plus 2.9M+ ChEMBL compounds and 261k+ PDB structures' };
