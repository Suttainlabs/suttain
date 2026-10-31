import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser, reserveSecurityAction, deny, escapeHtml } from '../../shared/securityGuards.ts';
import { limitDailyUse } from '../../shared/dailyFeatureLimit.ts';

// Server-side gateway for AI and email features that used to call Base44's
// built-in integrations straight from the browser. Every call here needs a
// signed-in user, has bounded input, and counts against a per-user daily cap,
// so the integrations can be closed to direct browser access.
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com';
const isHttpsUrl = (v: unknown) => typeof v === 'string' && v.length <= 2048 && /^https:\/\/[^\s<>"]+$/.test(v);
const boundedObject = (v: unknown, max: number) =>
  v === undefined || (v !== null && typeof v === 'object' && !Array.isArray(v) && JSON.stringify(v).length <= max);

export default async function (req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'Use POST.' }, { status: 405 });
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);

    const text = await req.text();
    if (text.length > 60000) return Response.json({ error: 'Request too large.' }, { status: 413 });
    let body: any;
    try { body = JSON.parse(text); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
    const action = body?.action;

    if (action === 'invoke_llm') {
      const { prompt, response_json_schema, add_context_from_internet, file_urls } = body;
      if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 40000) deny('Prompt must be text under 40,000 characters.', 400);
      if (!boundedObject(response_json_schema, 20000)) deny('Invalid response schema.', 400);
      if (file_urls !== undefined && (!Array.isArray(file_urls) || file_urls.length > 5 || !file_urls.every(isHttpsUrl))) deny('Invalid file URLs.', 400);
      const limited = await limitDailyUse(base44, user, 'browser_ai_assist', 40);
      if (limited) return limited;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        ...(response_json_schema ? { response_json_schema } : {}),
        ...(add_context_from_internet ? { add_context_from_internet: true } : {}),
        ...(file_urls?.length ? { file_urls } : {}),
      });
      return Response.json({ result });
    }

    if (action === 'extract_data') {
      const { file_url, json_schema } = body;
      if (!isHttpsUrl(file_url)) deny('Invalid file URL.', 400);
      if (!json_schema || !boundedObject(json_schema, 20000)) deny('Invalid extraction schema.', 400);
      const limited = await limitDailyUse(base44, user, 'browser_extract_data', 20);
      if (limited) return limited;
      const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema });
      return Response.json({ result });
    }

    if (action === 'waitlist_notification') {
      // Recipient is fixed to the Suttain inbox; callers cannot choose it.
      const field = (v: unknown) => escapeHtml(typeof v === 'string' ? v.slice(0, 200) : '');
      const name = field(body.name), company = field(body.company_name), email = field(body.email), role = field(body.role);
      if (!name || !company || !email) deny('Missing waitlist details.', 400);
      await reserveSecurityAction(base44, user, { channel: 'waitlist_notification', limit: 3 });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        from_name: 'Suttain Notifications',
        subject: `New Enterprise Waitlist Signup: ${company}`,
        body: `<p>A new user has joined the enterprise waitlist.</p><h3>User Details:</h3><ul><li><strong>Name:</strong> ${name}</li><li><strong>Company:</strong> ${company}</li><li><strong>Email:</strong> ${email}</li><li><strong>Role:</strong> ${role || 'Not provided'}</li></ul><p>You can view this submission in the admin dashboard.</p>`,
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    console.error('secureAIAssist error:', error?.message);
    return Response.json({ error: error?.status ? error.message : 'The AI assistant is unavailable right now. Please try again.' }, { status: error?.status || 500 });
  }
}
