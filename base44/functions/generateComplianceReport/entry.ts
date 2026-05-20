import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@2.5.1';

// Regulatory databases per persona
const PERSONA_REGULATIONS = {
  manufacturer:  ['REACH', 'GHS/SDS', 'EPA TSCA', 'OSHA HazCom', 'EU CLP'],
  engineer:      ['REACH', 'EPA TSCA', 'OSHA PEL', 'NFPA 704', 'ISO 11014'],
  petroleum:     ['EPA Clean Air Act', 'OSHA PSM', 'DOT HazMat', 'API RP 505', 'NFPA 30'],
  textile:       ['REACH SVHC', 'ZDHC MRSL', 'OEKO-TEX Standard 100', 'EU Textile Regulation', 'EPA Dye Discharge'],
  automotive:    ['REACH ELV', 'RoHS', 'EU IMDS', 'EPA VOC limits', 'SAE J1703'],
  logistics:     ['DOT 49 CFR', 'IATA DGR', 'IMDG Code', 'UN GHS', 'ADR/RID'],
  mining:        ['EPA Clean Water Act', 'MSHA CFR 30', 'UN GHS', 'State Mining Regs', 'RCRA Hazardous Waste'],
  pharma:        ['FDA 21 CFR', 'ICH Q3D', 'EU Annex II/III', 'USP/NF', 'WHO GMP'],
  doctor:        ['FDA Drug Interactions', 'DEA Schedule', 'JCAHO Standards', 'State Pharmacy Laws'],
  nutrition:     ['FDA GRAS', 'EU Food Additives E-numbers', 'Codex Alimentarius', 'FDA 21 CFR 170', 'EFSA Opinion'],
  fitness:       ['FDA DSHEA', 'WADA Prohibited List', 'NSF Certified for Sport', 'FTC Advertising Rules'],
  nurse:         ['FDA MedWatch', 'USP 797/800 (Sterile Compounding)', 'OSHA Bloodborne Pathogen', 'State BON Standards'],
  vet:           ['FDA CVM', 'EPA Pesticide Registration', 'USDA APHIS', 'AVMA Guidelines'],
  eco:           ['EU Green Deal', 'ISO 14040 LCA', 'EPA Safer Choice', 'ECHA PBT Assessment', 'GHG Protocol'],
  water:         ['EPA Safe Drinking Water Act', 'EU WFD', 'WHO Drinking Water Guidelines', 'NSF/ANSI 60/61'],
  forestry:      ['EPA FIFRA', 'EU Plant Protection Regulation', 'FAO Pesticide Code', 'USDA NOP Organic'],
  marine:        ['MARPOL Convention', 'EPA Ocean Dumping', 'CWA Section 404', 'IMO Ballast Water'],
  air:           ['EPA Clean Air Act', 'NIOSH REL', 'ACGIH TLV', 'EU Air Quality Directive', 'OSHA PEL'],
  recycling:     ['EU WEEE Directive', 'RoHS', 'Basel Convention', 'EPA RCRA', 'EU Battery Directive'],
  household:     ['EPA Safer Choice', 'CPSC Regulations', 'ASTM Safety Standards', 'California Prop 65', 'EU Consumer Safety'],
  parent:        ['CPSC 16 CFR', 'EU REACH Child Safety', 'FDA Cosmetics Safety', 'California Prop 65', 'EN 71 Toy Safety'],
  diy:           ['OSHA Hazard Communication', 'EPA Safer Choice', 'ANSI Safety Labels', 'California Prop 65', 'NFPA Flammability'],
  chef:          ['FDA Food Safety Modernization Act', 'EU Food Additives (EC 1333/2008)', 'Codex Alimentarius', 'HACCP Guidelines'],
  traveler:      ['IATA DGR Carry-on', 'EU Cosmetics Regulation', 'TSA Liquids Rule', 'WHO IHR'],
  business:      ['EU Cosmetics Regulation 1223/2009', 'FDA Cosmetics Guidance', 'REACH', 'ISO 22716 GMP', 'INCI Labeling'],
  cosmetic:      ['EU Cosmetics Regulation 1223/2009', 'FDA 21 CFR 700-740', 'REACH SVHC', 'ISO 22716 GMP', 'INCI Nomenclature'],
  safety:        ['OSHA 29 CFR 1910', 'GHS/SDS', 'NFPA 704', 'ISO 45001', 'EPA RMP'],
  regulatory:    ['REACH Registration', 'EU CLP', 'FDA Cosmetics Guidance', 'EPA TSCA', 'ICH Guidelines'],
  consultant:    ['REACH', 'GHS', 'EPA TSCA', 'ISO 9001', 'Global Compliance Frameworks'],
  lab:           ['OSHA Laboratory Standard 29 CFR 1910.1450', 'NFPA 45', 'ISO 17025', 'GLP (21 CFR 58)', 'ANSI Z358.1'],
  student:       ['GHS Safety Labels', 'OSHA Lab Safety', 'ACS Safety Guidelines', 'School Chemical Safety Policies'],
  teacher:       ['OSHA Laboratory Standard', 'ACS Safety Guidelines', 'NSTA Safety Standards', 'School District Policies'],
  professor:     ['OSHA 29 CFR 1910.1450', 'NIH Guidelines', 'IBC Biosafety', 'EPA Research Waste', 'Institutional EHS'],
  researcher:    ['OSHA 29 CFR 1910.1450', 'EPA Research Exemption', 'TSCA Section 5', 'NIH/NSF Grant Safety', 'GLP Standards'],
};

const PERSONA_LABEL = {
  manufacturer: 'Industrial Manufacturer', engineer: 'Process Engineer', petroleum: 'Petroleum Engineer',
  textile: 'Textile Chemist', automotive: 'Automotive Engineer', logistics: 'Logistics/Transport',
  mining: 'Mining Engineer', pharma: 'Pharma/Biotech', doctor: 'Physician/Clinician',
  nutrition: 'Nutritionist', fitness: 'Fitness/Wellness', nurse: 'Nurse/Pharmacist',
  vet: 'Veterinarian', eco: 'Sustainability Lead', water: 'Water Treatment',
  forestry: 'Forestry/Agriculture', marine: 'Marine Biologist', air: 'Air Quality Specialist',
  recycling: 'Recycling Specialist', household: 'Household User', parent: 'Parent/Caregiver',
  diy: 'DIY Maker', chef: 'Chef/Food Enthusiast', traveler: 'International Traveler',
  business: 'Small Business (Cosmetics)', cosmetic: 'Cosmetic Chemist', safety: 'Safety Officer',
  regulatory: 'Regulatory Affairs', consultant: 'Chemical Consultant', lab: 'Lab Technician',
  student: 'Student', teacher: 'STEM Teacher', professor: 'University Professor', researcher: 'Researcher',
};

const BANNED_SUBSTANCES = [
  'mercury', 'lead', 'arsenic', 'asbestos', 'ddt', 'pcbs', 'chloroform',
  'benzene', 'formaldehyde', 'vinyl chloride', 'hexavalent chromium', 'cadmium'
];
const RESTRICTED_SUBSTANCES = [
  'ammonia', 'hydrogen peroxide', 'sulfuric acid', 'hydrochloric acid', 'nitric acid',
  'sodium hydroxide', 'potassium hydroxide', 'acetone', 'toluene', 'methanol',
  'ethylene oxide', 'chlorine', 'hydrofluoric acid', 'phosphoric acid', 'phenol'
];
const WARNING_SUBSTANCES = [
  'bleach', 'sodium hypochlorite', 'calcium hypochlorite', 'isopropyl alcohol',
  'acetic acid', 'ethanol', 'propane', 'butane', 'naphtha', 'xylene', 'styrene'
];

function classifyChemical(name) {
  const n = name.toLowerCase();
  if (BANNED_SUBSTANCES.some(b => n.includes(b))) return 'Banned/Highly Controlled';
  if (RESTRICTED_SUBSTANCES.some(r => n.includes(r))) return 'Restricted';
  if (WARNING_SUBSTANCES.some(w => n.includes(w))) return 'Requires Warning/Labeling';
  return 'Generally Permitted';
}

function statusColor(status) {
  if (status === 'Banned/Highly Controlled') return [220, 38, 38];
  if (status === 'Restricted') return [234, 88, 12];
  if (status === 'Requires Warning/Labeling') return [202, 138, 4];
  return [22, 163, 74];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { chemicals, persona, simulationData } = body;

    if (!chemicals || chemicals.length === 0) {
      return Response.json({ error: 'chemicals array required' }, { status: 400 });
    }

    const regulations = PERSONA_REGULATIONS[persona] || PERSONA_REGULATIONS['household'];
    const personaLabel = PERSONA_LABEL[persona] || persona;
    const chemicalNames = chemicals.map(c => c.name || c.scientific_name || String(c));

    // AI-powered compliance analysis
    const aiPrompt = `You are a global regulatory compliance expert for the Suttain platform.
Perform a detailed regulatory compliance audit for a "${personaLabel}" user working with the following chemicals: ${chemicalNames.join(', ')}.

Relevant regulatory frameworks for this persona: ${regulations.join(', ')}.

For each chemical, determine:
1. Its compliance status across the listed frameworks
2. Any specific restrictions, bans, or labeling requirements
3. Required safety data sheet (SDS) classification
4. Recommended action items

Also provide:
- Overall compliance score (0-100)
- Top 3 critical compliance gaps
- 5 specific actionable recommendations tailored for a ${personaLabel}
- Any notable cross-chemical regulatory interactions (e.g., combined exposure limits)

Risk context from simulation: Risk Score ${simulationData?.risk_assessment?.overall_risk_score ?? 'N/A'}, Safety Level: ${simulationData?.safety_status?.level ?? 'N/A'}`;

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_compliance_score: { type: 'number' },
          compliance_summary: { type: 'string' },
          critical_gaps: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          chemical_findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                chemical: { type: 'string' },
                status: { type: 'string' },
                frameworks_affected: { type: 'array', items: { type: 'string' } },
                key_restriction: { type: 'string' },
                sds_class: { type: 'string' }
              }
            }
          },
          cross_chemical_notes: { type: 'string' }
        },
        required: ['overall_compliance_score', 'compliance_summary', 'critical_gaps', 'recommendations', 'chemical_findings']
      }
    });

    // Build PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14;
    let y = 0;

    const addPage = () => { doc.addPage(); y = 20; };
    const checkPageBreak = (needed = 10) => { if (y + needed > 280) addPage(); };

    // ── Header ──────────────────────────────────────────────────────────────────
    doc.setFillColor(2, 152, 140);
    doc.rect(0, 0, W, 38, 'F');
    doc.setFillColor(9, 210, 255);
    doc.rect(0, 35, W, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REGULATORY COMPLIANCE AUDIT REPORT', M, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Suttain Platform  |  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, M, 22);
    doc.text(`Persona: ${personaLabel}`, M, 29);

    // Compliance score badge
    const score = aiResult?.overall_compliance_score ?? 70;
    const scoreColor = score >= 80 ? [22, 163, 74] : score >= 60 ? [202, 138, 4] : [220, 38, 38];
    doc.setFillColor(...scoreColor);
    doc.roundedRect(W - 42, 8, 30, 22, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}`, W - 35, 19, { align: 'left' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('/100', W - 26, 19);
    doc.text('SCORE', W - 35, 26);

    y = 46;

    // ── Chemicals Scanned ─────────────────────────────────────────────────────
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Chemicals Audited', M, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    chemicalNames.forEach((name, i) => {
      checkPageBreak(7);
      const status = classifyChemical(name);
      const [r, g, b] = statusColor(status);
      doc.setFillColor(r, g, b);
      doc.roundedRect(M, y - 4, 4, 4, 1, 1, 'F');
      doc.setTextColor(30, 41, 59);
      doc.text(`${name}`, M + 6, y);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.text(status, M + 80, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      y += 7;
    });

    y += 4;

    // ── Regulatory Frameworks ─────────────────────────────────────────────────
    checkPageBreak(30);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(M, y, W - M * 2, 7, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Applicable Regulatory Frameworks', M + 3, y + 5);
    y += 12;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const regsPerRow = 2;
    for (let i = 0; i < regulations.length; i += regsPerRow) {
      checkPageBreak(6);
      const row = regulations.slice(i, i + regsPerRow);
      row.forEach((reg, j) => {
        doc.setFillColor(232, 253, 245);
        doc.roundedRect(M + j * 92, y - 4, 88, 6, 1.5, 1.5, 'F');
        doc.setTextColor(2, 120, 110);
        doc.text(`• ${reg}`, M + 3 + j * 92, y);
      });
      y += 8;
    }
    y += 4;

    // ── AI Compliance Summary ─────────────────────────────────────────────────
    checkPageBreak(20);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(M, y, W - M * 2, 7, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Summary', M + 3, y + 5);
    y += 12;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(aiResult?.compliance_summary || 'No summary available.', W - M * 2 - 4);
    summaryLines.forEach(line => {
      checkPageBreak(6);
      doc.text(line, M + 2, y);
      y += 5.5;
    });
    y += 5;

    // ── Chemical Findings Table ───────────────────────────────────────────────
    checkPageBreak(30);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(M, y, W - M * 2, 7, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Per-Chemical Regulatory Findings', M + 3, y + 5);
    y += 12;

    const findings = aiResult?.chemical_findings || [];
    findings.forEach((f, idx) => {
      checkPageBreak(24);
      // Row header
      doc.setFillColor(idx % 2 === 0 ? 248 : 240, 250, 252);
      doc.rect(M, y - 4, W - M * 2, 20, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(f.chemical || chemicalNames[idx] || `Chemical ${idx + 1}`, M + 2, y);
      const fStatus = f.status || classifyChemical(f.chemical || '');
      const [fr, fg, fb] = statusColor(fStatus);
      doc.setTextColor(fr, fg, fb);
      doc.text(fStatus, M + 80, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      if (f.sds_class) { doc.text(`SDS Class: ${f.sds_class}`, M + 2, y); }
      y += 4;
      if (f.key_restriction) {
        const lines = doc.splitTextToSize(`Restriction: ${f.key_restriction}`, W - M * 2 - 6);
        lines.forEach(l => { checkPageBreak(5); doc.text(l, M + 2, y); y += 4.5; });
      }
      if (f.frameworks_affected?.length > 0) {
        doc.setTextColor(100, 116, 139);
        doc.text(`Frameworks: ${f.frameworks_affected.join(', ')}`, M + 2, y);
        y += 5;
      }
      y += 2;
    });

    y += 5;

    // ── Critical Gaps ─────────────────────────────────────────────────────────
    checkPageBreak(30);
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(M, y, W - M * 2, 7, 2, 2, 'F');
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(M, y, 4, 7, 0, 0, 'F');
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Critical Compliance Gaps', M + 7, y + 5);
    y += 12;

    const gaps = aiResult?.critical_gaps || [];
    gaps.forEach((gap, i) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${i + 1}. ${gap}`, W - M * 2 - 6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(153, 27, 27);
      lines.forEach(l => { doc.text(l, M + 2, y); y += 5; });
      y += 1;
    });

    y += 5;

    // ── Recommendations ───────────────────────────────────────────────────────
    checkPageBreak(30);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(M, y, W - M * 2, 7, 2, 2, 'F');
    doc.setFillColor(22, 163, 74);
    doc.roundedRect(M, y, 4, 7, 0, 0, 'F');
    doc.setTextColor(20, 83, 45);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recommendations for ${personaLabel}`, M + 7, y + 5);
    y += 12;

    const recs = aiResult?.recommendations || [];
    recs.forEach((rec, i) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, W - M * 2 - 6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 83, 45);
      lines.forEach(l => { doc.text(l, M + 2, y); y += 5; });
      y += 1;
    });

    // ── Cross-Chemical Notes ──────────────────────────────────────────────────
    if (aiResult?.cross_chemical_notes) {
      y += 4;
      checkPageBreak(20);
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(M, y, W - M * 2, 7, 2, 2, 'F');
      doc.setFillColor(202, 138, 4);
      doc.roundedRect(M, y, 4, 7, 0, 0, 'F');
      doc.setTextColor(120, 53, 15);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Cross-Chemical Regulatory Interactions', M + 7, y + 5);
      y += 12;
      const noteLines = doc.splitTextToSize(aiResult.cross_chemical_notes, W - M * 2 - 4);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 53, 15);
      noteLines.forEach(l => { checkPageBreak(5); doc.text(l, M + 2, y); y += 5; });
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 286, W, 11, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated by Suttain  |  suttain.com  |  For informational purposes only. Consult qualified regulatory counsel.', M, 293);
      doc.text(`Page ${p} / ${totalPages}`, W - M, 293, { align: 'right' });
    }

    const pdfBytes = doc.output('arraybuffer');
    console.log(`Compliance report generated: ${chemicalNames.length} chemicals, persona=${persona}, score=${score}`);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="suttain-compliance-audit-${Date.now()}.pdf"`
      }
    });

  } catch (error) {
    console.error('generateComplianceReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});