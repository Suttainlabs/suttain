import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const { file_url } = await req.json();

        if (!file_url) {
            return new Response(JSON.stringify({ error: 'File URL is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const llmResult = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyze the image provided via the URL and identify any visible product barcodes (like EAN, UPC). Extract only the numerical digits of the barcode. If no barcode is clearly visible or decipherable, return null.`,
            file_urls: [file_url],
            response_json_schema: {
                type: 'object',
                properties: {
                    barcode: { 
                        type: 'string',
                        description: 'The numerical digits of the detected barcode. Null if none is found.',
                        nullable: true 
                    }
                },
                required: ['barcode']
            }
        });

        if (llmResult && llmResult.barcode) {
            return new Response(JSON.stringify({ barcode: llmResult.barcode }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            return new Response(JSON.stringify({ error: 'No barcode could be detected in the image.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

    } catch (error) {
        console.error('Error scanning barcode from image:', error);
        return new Response(JSON.stringify({ error: 'An unexpected error occurred during image analysis.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});