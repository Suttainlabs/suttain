import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import twilio from 'npm:twilio@5.3.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      to,         // phone number in E.164 format
      channel,    // 'sms' or 'whatsapp'
      productName,
      riskLevel,
      regulatoryAlert,
      reportUrl,
      flaggedIngredients = []
    } = await req.json();

    if (!to) {
      return Response.json({ error: 'Phone number (to) is required' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromSms = Deno.env.get('TWILIO_PHONE_NUMBER');
    const fromWhatsApp = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    const client = twilio(accountSid, authToken);

    const isWhatsApp = channel === 'whatsapp';
    const from = isWhatsApp ? fromWhatsApp : fromSms;
    const toFormatted = isWhatsApp ? `whatsapp:${to}` : to;

    // Build alert message
    const riskEmoji = riskLevel === 'high' || riskLevel === 'critical' ? '🚨' : '⚠️';
    const ingredientsList = flaggedIngredients.length > 0
      ? `\nFlagged: ${flaggedIngredients.slice(0, 3).join(', ')}${flaggedIngredients.length > 3 ? '...' : ''}`
      : '';

    let message;
    if (isWhatsApp) {
      message = `${riskEmoji} *Suttain Safety Alert*\n\n` +
        `Product: *${productName}*\n` +
        `Risk Level: *${(riskLevel || 'High').toUpperCase()}*\n` +
        (regulatoryAlert ? `⚠️ Regulatory Flag: ${regulatoryAlert}\n` : '') +
        ingredientsList +
        `\n\n📄 Full Report:\n${reportUrl || 'https://suttain.com/BarcodeScanner'}\n\n` +
        `Reply *HELP* to ask about ingredients or *STOP* to unsubscribe.`;
    } else {
      message = `${riskEmoji} SUTTAIN ALERT: ${productName} flagged as ${(riskLevel || 'HIGH').toUpperCase()} risk.` +
        (regulatoryAlert ? ` Regulatory: ${regulatoryAlert}.` : '') +
        ingredientsList +
        ` Report: ${reportUrl || 'https://suttain.com/BarcodeScanner'}`;
    }

    const result = await client.messages.create({
      body: message,
      from,
      to: toFormatted
    });

    console.log(`Twilio alert sent via ${channel}: ${result.sid}`);
    return Response.json({ success: true, sid: result.sid });

  } catch (error) {
    console.error('sendTwilioAlert error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});