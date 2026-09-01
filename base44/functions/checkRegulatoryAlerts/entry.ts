import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Checks all users' saved formulas for ingredients with updated regulatory/toxicological data.
 * Creates in-app notifications and sends emails for significant changes.
 * Intended to be run as a scheduled automation (daily).
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Require admin auth, prevents unauthenticated external callers from
  // triggering system-wide scans that consume LLM credits and send emails.
  // Scheduled automations must invoke this function with an admin token.
  const user = await base44.auth.me().catch(() => null);
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    // 1. Fetch all formulas (service role so we can see all users' formulas)
    const formulas = await base44.asServiceRole.entities.Formula.list('-updated_date', 200);

    if (!formulas || formulas.length === 0) {
      return Response.json({ message: 'No formulas to check.' });
    }

    // 2. Collect unique ingredient names across all formulas
    const ingredientMap = {}; // ingredientName -> Set of { formulaId, formulaName, userEmail }
    for (const formula of formulas) {
      if (!formula.ingredients || !formula.created_by) continue;
      for (const ing of formula.ingredients) {
        const name = ing.chemical_name?.trim();
        if (!name) continue;
        if (!ingredientMap[name]) ingredientMap[name] = [];
        ingredientMap[name].push({
          formulaId: formula.id,
          formulaName: formula.name,
          userEmail: formula.created_by,
        });
      }
    }

    const uniqueIngredients = Object.keys(ingredientMap);
    if (uniqueIngredients.length === 0) {
      return Response.json({ message: 'No ingredients found.' });
    }

    // 3. Ask AI to identify which ingredients have recent regulatory/tox changes
    const checkResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a regulatory intelligence expert. Today's date is ${new Date().toISOString().split('T')[0]}.

Review the following list of cosmetic/chemical ingredients and identify any that have:
- Recently been added to or removed from banned/restricted lists (EU, FDA, REACH, etc.)
- Had updated toxicological classifications (e.g., carcinogen, endocrine disruptor, CMR reclassification)
- Received new safety warnings or concentration limit changes
- Been subject to recent safety alerts (within the last 90 days)

Ingredients to check:
${uniqueIngredients.slice(0, 50).join(', ')}

For each ingredient with a notable change, provide:
- The ingredient name (exactly as listed above)
- A short alert title (max 10 words)
- A clear description of what changed and why it matters (2-3 sentences)
- Severity: "warning" or "critical"
- The relevant regulatory body or source

Only include ingredients with REAL, KNOWN regulatory changes. Do not fabricate alerts. If no real changes are known, return an empty alerts array.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ingredient_name: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                severity: { type: 'string' },
                source: { type: 'string' },
              },
            },
          },
        },
      },
      model: 'gemini_3_flash',
    });

    const alerts = checkResult?.alerts || [];
    console.log(`Regulatory check complete. ${alerts.length} alert(s) found for ${uniqueIngredients.length} ingredients.`);

    if (alerts.length === 0) {
      return Response.json({ message: 'No regulatory changes detected.', checked: uniqueIngredients.length });
    }

    // 4. For each alert, notify affected users
    const notificationsCreated = [];
    const emailsSent = [];

    for (const alert of alerts) {
      const affectedFormulas = ingredientMap[alert.ingredient_name] || [];

      // Deduplicate by user email, one notification per user even if multiple formulas affected
      const userMap = {};
      for (const f of affectedFormulas) {
        if (!userMap[f.userEmail]) userMap[f.userEmail] = [];
        userMap[f.userEmail].push(f.formulaName);
      }

      for (const [userEmail, formulaNames] of Object.entries(userMap)) {
        const formulaList = [...new Set(formulaNames)].join(', ');
        const notifTitle = `⚠️ Regulatory Alert: ${alert.ingredient_name}`;
        const notifMessage = `${alert.title}. ${alert.description} This affects your formula(s): ${formulaList}. Source: ${alert.source || 'Regulatory Database'}.`;

        // Deduplicate: skip if a very similar notification was created today
        const today = new Date().toISOString().split('T')[0];
        const existing = await base44.asServiceRole.entities.Notification.filter({
          target_user: userEmail,
          title: notifTitle,
        }, '-created_date', 1);

        const alreadySentToday = existing.some(n => n.created_date?.startsWith(today));
        if (alreadySentToday) {
          console.log(`Skipping duplicate notification for ${userEmail} about ${alert.ingredient_name}`);
          continue;
        }

        // Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          title: notifTitle,
          message: notifMessage,
          type: 'compliance',
          severity: alert.severity || 'warning',
          is_read: false,
          target_user: userEmail,
          action_url: '/generator',
          metadata: {
            ingredient: alert.ingredient_name,
            affected_formulas: formulaNames,
            source: alert.source,
          },
        });

        notificationsCreated.push(userEmail);

        // Send email alert
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: `🚨 Suttain Regulatory Alert: ${alert.ingredient_name}`,
          body: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
    <div style="display: flex; align-items: center; margin-bottom: 24px;">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height: 40px;" />
    </div>
    
    <div style="background: ${alert.severity === 'critical' ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${alert.severity === 'critical' ? '#fca5a5' : '#fcd34d'}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-weight: bold; color: ${alert.severity === 'critical' ? '#dc2626' : '#d97706'}; font-size: 16px;">
        ${alert.severity === 'critical' ? '🔴 Critical Alert' : '🟡 Regulatory Warning'}
      </p>
    </div>

    <h2 style="color: #1e293b; margin-top: 0;">${alert.title}</h2>
    
    <p style="color: #475569; line-height: 1.6;">${alert.description}</p>
    
    <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-weight: bold; color: #374151;">Affected Ingredient:</p>
      <p style="margin: 0; color: #dc2626; font-weight: bold;">${alert.ingredient_name}</p>
      
      <p style="margin: 12px 0 4px 0; font-weight: bold; color: #374151;">Affected Formula(s):</p>
      <p style="margin: 0; color: #475569;">${formulaList}</p>
      
      ${alert.source ? `<p style="margin: 12px 0 4px 0; font-weight: bold; color: #374151;">Source:</p>
      <p style="margin: 0; color: #475569;">${alert.source}</p>` : ''}
    </div>
    
    <p style="color: #475569; line-height: 1.6;">We recommend reviewing these formulas and considering reformulation or updated compliance documentation.</p>
    
    <a href="https://app.suttain.com/generator" style="display: inline-block; background: linear-gradient(135deg, #02988C, #09D2FF); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
      Review My Formulas
    </a>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
    <p style="color: #94a3b8; font-size: 12px;">You're receiving this because you have an active Suttain account with saved formulas. <br/>© ${new Date().getFullYear()} Suttain Labs</p>
  </div>
</body>
</html>
          `,
        });

        emailsSent.push(userEmail);
      }
    }

    return Response.json({
      success: true,
      ingredients_checked: uniqueIngredients.length,
      alerts_found: alerts.length,
      notifications_created: notificationsCreated.length,
      emails_sent: emailsSent.length,
    });

  } catch (error) {
    console.error('Regulatory alert check failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});