import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import twilio from 'npm:twilio@5.3.0';

// This function acts as the Twilio WhatsApp webhook handler
// Set this function's URL in Twilio Console > Messaging > WhatsApp Sandbox > "When a message comes in"

Deno.serve(async (req) => {
  try {
    // Parse form-encoded body from Twilio
    const body = await req.text();
    const params = new URLSearchParams(body);

    const incomingMsg = (params.get('Body') || '').trim().toLowerCase();
    const from = params.get('From') || ''; // whatsapp:+1234567890
    const userPhone = from.replace('whatsapp:', '');

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromWhatsApp = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    const client = twilio(accountSid, authToken);

    let replyMessage = '';

    // Command routing
    if (incomingMsg === 'help' || incomingMsg === 'hi' || incomingMsg === 'hello') {
      replyMessage =
        `👋 *Welcome to Suttain Ingredient Assistant!*\n\n` +
        `I can help you understand chemical ingredients and safety info.\n\n` +
        `*Commands:*\n` +
        `• Send an *ingredient name* to get safety info\n` +
        `• Type *scan* to get the scanner link\n` +
        `• Type *stop* to unsubscribe from alerts\n\n` +
        `Example: _"Sodium Lauryl Sulfate"_`;

    } else if (incomingMsg === 'stop') {
      replyMessage =
        `✅ You've been unsubscribed from Suttain safety alerts.\n` +
        `Reply *START* anytime to re-subscribe.`;

    } else if (incomingMsg === 'start') {
      replyMessage =
        `✅ You're now subscribed to Suttain safety alerts!\n` +
        `You'll receive SMS/WhatsApp notifications when scanned products have High risk ingredients.\n\n` +
        `Reply *HELP* to see what I can do.`;

    } else if (incomingMsg === 'scan') {
      replyMessage =
        `📱 *Suttain Product Scanner*\n\n` +
        `Scan any product barcode or search by ingredient at:\n` +
        `🔗 https://suttain.com/BarcodeScanner\n\n` +
        `High-risk products will automatically alert you here!`;

    } else if (incomingMsg.length > 2) {
      // Treat message as ingredient query — use LLM via Base44
      try {
        // We use a service-role client for LLM calls since this is a webhook (no user auth)
        const base44Service = createClientFromRequest(req);

        const llmResult = await base44Service.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a chemical safety assistant for Suttain, a sustainability and chemical analysis platform. 
A user is asking about the ingredient: "${incomingMsg}"

Provide a concise WhatsApp-friendly response (max 300 chars) covering:
1. What it is (1 line)
2. Safety level: Safe / Moderate / Hazardous
3. One key concern if any
4. Eco impact in one word

Format: plain text, no markdown headers, use emoji sparingly.`,
          model: 'gpt_5_mini'
        });

        replyMessage =
          `🧪 *${incomingMsg.charAt(0).toUpperCase() + incomingMsg.slice(1)}*\n\n` +
          llmResult +
          `\n\n🔍 Full analysis: https://suttain.com/IngredientDatabase`;

      } catch (llmErr) {
        console.error('LLM error:', llmErr.message);
        replyMessage =
          `🧪 I couldn't retrieve info on "${incomingMsg}" right now.\n` +
          `Try searching at: https://suttain.com/IngredientDatabase`;
      }

    } else {
      replyMessage =
        `I didn't understand that. Reply *HELP* to see available commands.`;
    }

    // Send reply via Twilio
    await client.messages.create({
      body: replyMessage,
      from: fromWhatsApp,
      to: from
    });

    console.log(`WhatsApp bot replied to ${userPhone}: ${replyMessage.substring(0, 80)}...`);

    // Twilio expects a 200 with empty body or TwiML
    return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error('twilioWhatsAppBot error:', error.message);
    return new Response('', { status: 200 }); // Always 200 to Twilio
  }
});