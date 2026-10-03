import engineInputEndpoint from '../../shared/engineInputEndpoint.ts';
export default async function(req) { return await engineInputEndpoint('Quantum ESPRESSO')(req); }