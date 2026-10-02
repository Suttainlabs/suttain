export const agentWorkflowSteps = [
  {
    title: 'Define the question', mode: 'You initiate', icon: 'trigger',
    summary: 'Start with a compound, a system or a calculation you want to explore.',
    action: 'Choose Atomistic Simulation for molecular calculations or Drug Design for target exploration. Select relevant source records and define the inputs and scope.',
    human: 'You choose the source record, inputs, method and scope. Nothing starts until you request it.',
    provenance: 'Database results identify their source. Keep the selected record and your input files as the starting evidence.',
    uncertainty: 'Check compound identity and missing properties before proceeding. A search match is not scientific validation.',
    output: 'A configured research question, ready for workflow preparation.'
  },
  {
    title: 'Prepare the workflow', mode: 'Automated after your request', icon: 'prepare',
    summary: 'Let Suttain assemble the analysis and engine-specific setup.',
    action: 'Atomistic Simulation prepares workflow analysis and engine-specific files. Drug Design guides target selection, screening setup, and illustrative candidate comparison.',
    human: 'You decide when to generate files or request analysis. Engine execution requires separately configured compute; preparing a script does not run a calculation.',
    provenance: 'Inspect the selected engine, method notes, conditions and forcefield alongside the generated setup.',
    uncertainty: 'Predicted values are estimates, not measured or engine-executed results. Check assumptions and file compatibility.',
    output: 'Reviewable analysis and engine-specific files, not an unattended compute job.'
  },
  {
    title: 'Review and override', mode: 'Human review', icon: 'review',
    summary: 'The researcher makes the decision, not the generated answer.',
    action: 'Inspect the approach, limitations, references and script. Change conditions or forcefield parameters and rerun preparation when the setup does not fit your question.',
    human: 'Your review is the decision gate before external execution or downstream use. This is a researcher-led check, not a formal approval workflow in the research workspace.',
    provenance: 'Compare cited sources with the method and check the original publication or database record.',
    uncertainty: 'If an output is uncertain or wrong, do not use it as evidence. Revise the inputs, rerun and obtain expert validation.',
    output: 'A setup you choose to accept, revise or stop. You remain accountable for scientific use.'
  },
  {
    title: 'Trace the output', mode: 'Recorded output · human validation', icon: 'output',
    summary: 'Keep the configuration and the reasoning in view after the run.',
    action: 'Signed-in workflow analyses can be saved with inputs, conditions, engine, outputs and a job ID. Revisit history, compare runs and download scripts or reports.',
    human: 'You verify source citations and validate the final results before sharing, publishing or making a formulation decision.',
    provenance: 'Use the saved configuration, method explanation, references and job ID to trace what was prepared and why. These records are not a certified or tamper-proof audit.',
    uncertainty: 'Exports do not turn a prediction into validated evidence. Retain limitations and independently check results.',
    output: 'A reviewable research record and files you can carry into your own compute environment.'
  }
];