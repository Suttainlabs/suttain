import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Check authentication
        let user;
        try {
            user = await base44.auth.me();
        } catch (authError) {
            console.error('Auth error:', authError);
            return new Response(JSON.stringify({ error: 'Authentication failed' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse request body
        let body;
        try {
            body = await req.json();
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { simulationData, persona, customization } = body;

        if (!simulationData) {
            return new Response(JSON.stringify({ error: 'Missing simulation data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Default customization if not provided
        const options = customization || {
            sections: {
                experimentDetails: true,
                riskAssessment: true,
                safetyProtocols: true,
                experimentalConditions: true,
                reactionDetails: true,
                supervisorApproval: true
            },
            template: 'professional',
            customNotes: null,
            includeDisclaimer: true
        };

        // Create PDF based on template
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 20;

        // Helper function to check if new page is needed
        const checkNewPage = (spaceNeeded = 20) => {
            if (y + spaceNeeded > pageHeight - 20) {
                doc.addPage();
                y = 20;
                return true;
            }
            return false;
        };

        // === TITLE (based on template) ===
        doc.setFontSize(options.template === 'summary' ? 18 : 20);
        doc.setFont('helvetica', 'bold');
        const title = options.template === 'summary' 
            ? 'EXECUTIVE SUMMARY - CHEMICAL ANALYSIS'
            : options.template === 'educational'
            ? 'EDUCATIONAL LAB REPORT'
            : 'LABORATORY EXPERIMENTAL REPORT';
        doc.text(title, pageWidth / 2, y, { align: 'center' });
        y += 15;

        // === SUBTITLE ===
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        const personaTitle = persona === 'researcher' ? 'Research Laboratory Analysis' : 
                           persona === 'teacher' ? 'Educational Laboratory Analysis' : 
                           persona === 'business' ? 'Commercial Safety Assessment' :
                           'Laboratory Analysis';
        doc.text(personaTitle, pageWidth / 2, y, { align: 'center' });
        y += 10;

        // === GENERATED DATE ===
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
        y += 15;

        const chemicals = simulationData.chemicals || [];
        const risk = simulationData.risk_assessment || {};
        const safety = simulationData.safety_status || {};
        const reaction = simulationData.reaction_details || {};

        // === EXPERIMENT DETAILS ===
        if (options.sections.experimentDetails) {
            checkNewPage(40);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('EXPERIMENT DETAILS', 15, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Title: Chemical Interaction Analysis', 15, y);
            y += 7;

            const chemicalNames = chemicals.map(c => c.display_name || c.scientific_name || c.name).join(' + ');
            doc.text(`Chemicals: ${chemicalNames}`, 15, y);
            y += 7;

            doc.text(`Analyst: ${user.full_name || user.email}`, 15, y);
            y += 15;
        }

        // === RISK ASSESSMENT ===
        if (options.sections.riskAssessment) {
            checkNewPage(50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RISK ASSESSMENT', 15, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            doc.text(`Safety Level: ${safety.level || 'UNKNOWN'}`, 15, y);
            y += 7;
            doc.text(`Overall Risk Score: ${risk.overall_risk_score || 0}/100`, 15, y);
            y += 7;
            
            if (options.template !== 'summary') {
                doc.text(`Health Impact: ${risk.health_impact_score || 0}/100`, 15, y);
                y += 7;
                doc.text(`Environmental Impact: ${risk.environmental_impact_score || 0}/100`, 15, y);
                y += 7;
                doc.text(`Reactivity: ${risk.reactivity_score || 0}/100`, 15, y);
                y += 7;
            }
            
            if (risk.recommendation) {
                checkNewPage(20);
                doc.setFont('helvetica', 'bold');
                doc.text('Recommendation:', 15, y);
                y += 6;
                doc.setFont('helvetica', 'normal');
                const recLines = doc.splitTextToSize(risk.recommendation, pageWidth - 30);
                recLines.forEach(line => {
                    checkNewPage();
                    doc.text(line, 15, y);
                    y += 6;
                });
            }
            y += 10;
        }

        // === SAFETY PROTOCOLS ===
        const safetyProtocols = simulationData.safetyProtocols || {};
        if (options.sections.safetyProtocols && Object.keys(safetyProtocols).length > 0) {
            checkNewPage(50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('SAFETY PROTOCOLS', 15, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            doc.text(`Fume Hood Required: ${safetyProtocols.fumeHood ? 'YES' : 'NO'}`, 15, y);
            y += 7;
            
            if (safetyProtocols.ppe && safetyProtocols.ppe.length > 0) {
                doc.text(`PPE Required: ${safetyProtocols.ppe.join(', ')}`, 15, y);
                y += 7;
            }
            
            if (safetyProtocols.emergencyEquipment && safetyProtocols.emergencyEquipment.length > 0) {
                doc.text(`Emergency Equipment: ${safetyProtocols.emergencyEquipment.join(', ')}`, 15, y);
                y += 7;
            }
            
            doc.text(`Supervisor Approval: ${safetyProtocols.supervisorApproval ? 'APPROVED' : 'PENDING'}`, 15, y);
            y += 15;
        }

        // === EXPERIMENTAL CONDITIONS ===
        const parameterSets = simulationData.parameterSets || [];
        if (options.sections.experimentalConditions && parameterSets.length > 0) {
            checkNewPage(50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('EXPERIMENTAL CONDITIONS', 15, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            const maxSets = options.template === 'summary' ? 2 : parameterSets.length;
            parameterSets.slice(0, maxSets).forEach((params, idx) => {
                checkNewPage(25);
                doc.text(`Parameter Set ${idx + 1}:`, 15, y);
                y += 7;
                doc.text(`  Temperature: ${params.temperature || 298.15} ${params.temperatureUnit || 'kelvin'}`, 15, y);
                y += 7;
                doc.text(`  Pressure: ${params.pressure || 101.325} ${params.pressureUnit || 'kPa'}`, 15, y);
                y += 7;
                doc.text(`  Time: ${params.time || 60} minutes`, 15, y);
                y += 10;
            });
        }

        // === REACTION DETAILS ===
        if (options.sections.reactionDetails && (reaction.balanced_equation || reaction.reaction_mechanism)) {
            checkNewPage(50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('REACTION DETAILS', 15, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            if (reaction.balanced_equation) {
                doc.text('Balanced Equation:', 15, y);
                y += 7;
                const eqLines = doc.splitTextToSize(reaction.balanced_equation, pageWidth - 30);
                eqLines.forEach(line => {
                    checkNewPage();
                    doc.text(line, 15, y);
                    y += 6;
                });
                y += 5;
            }
            
            if (reaction.reaction_mechanism && options.template !== 'summary') {
                checkNewPage(30);
                const mechLines = doc.splitTextToSize(reaction.reaction_mechanism, pageWidth - 30);
                mechLines.forEach(line => {
                    checkNewPage();
                    doc.text(line, 15, y);
                    y += 6;
                });
                y += 10;
            }
        }

        // === CUSTOM NOTES ===
        if (options.customNotes) {
            checkNewPage(40);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('ADDITIONAL NOTES', 15, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const notesLines = doc.splitTextToSize(options.customNotes, pageWidth - 30);
            notesLines.forEach(line => {
                checkNewPage();
                doc.text(line, 15, y);
                y += 6;
            });
            y += 10;
        }

        // === SUPERVISOR APPROVAL ===
        const supervisor = simulationData.supervisorSignature;
        if (options.sections.supervisorApproval) {
            checkNewPage(60);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('SUPERVISOR APPROVAL', 15, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            if (supervisor) {
                doc.text(`Status: APPROVED`, 15, y);
                y += 10;
                doc.text(`Name: ${supervisor.name}`, 15, y);
                y += 10;
                doc.text('_'.repeat(50), 15, y);
                doc.text('Supervisor Signature', 15, y + 5);
                y += 15;
                doc.text('_'.repeat(50), 15, y);
                doc.text(`Date: ${new Date(supervisor.date).toLocaleDateString()}`, 15, y + 5);
            } else {
                doc.text(`Status: PENDING APPROVAL`, 15, y);
                y += 15;
                doc.text('_'.repeat(50), 15, y);
                doc.text('Supervisor Signature', 15, y + 5);
                y += 15;
                doc.text('_'.repeat(50), 15, y);
                doc.text('Date', 15, y + 5);
            }
        }

        // === DISCLAIMER ===
        if (options.includeDisclaimer) {
            checkNewPage(40);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            const disclaimer = 'DISCLAIMER: This report is generated by Suttain AI simulation platform for educational and informational purposes. Results should be verified by qualified professionals before any practical application. Always consult material safety data sheets (MSDS) and follow proper laboratory safety protocols.';
            const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 30);
            disclaimerLines.forEach(line => {
                checkNewPage();
                doc.text(line, 15, y);
                y += 5;
            });
        }

        // Generate PDF
        let pdfBytes;
        try {
            pdfBytes = doc.output('arraybuffer');
        } catch (pdfError) {
            console.error('PDF output error:', pdfError);
            return new Response(JSON.stringify({ 
                error: 'Failed to generate PDF output', 
                details: pdfError.message 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="lab-report.pdf"',
                'Content-Length': pdfBytes.byteLength.toString()
            }
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        console.error('Error stack:', error.stack);
        return new Response(JSON.stringify({ 
            error: 'Failed to generate PDF', 
            details: error.message,
            stack: error.stack 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});