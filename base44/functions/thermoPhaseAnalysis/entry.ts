import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Thermodynamic / Phase Diagram Analysis ──────────────────────────
// Uses LLM to generate realistic thermodynamic properties and phase
// diagram data for a given system, then returns structured data for
// frontend visualization (Recharts).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      compound,
      system,
      analysis_type,
      temperature_range,
      pressure_range,
      environmental_params,
    } = body;

    const target = compound || system;
    if (!target) return Response.json({ error: 'Compound or system is required' }, { status: 400 });

    const analysisType = analysis_type || 'phase_diagram';
    const tRange = temperature_range || { min: 100, max: 800, steps: 20 };
    const pRange = pressure_range || { min: 0.01, max: 100, steps: 10 };
    const env = environmental_params || {};

    // Build LLM prompt for thermodynamic data generation
    const prompt = `You are a thermodynamics and materials science expert. Generate realistic thermodynamic data and phase diagram information for: ${target}

Analysis type: ${analysisType}
Temperature range: ${tRange.min} to ${tRange.max} K (${tRange.steps} points)
Pressure range: ${pRange.min} to ${pRange.max} bar (${pRange.steps} points)
Environmental conditions: solvent=${env.solvent || 'none'}, temperature=${env.temperature || 298}K, pressure=${env.pressure || 1} bar

Generate scientifically plausible data. Return JSON with:

1. thermodynamic_properties: object with:
   - heat_capacity_cp: value in J/(mol·K) at 298K
   - entropy_s298: value in J/(mol·K)
   - enthalpy_formation: value in kJ/mol
   - gibbs_formation: value in kJ/mol
   - melting_point: value in K
   - boiling_point: value in K
   - critical_temperature: value in K
   - critical_pressure: value in bar
   - thermal_expansion: value in 1/K
   - compressibility: value in 1/bar

2. heat_capacity_curve: array of {temperature, cp} objects spanning the temperature range (at least 15 points), showing how heat capacity varies with temperature. Include phase transitions as discontinuities.

3. gibbs_energy_curve: array of {temperature, gibbs_energy, phase} objects showing Gibbs free energy vs temperature for each stable phase. Phase should be "solid", "liquid", or "gas".

4. phase_diagram_data: object with:
   - pt_points: array of {temperature, pressure, phase} objects defining phase boundaries (at least 20 points)
   - triple_point: {temperature, pressure}
   - critical_point: {temperature, pressure}
   - stable_regions: array of {phase, t_min, t_max, p_min, p_max}

5. phase_transitions: array of {transition, temperature, enthalpy, entropy} objects for each phase transition (melting, vaporization, sublimation, etc.)

6. interpretation: 3-4 sentence plain-language summary of the thermodynamic behavior and phase stability.

7. method_note: brief note on the estimation method (e.g., "Estimated using group contribution methods and known experimental correlations").

Make all numerical values realistic and scientifically defensible for the given compound/system.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          thermodynamic_properties: {
            type: "object",
            properties: {
              heat_capacity_cp: { type: "number" },
              entropy_s298: { type: "number" },
              enthalpy_formation: { type: "number" },
              gibbs_formation: { type: "number" },
              melting_point: { type: "number" },
              boiling_point: { type: "number" },
              critical_temperature: { type: "number" },
              critical_pressure: { type: "number" },
              thermal_expansion: { type: "number" },
              compressibility: { type: "number" }
            }
          },
          heat_capacity_curve: {
            type: "array",
            items: {
              type: "object",
              properties: {
                temperature: { type: "number" },
                cp: { type: "number" }
              }
            }
          },
          gibbs_energy_curve: {
            type: "array",
            items: {
              type: "object",
              properties: {
                temperature: { type: "number" },
                gibbs_energy: { type: "number" },
                phase: { type: "string" }
              }
            }
          },
          phase_diagram_data: {
            type: "object",
            properties: {
              pt_points: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    temperature: { type: "number" },
                    pressure: { type: "number" },
                    phase: { type: "string" }
                  }
                }
              },
              triple_point: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  pressure: { type: "number" }
                }
              },
              critical_point: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  pressure: { type: "number" }
                }
              },
              stable_regions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    t_min: { type: "number" },
                    t_max: { type: "number" },
                    p_min: { type: "number" },
                    p_max: { type: "number" }
                  }
                }
              }
            }
          },
          phase_transitions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                transition: { type: "string" },
                temperature: { type: "number" },
                enthalpy: { type: "number" },
                entropy: { type: "number" }
              }
            }
          },
          interpretation: { type: "string" },
          method_note: { type: "string" }
        }
      }
    });

    return Response.json({
      ...response,
      compound: target,
      analysis_type: analysisType,
      temperature_range: tRange,
      pressure_range: pRange,
    });
  } catch (error) {
    console.error('thermoPhaseAnalysis error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});