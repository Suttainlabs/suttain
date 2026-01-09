
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        const { formulaData, exportType } = await req.json();
        if (!formulaData) {
            return new Response(JSON.stringify({ error: 'Formula data is required.' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const doc = new jsPDF();
        let currentY = 20;

        // Helper function to add bullet point
        const addBulletPoint = (text, x, y, maxWidth, fontSize = 10) => {
            doc.setFontSize(fontSize);
            // Use a simple dash instead of special character
            doc.text('-', x, y);
            const textLines = doc.splitTextToSize(text, maxWidth - 10);
            doc.text(textLines, x + 6, y);
            return y + (textLines.length * (fontSize * 0.4)) + 2;
        };

        // Header
        doc.setFontSize(24);
        doc.setTextColor(20, 184, 166);
        doc.text('SUTTAIN', 14, currentY);
        currentY += 8;

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Chemical Safety & Formula Analysis Platform', 14, currentY);
        currentY += 15;

        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        const reportTitle = exportType === 'business' ? 'Business Formula Report' : 'Individual Formula Report';
        doc.text(reportTitle, 14, currentY);
        currentY += 20;

        // Formula Information
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Formula Information', 14, currentY);
        currentY += 10;

        doc.setFontSize(10);
        doc.text(`Name: ${formulaData.name || 'N/A'}`, 20, currentY);
        currentY += 6;
        doc.text(`Type: ${formulaData.product_type?.replace(/_/g, ' ') || 'N/A'}`, 20, currentY);
        currentY += 6;
        doc.text(`Created by: ${user.full_name || 'N/A'}`, 20, currentY);
        currentY += 6;
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, currentY);
        currentY += 15;

        // Ingredients
        doc.setFontSize(14);
        doc.text('Ingredients', 14, currentY);
        currentY += 10;

        // Ingredients table header
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text('Ingredient', 20, currentY);
        doc.text('Percentage (%)', 100, currentY);
        doc.text('Purpose', 140, currentY);
        currentY += 2;
        
        // Draw line under header
        doc.setDrawColor(200, 200, 200);
        doc.line(20, currentY, 190, currentY);
        currentY += 6;

        // Ingredients data
        let totalPercentage = 0;
        (formulaData.ingredients || []).forEach(ing => {
            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }
            
            const percentage = parseFloat(ing.percentage) || 0;
            totalPercentage += percentage;
            
            doc.text(ing.chemical_name || 'N/A', 20, currentY);
            doc.text(`${percentage.toFixed(2)}%`, 100, currentY);
            
            // Handle long purpose text
            const purposeLines = doc.splitTextToSize(ing.purpose || '', 50);
            doc.text(purposeLines, 140, currentY);
            currentY += Math.max(6, purposeLines.length * 4);
        });

        // Total line
        currentY += 2;
        doc.line(20, currentY, 190, currentY);
        currentY += 6;
        doc.setFontSize(10);
        doc.text('Total:', 80, currentY);
        doc.text(`${totalPercentage.toFixed(2)}%`, 100, currentY);
        currentY += 15;

        // Mixing Instructions
        if (currentY > 200) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(14);
        doc.text('Mixing Instructions', 14, currentY);
        currentY += 10;

        if (formulaData.instructions && Array.isArray(formulaData.instructions)) {
            formulaData.instructions.forEach((phase, index) => {
                if (currentY > 250) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(12);
                doc.text(`${index + 1}. ${phase.phase || 'Phase'}`, 20, currentY);
                currentY += 8;

                if (phase.steps && Array.isArray(phase.steps)) {
                    phase.steps.forEach(step => {
                        if (currentY > 270) {
                            doc.addPage();
                            currentY = 20;
                        }
                        
                        // Use dash for bullet points to avoid encoding issues
                        currentY = addBulletPoint(step, 25, currentY, 165, 10);
                    });
                }
                currentY += 5;
            });
        }

        // Properties
        if (currentY > 220) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(14);
        doc.text('Properties', 14, currentY);
        currentY += 10;

        doc.setFontSize(10);
        if (formulaData.properties) {
            doc.text(`pH Level: ${formulaData.properties.ph_level || 'N/A'}`, 20, currentY);
            currentY += 6;
            doc.text(`Shelf Life: ${formulaData.properties.shelf_life || 'N/A'}`, 20, currentY);
            currentY += 6;
            doc.text(`Difficulty: ${formulaData.properties.difficulty || 'N/A'}`, 20, currentY);
            currentY += 6;
        }

        // Business Section
        if (exportType === 'business') {
            currentY += 10;
            if (currentY > 200) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(14);
            doc.text('Business & Compliance Information', 14, currentY);
            currentY += 10;

            const businessItems = [
                'Regulatory Compliance: This formula should be reviewed for local regulations',
                'Quality Control: Test pH and consistency before production',
                'Batch Documentation: Record all measurements and conditions',
                'Storage Requirements: Store in appropriate conditions as per ingredient specs',
                'Supplier Verification: Ensure all ingredients meet commercial grade standards'
            ];

            businessItems.forEach(item => {
                if (currentY > 270) {
                    doc.addPage();
                    currentY = 20;
                }
                currentY = addBulletPoint(item, 20, currentY, 170, 10);
            });
            currentY += 10; // Add some space after static items

            // New: Cost Analysis
            if (formulaData.cost_analysis) {
                if (currentY > 250) { // Check before new section header
                    doc.addPage();
                    currentY = 20;
                }
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text('Cost Analysis:', 20, currentY);
                currentY += 8;
                doc.setFontSize(10);
                doc.text(`Cost Per Unit: $${(formulaData.cost_analysis.cost_per_unit || 'N/A')}`, 25, currentY);
                currentY += 6;
                doc.text(`Batch Size: ${formulaData.cost_analysis.batch_size || 'N/A'}`, 25, currentY);
                currentY += 6;
                doc.text(`Total Batch Cost: $${(formulaData.cost_analysis.total_batch_cost || 'N/A')}`, 25, currentY);
                currentY += 10;
            }

            // New: Packaging Notes
            if (formulaData.packaging_notes) {
                if (currentY > 250) { // Check before new section header
                    doc.addPage();
                    currentY = 20;
                }
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text('Packaging Notes:', 20, currentY);
                currentY += 8;
                const packagingNotesLines = doc.splitTextToSize(formulaData.packaging_notes, 170);
                doc.setFontSize(10);
                doc.text(packagingNotesLines, 25, currentY);
                currentY += (packagingNotesLines.length * 4) + 10; 
            }

            // New: Testing Procedures
            if (formulaData.testing_procedures && Array.isArray(formulaData.testing_procedures) && formulaData.testing_procedures.length > 0) {
                if (currentY > 250) { // Check before new section header
                    doc.addPage();
                    currentY = 20;
                }
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text('Testing Procedures:', 20, currentY);
                currentY += 8;
                formulaData.testing_procedures.forEach(procedure => {
                    if (currentY > 270) {
                        doc.addPage();
                        currentY = 20;
                    }
                    currentY = addBulletPoint(procedure, 25, currentY, 165, 10);
                });
                currentY += 10;
            }
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('This report is for informational purposes only. Always follow safety guidelines and local regulations.', 14, 285);
            doc.text(`Page ${i} of ${pageCount} | Generated by Suttain Platform`, 196, 285, { align: 'right' });
        }

        const pdfBytes = doc.output('arraybuffer');
        const filename = `${(formulaData.name || 'Formula').replace(/[^a-z0-9]/gi, '_')}.pdf`;

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('PDF Generation Error Details:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to generate PDF',
            details: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
