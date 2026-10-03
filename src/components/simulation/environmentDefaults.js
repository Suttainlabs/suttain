export default function environmentDefaults(engine) {
  return {
    solvent: 'water', solvent_custom: '', forcefield: '', temperature: 300,
    pressure: 1, ph: 7, ionic_strength: 0.15,
    boundary_conditions: 'periodic', box_type: 'cubic',
    thermostat: engine === 'OpenMM' ? 'langevin' : 'vrescale',
    barostat: engine === 'OpenMM' ? 'monte_carlo' : 'parrinello_rahman',
    environment_id: null,
  };
}