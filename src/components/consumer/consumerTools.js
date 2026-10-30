import { QrCode, TestTube, FileText, FlaskConical, Leaf } from 'lucide-react';

// One record per consumer & brand tool. `handoffs` lists the real in-app hand-offs between tools
// (each is implemented in the tool's code), so the portal never describes a connection that does not exist.
export const CONSUMER_TOOLS = [
  {
    id: 'scanner', step: '01', verb: 'Scan', name: 'Product Scanner', route: '/BarcodeScanner', icon: QrCode,
    question: "What's inside this product?",
    summary: 'Scan or type a barcode to identify a product and rate every listed ingredient for safety and environmental impact.',
    inputs: ['Barcode (UPC / EAN)', 'Live camera scan', 'Photo of a barcode'],
    outputs: ['Overall, safety and eco scores', 'Ingredient-by-ingredient ratings', 'Compliance and health notes'],
    sources: ['openbeautyfacts', 'openfoodfacts', 'openfda', 'pubchem'],
    handoffs: [{ to: 'generator', label: 'Send the ingredient list to the Formula Generator to build a cleaner version' }],
  },
  {
    id: 'analysis', step: '02', verb: 'Check', name: 'Chemical Analysis', route: '/Simulator', icon: TestTube,
    question: 'Is it safe to combine these?',
    summary: 'Test how two or more chemicals or products interact, with a risk score, the likely products and plain-language guidance.',
    inputs: ['Chemical or product names', 'Quick-add household products', 'Optional reaction conditions'],
    outputs: ['Risk score and verdict', 'Reaction and products formed', 'Health, environment and reactivity breakdown', 'Safer alternatives'],
    sources: ['pubchem', 'comptox', 'tri', 'nist', 'chebi'],
    handoffs: [
      { to: 'analysis', label: 'Re-run the analysis with a safer alternative' },
      { to: 'generator', label: 'Start a formula from a safer alternative' },
    ],
  },
  {
    id: 'sds', step: '03', verb: 'Decode', name: 'SDS Analyzer', route: '/SDSAnalyzer', icon: FileText,
    question: 'What does this safety data sheet mean?',
    summary: 'Search a chemical or upload a safety data sheet to extract GHS hazard classes, components and safer alternatives.',
    inputs: ['Chemical name or CAS number', 'SDS file (PDF or image)'],
    outputs: ['Hazard score', 'GHS hazard classes', 'Components', 'Safer alternatives'],
    sources: ['pubchem'],
    handoffs: [
      { to: 'analysis', label: 'Send the SDS components to Chemical Analysis' },
      { to: 'generator', label: 'Generate a safer formula from the SDS' },
    ],
  },
  {
    id: 'generator', step: '04', verb: 'Build', name: 'Formula Generator', route: '/generator', icon: FlaskConical,
    question: 'How do I make a safer version?',
    summary: 'Generate skincare, soap and cleaning formulas, then edit ingredients, scale batches and check safety, compliance, impact and cost.',
    inputs: ['Product type', 'Plain-language description', 'Ingredients from a scan, SDS or alternative'],
    outputs: ['Three formula options', 'Editable formula with percentages', 'Safety, compliance, impact and cost tabs', 'Batch scaling'],
    sources: ['pubchem'],
    handoffs: [{ to: 'carbon', label: 'Import a saved formula into the Carbon Ledger' }],
  },
  {
    id: 'carbon', step: '05', verb: 'Score', name: 'Carbon Ledger', route: '/CarbonTaxSimulator', icon: Leaf,
    question: 'What is the real carbon footprint of my product?',
    summary: 'A sourced, line-by-line carbon ledger for one product: ingredients and packaging on EPA supply-chain factors, fossil vs plant carbon from each molecule, carbon-cost scenarios and the carbon rules that actually apply to you.',
    inputs: ['Formula in % w/w (or import a saved formula)', 'Ingredient and packaging prices', 'Unit size, volume and retail price'],
    outputs: ['g CO2e per unit and tonnes per year', 'Biobased vs fossil carbon', 'Carbon-cost per unit and rule check', 'Like-for-like lower-carbon swaps'],
    sources: ['US EPA supply-chain emission factors (USEEIO v1.3)', 'PubChem'],
    handoffs: [{ to: 'analysis', label: 'Check a lower-carbon swap for safety in Chemical Analysis' }, { to: 'generator', label: 'Rebuild the recipe with the new ingredient' }],
  },
];

export const toolById = id => CONSUMER_TOOLS.find(tool => tool.id === id);
