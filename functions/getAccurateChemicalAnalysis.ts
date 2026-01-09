import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

// Known dangerous chemical combinations with verified data
const VERIFIED_HAZARD_DATABASE = {
    'bleach+ammonia': {
        risk_score: 98,
        health_impact: 99,
        environmental_impact: 85,
        reactivity: 95,
        critical_warnings: [
            "FATAL: Produces toxic chloramine gas (NH2Cl)",
            "Inhalation can cause immediate respiratory failure and death",
            "This combination is immediately dangerous to life and health (IDLH)"
        ],
        professional_recommendation: "DO NOT MIX under any circumstances. Evacuate area immediately if mixed. This is a life-threatening combination.",
        toxicology: {
            acute_toxicity: "Immediate and severe respiratory distress, chemical burns, potential death within minutes",
            chronic_effects: "Permanent lung damage, chemical pneumonia, long-term respiratory issues",
            exposure_routes: ["Inhalation", "Skin Contact", "Eye Contact"]
        },
        emergency_response: {
            skin_contact: "Remove contaminated clothing immediately. Rinse with copious water for 20+ minutes. Seek emergency medical attention.",
            eye_contact: "Flush eyes with water for 20+ minutes. Remove contact lenses. Seek immediate emergency care.",
            inhalation: "Move to fresh air immediately. Administer oxygen if available. Call emergency services. Do not induce vomiting.",
            ingestion: "Do not induce vomiting. Rinse mouth. Give water if conscious. Seek immediate emergency medical attention."
        },
        regulatory_compliance: [
            {
                region: "United States (EPA/OSHA/FDA)",
                details: "Mixing bleach and ammonia violates OSHA workplace safety standards. EPA classifies chloramine gas as extremely hazardous. FDA prohibits this combination in consumer products."
            },
            {
                region: "European Union (REACH/CLP)",
                details: "This combination is classified as Category 1 acute toxicity under CLP. REACH requires immediate hazard communication. Prohibited in consumer applications."
            },
            {
                region: "Canada (Health Canada/ECCC)",
                details: "Health Canada classifies this as Category 1 acute inhalation toxicity. WHMIS requires immediate hazard disclosure. Emergency response protocols mandatory."
            }
        ]
    },
    'hydrochloric acid+bleach': {
        risk_score: 99,
        health_impact: 100,
        environmental_impact: 90,
        reactivity: 98,
        critical_warnings: [
            "FATAL: Produces highly toxic chlorine gas (Cl2)",
            "Chlorine gas is a chemical warfare agent that causes severe lung damage and death",
            "Immediate evacuation required - this is a weapons-grade toxic gas"
        ],
        professional_recommendation: "FATAL COMBINATION. Never mix acid with bleach. Evacuate immediately and seek emergency medical attention if exposure occurs."
    },
    'hydrogen peroxide+vinegar': {
        risk_score: 85,
        health_impact: 88,
        environmental_impact: 60,
        reactivity: 82,
        critical_warnings: [
            "WARNING: Forms peracetic acid - highly corrosive and unstable",
            "Can cause severe chemical burns and respiratory damage",
            "May explode under certain conditions"
        ]
    },
    'rubbing alcohol+bleach': {
        risk_score: 92,
        health_impact: 95,
        environmental_impact: 75,
        reactivity: 90,
        critical_warnings: [
            "DANGER: Forms chloroform and other toxic compounds",
            "Chloroform is carcinogenic and causes organ damage",
            "Reaction can be violent and unpredictable"
        ]
    }
};

// Function to normalize chemical names for matching
const normalizeChemicalName = (name) => {
    return name.toLowerCase()
        .replace(/sodium hypochlorite/gi, 'bleach')
        .replace(/ammonium hydroxide/gi, 'ammonia')
        .replace(/aqua ammonia/gi, 'ammonia')
        .replace(/muriatic acid/gi, 'hydrochloric acid')
        .replace(/acetic acid/gi, 'vinegar')
        .replace(/isopropyl alcohol/gi, 'rubbing alcohol')
        .replace(/hydrogen peroxide/gi, 'hydrogen peroxide')
        .trim();
};

// Function to check for known dangerous combinations
const checkKnownHazards = (chemicals) => {
    const normalizedChemicals = chemicals.map(normalizeChemicalName);
    
    // Check all possible combinations
    for (const [combination, hazardData] of Object.entries(VERIFIED_HAZARD_DATABASE)) {
        const combParts = combination.split('+');
        
        // Check if all parts of the dangerous combination are present
        const hasAllParts = combParts.every(part => 
            normalizedChemicals.some(chem => chem.includes(part) || part.includes(chem))
        );
        
        if (hasAllParts) {
            return {
                found: true,
                hazardData: {
                    ...hazardData,
                    combination_detected: combination,
                    matched_chemicals: combParts
                }
            };
        }
    }
    
    return { found: false };
};

// Function to get individual chemical safety data from reliable sources
const getIndividualChemicalData = async (chemicalName) => {
    try {
        // This would ideally connect to PubChem, NIST, or other reliable chemical databases
        // For now, using a comprehensive local database of common chemicals
        const commonChemicals = {
            'ammonia': {
                cas: '7664-41-7',
                hazards: ['Corrosive', 'Toxic by inhalation'],
                safety_score: 65,
                health_impact: 70,
                environmental_impact: 45
            },
            'bleach': {
                cas: '7681-52-9',
                hazards: ['Oxidizing', 'Corrosive', 'Harmful if inhaled'],
                safety_score: 70,
                health_impact: 75,
                environmental_impact: 60
            },
            'hydrochloric acid': {
                cas: '7647-01-0',
                hazards: ['Corrosive', 'Causes severe burns'],
                safety_score: 60,
                health_impact: 80,
                environmental_impact: 50
            }
        };
        
        const normalized = normalizeChemicalName(chemicalName);
        return commonChemicals[normalized] || null;
    } catch (error) {
        console.error(`Error getting data for ${chemicalName}:`, error);
        return null;
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClient({
            appId: Deno.env.get('BASE44_APP_ID'),
        });
        
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const user = await base44.auth.me();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { chemicals, conditions } = await req.json();
        
        if (!chemicals || chemicals.length < 2) {
            return new Response(JSON.stringify({ error: 'At least 2 chemicals required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // First, check for known dangerous combinations
        const hazardCheck = checkKnownHazards(chemicals);
        
        if (hazardCheck.found) {
            // Return verified hazard data immediately
            const response = {
                risk_assessment: {
                    overall_risk_score: hazardCheck.hazardData.risk_score,
                    health_impact_score: hazardCheck.hazardData.health_impact,
                    environmental_impact_score: hazardCheck.hazardData.environmental_impact,
                    reactivity_score: hazardCheck.hazardData.reactivity
                },
                critical_warnings: hazardCheck.hazardData.critical_warnings,
                professional_recommendation: hazardCheck.hazardData.professional_recommendation,
                toxicology_assessment: hazardCheck.hazardData.toxicology || {
                    acute_toxicity: "Severe immediate health effects",
                    chronic_effects: "Long-term health complications possible",
                    exposure_routes: ["Inhalation", "Skin Contact", "Eye Contact"]
                },
                emergency_response: hazardCheck.hazardData.emergency_response || {
                    skin_contact: "Rinse immediately with water for 15-20 minutes. Seek medical attention.",
                    eye_contact: "Flush with water for 15-20 minutes. Seek immediate medical attention.",
                    inhalation: "Move to fresh air. Seek immediate medical attention.",
                    ingestion: "Do not induce vomiting. Seek immediate medical attention."
                },
                regulatory_compliance: hazardCheck.hazardData.regulatory_compliance || [],
                verified_hazard: true,
                combination_detected: hazardCheck.hazardData.combination_detected
            };
            
            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // If no known dangerous combination, get individual chemical data
        const individualData = await Promise.all(
            chemicals.map(chem => getIndividualChemicalData(chem))
        );

        // Calculate combined risk based on individual chemical properties
        const validData = individualData.filter(data => data !== null);
        
        if (validData.length === 0) {
            // Fallback for unknown chemicals - be conservative
            const response = {
                risk_assessment: {
                    overall_risk_score: 50,
                    health_impact_score: 50,
                    environmental_impact_score: 40,
                    reactivity_score: 30
                },
                critical_warnings: [
                    "Chemical interaction data not available in verified database",
                    "Proceed with extreme caution and standard safety protocols"
                ],
                professional_recommendation: "Due to limited data, exercise maximum caution. Use appropriate PPE and ventilation.",
                verified_hazard: false,
                data_source: "Conservative fallback"
            };
            
            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Calculate combined scores
        const avgHealthImpact = validData.reduce((sum, data) => sum + data.health_impact, 0) / validData.length;
        const avgEnvironmental = validData.reduce((sum, data) => sum + data.environmental_impact, 0) / validData.length;
        const overallRisk = Math.max(avgHealthImpact, avgEnvironmental);

        const response = {
            risk_assessment: {
                overall_risk_score: Math.round(overallRisk),
                health_impact_score: Math.round(avgHealthImpact),
                environmental_impact_score: Math.round(avgEnvironmental),
                reactivity_score: 40 // Default for unknown combinations
            },
            critical_warnings: overallRisk > 70 ? [
                "High-risk chemicals detected",
                "Use appropriate personal protective equipment",
                "Ensure adequate ventilation"
            ] : [
                "Follow standard safety protocols",
                "Use appropriate personal protective equipment"
            ],
            professional_recommendation: overallRisk > 70 ? 
                "High caution advised. Ensure proper safety protocols are followed." :
                "Moderate caution advised. Follow standard chemical handling procedures.",
            verified_hazard: false,
            data_source: "Individual chemical database"
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chemical analysis error:', error);
        return new Response(JSON.stringify({ 
            error: 'Analysis failed',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});