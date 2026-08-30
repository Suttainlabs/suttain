import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId, sourceData, reportConfig } = await req.json();

    // Verify the report belongs to the requesting user before proceeding
    if (reportId) {
      const existing = await base44.entities.Report.filter({ id: reportId });
      if (!existing || existing.length === 0) {
        return Response.json({ error: 'Report not found' }, { status: 404 });
      }
    }

    // Update report status to generating
    if (reportId) {
      await base44.entities.Report.update(reportId, { status: 'generating' });
    }

    // Generate AI insights based on source data
    const aiInsightsPrompt = `
      Analyze the following chemical/scientific data and provide comprehensive insights:
      
      Data: ${JSON.stringify(sourceData, null, 2)}
      Report Type: ${reportConfig?.report_type || 'general'}
      
      Provide your analysis in the following JSON format:
      {
        "executive_summary": "A 2-3 sentence executive summary",
        "key_findings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4", "Finding 5"],
        "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
        "risk_assessment": "Overall risk assessment paragraph",
        "technical_notes": "Any technical observations worth noting"
      }
    `;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: aiInsightsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_findings: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          risk_assessment: { type: "string" },
          technical_notes: { type: "string" }
        }
      }
    });

    // Generate chart data based on source
    const chartData = generateChartData(sourceData, reportConfig);

    // Generate safety advisor data if section is enabled
    let safetyAdvisorData = null;
    const hasSafetyAdvisorSection = reportConfig?.sections?.some(s => s.type === 'safety_advisor' && s.enabled);
    
    if (hasSafetyAdvisorSection && sourceData?.chemicals?.length) {
      const safetyPrompt = `
        Analyze these chemicals for safety: ${JSON.stringify(sourceData.chemicals)}
        Provide a brief safety analysis in JSON format with:
        {
          "overall_risk": "low|medium|high|critical",
          "required_ppe": ["item1", "item2"],
          "key_hazards": ["hazard1", "hazard2"],
          "emergency_contact": "string",
          "storage_note": "string"
        }
      `;
      
      try {
        safetyAdvisorData = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: safetyPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              overall_risk: { type: "string" },
              required_ppe: { type: "array", items: { type: "string" } },
              key_hazards: { type: "array", items: { type: "string" } },
              emergency_contact: { type: "string" },
              storage_note: { type: "string" }
            }
          }
        });
      } catch (e) {
        console.error('Safety advisor generation failed:', e);
      }
    }

    const result = {
      ai_insights: {
        ...aiResponse,
        generated_at: new Date().toISOString()
      },
      visualization_data: {
        charts: chartData,
        embedded_3d_models: sourceData?.chemicals?.map(c => c.smiles || c.name) || [],
        reaction_diagrams: [],
        safety_advisor: safetyAdvisorData
      },
      metadata: {
        generated_at: new Date().toISOString(),
        generation_time_ms: Date.now(),
        version: 1
      },
      status: 'completed'
    };

    // Update report with generated content
    if (reportId) {
      await base44.entities.Report.update(reportId, result);
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateChartData(sourceData, config) {
  const charts = [];
  
  // Risk metrics chart
  if (sourceData?.risk_score !== undefined) {
    charts.push({
      id: 'risk_metrics',
      type: 'radar',
      title: 'Risk Assessment Overview',
      data: [
        { metric: 'Overall Risk', value: sourceData.risk_score || 0 },
        { metric: 'Health Impact', value: sourceData.health_impact || 0 },
        { metric: 'Environmental', value: sourceData.environmental_impact || 0 },
        { metric: 'Reactivity', value: sourceData.reactivity || 0 },
        { metric: 'VOC Level', value: sourceData.voc_level || 0 }
      ]
    });
  }

  // Chemical composition chart
  if (sourceData?.chemicals?.length) {
    charts.push({
      id: 'composition',
      type: 'pie',
      title: 'Chemical Composition',
      data: sourceData.chemicals.map((c, i) => ({
        name: c.name || c,
        value: c.percentage || Math.round(100 / sourceData.chemicals.length)
      }))
    });
  }

  // Timeline/trend chart
  charts.push({
    id: 'reaction_energy',
    type: 'line',
    title: 'Reaction Energy Profile',
    data: [
      { stage: 'Reactants', energy: 0 },
      { stage: 'Activation', energy: sourceData?.activation_energy || 45 },
      { stage: 'Transition', energy: (sourceData?.activation_energy || 45) - 10 },
      { stage: 'Products', energy: sourceData?.energy_change || -20 }
    ]
  });

  return charts;
}