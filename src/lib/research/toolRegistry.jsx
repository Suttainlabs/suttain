// Suttain Research computational method registry.
// Maps each method to an execution adapter so the Studio can launch any method
// through one consistent run-and-track flow. Each entry cites the underlying
// open-source methods by name with source links, matching Suttain's attribution pattern.

export const ADAPTER_TYPES = {
  EXTERNAL: "external", // wraps a hosted third-party API
  LOCAL: "local", // runs a lighter model on Suttain compute
  QUEUED: "queued", // heavy async job routed through the job queue
};

export const RESEARCH_TOOLS = [
  {
    id: "structure_prediction",
    label: "Protein structure prediction",
    adapter: ADAPTER_TYPES.EXTERNAL,
    function: "structurePrediction",
    methods: [
      { name: "AlphaFold", url: "https://alphafold.ebi.ac.uk", note: "Database retrieval by UniProt accession" },
      { name: "ESMFold", url: "https://esmatlas.com", note: "Sequence-based prediction via ESM Atlas" },
    ],
  },
  {
    id: "binder_design",
    label: "De novo binder and antibody design",
    adapter: ADAPTER_TYPES.QUEUED,
    function: "binderDesign",
    methods: [
      { name: "ProteinMPNN", url: "https://github.com/dauparas/ProteinMPNN", note: "Reference sequence-design method (LLM-guided approximation)" },
      { name: "RFdiffusion", url: "https://github.com/RosettaCommons/RFdiffusion", note: "Reference binder-hallucination method (LLM-guided approximation)" },
      { name: "ESMFold", url: "https://esmatlas.com", note: "Top-candidate structure prediction" },
    ],
  },
  {
    id: "docking",
    label: "Docking and binding analysis",
    adapter: ADAPTER_TYPES.QUEUED,
    function: "dockingAnalysis",
    methods: [
      { name: "AutoDock Vina", url: "https://vina.scripps.edu", note: "Reference physics-based docking engine (LLM-guided approximation)" },
      { name: "DiffDock", url: "https://github.com/gcorso/DiffDock", note: "Reference diffusion-based docking model (LLM-guided approximation)" },
    ],
  },
  {
    id: "alphafold_binding",
    label: "Chemical-protein binding analysis",
    adapter: ADAPTER_TYPES.EXTERNAL,
    function: "proteinStructureIntelligence",
    methods: [{ name: "AlphaFold", url: "https://alphafold.ebi.ac.uk", note: "Toxicology target binding screen" }],
  },
  {
    id: "xtb_quantum",
    label: "GFN2-xTB quantum calculation",
    adapter: ADAPTER_TYPES.EXTERNAL,
    function: "computeXTB",
    methods: [{ name: "GFN2-xTB", url: "https://www.chemie.uni-bonn.de/grimme/de/software/xtb", note: "Semi-empirical geometry optimization" }],
  },
];

export function getTool(id) {
  return RESEARCH_TOOLS.find((t) => t.id === id);
}

export function adapterLabel(adapter) {
  if (adapter === ADAPTER_TYPES.EXTERNAL) return "External API";
  if (adapter === ADAPTER_TYPES.LOCAL) return "In-house model";
  if (adapter === ADAPTER_TYPES.QUEUED) return "Queued job";
  return adapter;
}