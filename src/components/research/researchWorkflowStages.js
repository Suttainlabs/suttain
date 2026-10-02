export const researchWorkflowStages = [
  {
    title: 'Research trigger', mode: 'You initiate', icon: 'trigger',
    summary: 'Define the question, scope and conditions.', artifact: 'Research brief',
    action: 'Choose Atomistic Simulation for molecular calculations or Drug Design for target exploration. Specify the system, scientific question, and intended method.',
    human: 'You set the scope and decide when to request preparation.',
    provenance: 'Retain your research question and initial configuration as the starting context.',
    uncertainty: 'A clear question does not guarantee a suitable method. Check that the selected workflow fits your system.',
    output: 'A defined research task with explicit conditions.'
  },
  {
    title: 'Inputs and sources', mode: 'You select · agent uses your inputs', icon: 'sources',
    summary: 'Ground the task in molecular inputs and source records.', artifact: 'Source-backed inputs',
    action: 'For Atomistic Simulation, select molecular inputs, an engine, and environmental or forcefield parameters. For Drug Design, find a biological target and choose library and screening settings.',
    human: 'Confirm compound identity, source records, units and parameter choices.',
    provenance: 'Keep the selected database record, original files and configuration together.',
    uncertainty: 'Missing properties and ambiguous structures need investigation. A database match is not scientific validation.',
    output: 'Selected inputs and a configuration ready for preparation.'
  },
  {
    title: 'Agent preparation', mode: 'Automated after your request', icon: 'prepare',
    summary: 'Assemble the analysis and engine-specific setup.', artifact: 'Analysis and input files',
    action: 'Atomistic Simulation prepares analysis and engine-specific input files from your configuration. Drug Design guides screening setup and candidate exploration; its example scores are fixed illustrations, not computed results.',
    human: 'Inspect the generated setup. Preparing files does not execute an engine; compute must be configured separately.',
    provenance: 'Review engine settings, conditions, forcefield choices and method explanations alongside the output.',
    uncertainty: 'Generated files can need correction. Predicted values are estimates, not measured or engine-executed results.',
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
    action: 'Save supported Atomistic Simulation analyses and available exports. In Drug Design, retain a personal candidate shortlist and review real compute submissions separately from demonstration activity.',
    human: 'Validate final results before sharing or publishing. Run prepared files in your separately configured compute environment when needed.',
    provenance: 'Use saved configurations, references and job IDs to trace what was prepared. These are reviewable records, not certified audits.',
    uncertainty: 'An export does not validate a prediction. Keep limitations and assumptions with every result.',
    output: 'A reviewable research record and files for your next step.'
  }
];