import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Public endpoint: no auth required (works for unauthenticated users too)
    const body = await req.json();
    const { content, target_language, content_type } = body;

    if (!content || !target_language) {
      return Response.json(
        { error: 'Missing required fields: content, target_language' },
        { status: 400 }
      );
    }

    // If target is English, skip translation entirely (source is English)
    if (target_language === 'en') {
      return Response.json({ translated: content, language: 'en' });
    }

    const languageNames = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
      it: 'Italian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ru: 'Russian',
      ar: 'Arabic', hi: 'Hindi', bn: 'Bengali', ur: 'Urdu', sw: 'Swahili',
    };
    const targetName = languageNames[target_language] || target_language;

    const typeContext = content_type
      ? `This content is of type "${content_type}". Preserve any scientific names, chemical formulas, CAS numbers, SMILES strings, InChI keys, units, and numeric values exactly as they are, do not translate or modify them.`
      : 'Preserve any scientific names, chemical formulas, CAS numbers, SMILES strings, InChI keys, units, and numeric values exactly as they are.';

    // Batch mode: content is an array of strings → return a parallel array of translations.
    if (Array.isArray(content)) {
      const items = content.map((s) => String(s));
      const prompt = `You are a professional UI translator. Translate each string in the JSON array below into ${targetName}. ${typeContext} Translate only natural language; keep it concise and natural for a product UI. Return a JSON object with a single key "translations" whose value is an array of translated strings, in the SAME ORDER and SAME LENGTH as the input array. Do not include the originals, commentary, or any other keys.

Input array:
${JSON.stringify(items)}`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            translations: { type: 'array', items: { type: 'string' } },
          },
          required: ['translations'],
        },
      });

      const arr = Array.isArray(result?.translations) ? result.translations : [];
      const out = {};
      items.forEach((s, i) => { out[s] = (typeof arr[i] === 'string' && arr[i]) ? arr[i] : s; });
      return Response.json({ translated: out, language: target_language });
    }

    // Single-string mode (backward compatible)
    const prompt = `Translate the following text into ${targetName}. ${typeContext} Translate only natural language descriptions, safety warnings, and prose. Return ONLY the translated text with no preamble or explanation.

Text to translate:
${content}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          translated: { type: 'string' },
        },
        required: ['translated'],
      },
    });

    return Response.json({
      translated: result.translated || content,
      language: target_language,
    });
  } catch (error) {
    console.error('translateContent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});