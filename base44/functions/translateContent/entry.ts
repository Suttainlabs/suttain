import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Public endpoint — no auth required (works for unauthenticated users too)
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
      hi: 'Hindi',
      sw: 'Swahili',
      es: 'Spanish',
      en: 'English',
    };
    const targetName = languageNames[target_language] || 'English';

    const typeContext = content_type
      ? `This content is of type "${content_type}". Preserve any scientific names, chemical formulas, CAS numbers, SMILES strings, InChI keys, units, and numeric values exactly as they are — do not translate or modify them.`
      : 'Preserve any scientific names, chemical formulas, CAS numbers, SMILES strings, InChI keys, units, and numeric values exactly as they are.';

    const prompt = `Translate the following text into ${targetName}. ${typeContext} Translate only natural language descriptions, safety warnings, and prose. Return ONLY the translated text with no preamble or explanation.

Text to translate:
${content}`;

    const result = await base44.integrations.Core.InvokeLLM({
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