import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    console.log(`Broadcasting both emails to ${users.length} users with rate-limit delays...`);

    const results = [];
    for (const u of users) {
      if (!u.email) continue;
      try {
        // Invoke sendWelcomeEmail which sends both emails (welcome + subscription plan)
        await base44.asServiceRole.functions.invoke('sendWelcomeEmail', { email: u.email, full_name: u.full_name || '' });
        console.log(`Sent both emails to: ${u.email}`);
        results.push({ email: u.email, status: 'sent' });
      } catch (err) {
        console.error(`Failed for ${u.email}: ${err.message}`);
        results.push({ email: u.email, status: 'failed', error: err.message });
      }
      // Wait 3 seconds between users to avoid rate limiting
      await sleep(3000);
    }

    return Response.json({ success: true, total: users.length, results });
  } catch (error) {
    console.error('Broadcast failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});