export const researchWorkflowStages = [
  {
    title: 'Research trigger', mode: 'You initiate', icon: 'trigger',
    summary: 'Define the question, scope and conditions.', artifact: 'Research brief',
    action: 'Choose the tool that matches your question: Drug Design to find a target and candidates, Binding & ADME to predict affinity and drug-likeness, or Atomistic Simulation for quantum chemistry on a molecule.',
    human: 'You set the scope and decide when to request preparation.',
    provenance: 'Retain your research question and initial configuration as the starting context.',
    uncertainty: 'A clear question does not guarantee a suitable method. Check that the selected workflow fits your system.',
    output: 'A defined research task with explicit conditions.'
  },
  {
    title: 'Inputs and sources', mode: 'You select · agent uses your inputs', icon: 'sources',
    summary: 'Ground the task in molecular inputs and source records.', artifact: 'Source-backed inputs',
    action: 'Drug Design: find a target and choose library and screening settings. Binding & ADME: paste a protein sequence and ligand, or a list of SMILES (often straight from your shortlist). Atomistic Simulation: enter a molecule, method and basis set.',
    human: 'Confirm compound identity, source records, units and parameter choices.',
    provenance: 'Keep the selected database record, original files and configuration together.',
    uncertainty: 'Missing properties and ambiguous structures need investigation. A database match is not scientific validation.',
    output: 'Selected inputs and a configuration ready for preparation.'
  },
  {
    title: 'Agent preparation', mode: 'Automated after your request', icon: 'prepare',
    summary: 'Assemble the analysis and engine-specific setup.', artifact: 'Analysis and input files',
    action: 'Drug Design ranks candidates by similarity to known ligands. Binding & ADME recommends an engine for your goal and submits the job, switching engines if one is unavailable. Atomistic Simulation runs hosted quantum chemistry on Rowan or prepares input files for other engines.',
    human: 'Check the engine, model and settings before you run. Hosted runs compute real results; prepared input files still need to be run on your own compute.',
    provenance: 'Each result records the engine, model version and citation alongside the output.',
    uncertainty: 'Similarity ranks are not affinity. Machine-learning predictions are not measurements. Prepared files can need correction.',
    output: 'Reviewable analysis and files for the selected engine.'
  },
  {
    title: 'Researcher review', mode: 'Human decision checkpoint', icon: 'review',
    summary: 'Accept the setup, revise inputs or stop.', artifact: 'Reviewed setup',
    action: 'Inspect assumptions, references and generated files. If the setup is unsuitable, change the inputs and repeat preparation.',
    human: 'You decide whether to use the setup. This is researcher-led review, not an enforced approval workflow.',
    provenance: 'Check original publications and database records against the proposed method.',
    uncertainty: 'Do not use uncertain or incorrect output as evidence. Seek expert validation before downstream scientific use.',
    output: 'A setup you choose to accept, revise or discard.'
  },
  {
    title: 'Traceable output', mode: 'Saved context · human validation', icon: 'output',
    summary: 'Keep the configuration, explanation and files together.', artifact: 'Research record and exports',
    action: 'Keep a private Drug Design shortlist, saved Binding & ADME jobs and Atomistic Simulation runs and exports. Pass a promising molecule to the next tool with one click.',
    human: 'Validate final results before sharing or publishing. Run prepared files in your separately configured compute environment when needed.',
    provenance: 'Use saved configurations, references and job IDs to trace what was prepared. These are reviewable records, not certified audits.',
    uncertainty: 'An export does not validate a prediction. Keep limitations and assumptions with every result.',
    output: 'A reviewable research record and files for your next step.'
  }
];