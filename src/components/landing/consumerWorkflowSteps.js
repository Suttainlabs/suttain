export const consumerWorkflowSteps = [
  {
    title: 'Choose your task', mode: 'You initiate',
    summary: 'Start with your goal, not a particular tool.',
    action: 'Check a product, explore chemical interactions, build a formula, estimate carbon tax exposure or interpret a safety data sheet. Choose the tool that matches your question.',
    human: 'You choose the goal and the scope. Scanning is one entry point, not a required first step.',
    provenance: 'Start from the product label, chemical identities, formulation requirements, tax assumptions or original safety data sheet.',
    uncertainty: 'These tools answer different questions. A product score cannot replace a chemical interaction assessment or an SDS review.',
    output: 'A clear task and the right tool to work on it.'
  },
  {
    title: 'Add your inputs', mode: 'You configure',
    summary: 'Bring the information your chosen task needs.',
    action: 'Enter a barcode in the scanner, chemicals and conditions in the simulator, product requirements in the generator, ingredients and scenarios in the tax simulator, or a document in the SDS analyzer.',
    human: 'Check identities, quantities, intended use and any assumptions before requesting an analysis or formula.',
    provenance: 'Keep the original label, chemical details, requirements, scenario assumptions or document available for comparison.',
    uncertainty: 'Missing concentrations, unclear identities and outdated documents can change the findings. Correct incomplete inputs before proceeding.',
    output: 'Task-specific inputs ready for analysis or generation.'
  },
  {
    title: 'Review the findings', mode: 'Automated after your request · human review',
    summary: 'Inspect the explanation, not just the headline result.',
    action: 'Review ingredient findings, predicted interactions, the proposed formula, estimated tax exposure or extracted SDS hazards. Check the reasoning and any available references against your inputs.',
    human: 'Accept, revise your inputs or investigate further. Keep safety, sustainability and financial estimates distinct.',
    provenance: 'Compare the findings with the original source and retain the conditions and assumptions behind them.',
    uncertainty: 'Predictions are not laboratory results, proposed formulas need validation and tax scenarios are estimates. An SDS summary does not replace the original document.',
    output: 'Findings or a draft you can evaluate in context.'
  },
  {
    title: 'Use the outcome', mode: 'You decide',
    summary: 'Take the next step with the context intact.',
    action: 'Make a product choice, revise a chemical combination, refine a formula, compare tax scenarios or use SDS findings to inform a safety review. Save or export where the selected tool supports it.',
    human: 'You decide what happens next. Seek qualified validation before manufacturing, mixing, making compliance claims or relying on financial estimates.',
    provenance: 'Keep inputs, sources, assumptions and limitations alongside any saved or shared result.',
    uncertainty: 'Results are decision support, not a safety certification, compliance approval or guaranteed financial outcome.',
    output: 'A task-specific next step backed by reviewable context.'
  }
];