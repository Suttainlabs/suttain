import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Attempts to decode a barcode from an image URL using multiple strategies.
// Strategy 1: zxing-wasm (proper barcode decoding library, most accurate)
// Strategy 2: LLM vision with strict validation prompt (fallback only)

async function decodeWithZxing(imageBuffer) {
    try {
        // Use the default export which exposes readBarcodes directly
        const zxing = await import('npm:zxing-wasm@1.3.4');
        
        // zxing-wasm expects an ImageData-like object or Uint8Array with width/height
        // We pass raw bytes and let the library handle it
        const uint8 = new Uint8Array(imageBuffer);
        
        let readFn = null;
        if (typeof zxing.readBarcodes === 'function') {
            readFn = zxing.readBarcodes;
        } else if (typeof zxing.default?.readBarcodes === 'function') {
            readFn = zxing.default.readBarcodes;
        }

        if (!readFn) {
            console.log('zxing-wasm: readBarcodes not found, skipping');
            return null;
        }

        const results = await readFn(uint8, {
            formats: [
                'EAN-13', 'EAN-8', 'UPC-A', 'UPC-E',
                'Code128', 'Code39', 'Code93',
                'Codabar', 'ITF', 'DataMatrix', 'QRCode', 'PDF417'
            ],
            tryHarder: true,
            tryRotate: true,
            tryInvert: true,
            tryDownscale: true
        });

        if (results && results.length > 0) {
            const best = results[0];
            const code = best.text;
            console.log(`zxing decoded: ${code} (format: ${best.format})`);
            return code ? String(code).replace(/\D/g, '') : null;
        }
        return null;
    } catch (err) {
        console.error('zxing decode error:', err.message);
        return null;
    }
}

async function decodeWithLLM(base44, file_url) {
    try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are a barcode reading specialist. Look at this product image carefully.
            
Your ONLY task is to find and read the numeric barcode printed on the product packaging (EAN-13, UPC-A, or similar).

Rules:
- Read the actual printed digits under the barcode bars, do NOT guess
- EAN-13 barcodes have exactly 13 digits
- UPC-A barcodes have exactly 12 digits  
- EAN-8 barcodes have exactly 8 digits
- Return ONLY the digits, no spaces or dashes
- If you cannot read the barcode digits clearly and with certainty, set barcode to null
- Do NOT invent or estimate digits — accuracy is critical

Return a JSON with key "barcode" containing the digit string, or null if not clearly readable.`,
            file_urls: [file_url],
            response_json_schema: {
                type: 'object',
                properties: {
                    barcode: {
                        type: 'string',
                        description: 'The exact numeric barcode digits read from the image. Null if not clearly readable.',
                        nullable: true
                    },
                    confidence: {
                        type: 'string',
                        enum: ['high', 'medium', 'low'],
                        description: 'How confident the reading is'
                    }
                },
                required: ['barcode']
            }
        });

        if (result?.barcode && result.confidence !== 'low') {
            const digits = String(result.barcode).replace(/\D/g, '');
            if (digits.length >= 8 && digits.length <= 14) {
                console.log(`LLM decoded: ${digits} (confidence: ${result.confidence})`);
                return digits;
            }
        }
        console.log('LLM returned unusable result:', JSON.stringify(result));
        return null;
    } catch (err) {
        console.error('LLM decode error:', err.message);
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url } = await req.json();
        if (!file_url) {
            return Response.json({ error: 'file_url is required' }, { status: 400 });
        }

        console.log('Scanning barcode from image:', file_url);

        // Fetch the image as a buffer for zxing
        let imageBuffer = null;
        try {
            const imgRes = await fetch(file_url);
            if (imgRes.ok) {
                imageBuffer = await imgRes.arrayBuffer();
            } else {
                console.error('Failed to fetch image, status:', imgRes.status);
            }
        } catch (fetchErr) {
            console.error('Failed to fetch image:', fetchErr.message);
        }

        // Strategy 1: zxing-wasm (proper barcode library)
        let barcode = null;
        if (imageBuffer) {
            barcode = await decodeWithZxing(imageBuffer);
        }

        // Strategy 2: LLM fallback with strict validation
        if (!barcode) {
            console.log('zxing found nothing, trying LLM fallback...');
            barcode = await decodeWithLLM(base44, file_url);
        }

        if (barcode) {
            console.log('Final barcode result:', barcode);
            return Response.json({ barcode });
        }

        return Response.json(
            { error: 'No barcode detected in the image. Ensure the barcode is clearly visible, well-lit, and in focus.' },
            { status: 404 }
        );

    } catch (error) {
        console.error('Unexpected error in scanBarcodeFromImage:', error);
        return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
});