import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let processed = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Get this user's food scans from the past 7 days
      const allScans = await base44.asServiceRole.entities.FoodScanHistory.filter({ created_by: user.email });
      const scans = allScans.filter(s => new Date(s.scanned_at || s.created_date) >= oneWeekAgo);

      if (scans.length === 0) continue;

      // Calculate weekly totals
      const totals = scans.reduce((acc, s) => ({
        calories: acc.calories + (s.calories || 0),
        protein: acc.protein + (s.protein_g || 0),
        carbs: acc.carbs + (s.carbs_g || 0),
        fat: acc.fat + (s.fat_g || 0),
        scans: acc.scans + 1,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, scans: 0 });

      const avgCalories = Math.round(totals.calories / 7);
      const highRiskFoods = scans.filter(s => s.chemical_threat_level === 'high' || s.chemical_threat_level === 'moderate');
      const firstName = user.full_name?.split(' ')[0] || 'there';

      // Create in-app notification
      await base44.asServiceRole.entities.Notification.create({
        title: '📊 Your Weekly Food Analysis Summary',
        message: `This week you logged ${totals.scans} meals with an avg of ${avgCalories} kcal/day. Total: ${Math.round(totals.calories)} kcal, ${Math.round(totals.protein)}g protein, ${Math.round(totals.carbs)}g carbs, ${Math.round(totals.fat)}g fat.`,
        type: 'feature',
        severity: 'info',
        is_read: false,
        target_user: user.email,
      });

      // Send weekly email
      const emailBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #02988C, #09D2FF); padding: 32px 24px; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Your Weekly Food Analysis Report 🥗</h1>
            <p style="margin: 8px 0 0; opacity: 0.85;">Hi ${firstName}! Here's your Food Analysis summary for the past 7 days.</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #1e293b; font-size: 18px;">Weekly Totals</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
              <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 28px; font-weight: bold; color: #f97316;">${Math.round(totals.calories)}</div>
                <div style="font-size: 12px; color: #64748b;">Total Calories</div>
              </div>
              <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 28px; font-weight: bold; color: #02988C;">${avgCalories}</div>
                <div style="font-size: 12px; color: #64748b;">Avg Calories/Day</div>
              </div>
              <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${Math.round(totals.protein)}g</div>
                <div style="font-size: 12px; color: #64748b;">Protein</div>
              </div>
              <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">${Math.round(totals.carbs)}g</div>
                <div style="font-size: 12px; color: #64748b;">Carbs</div>
              </div>
            </div>
            <p style="color: #475569;">You logged <strong>${totals.scans} meals</strong> this week.</p>
            ${highRiskFoods.length > 0 ? `<div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-top: 16px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ ${highRiskFoods.length} food(s) flagged with moderate/high chemical risk this week.</p>
            </div>` : `<div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 12px; padding: 16px; margin-top: 16px;">
              <p style="margin: 0; color: #065f46; font-weight: bold;">✅ No high chemical risk foods this week. Great choices!</p>
            </div>`}
            <p style="font-size: 11px; color: #94a3b8; margin-top: 24px;">For informational purposes only. Not medical or dietary advice. — Suttain Food Analysis</p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'Food Analysis by Suttain <noreply@suttain.com>',
        to: user.email,
        cc: 'contact@suttain.com',
        reply_to: 'contact@suttain.com',
        subject: `Your Weekly Food Report — ${totals.scans} meals, ${Math.round(totals.calories)} kcal`,
        html: emailBody,
      });

      processed++;
      console.log(`Sent weekly summary to ${user.email}`);
    }

    return Response.json({ success: true, processed });
  } catch (error) {
    console.error('weeklyNutriSummary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});