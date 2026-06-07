import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0];

        const [logs, profile, food] = await Promise.all([
            base44.entities.HydrationLog.filter({ log_date: today }, '-logged_at', 200),
            base44.entities.HydrationProfile.list('-created_date', 1),
            base44.entities.FoodScanHistory.filter({}, '-scanned_at', 50)
        ]);

        const userProfile = profile[0];
        if (!userProfile) {
            return Response.json({ error: 'No hydration profile found' }, { status: 400 });
        }

        const totalIntake = logs.reduce((s, l) => s + (l.amount_ml || 0), 0);
        const baseGoal = userProfile.base_goal_ml || 2000;

        // Bio adjustments
        const todayFood = food.filter(f => f.scanned_at && f.scanned_at.startsWith(today));
        const totalSodium = todayFood.reduce((s, f) => s + (f.sodium_mg || 0), 0);
        const avgInflammation = todayFood.length ? todayFood.reduce((s, f) => s + (f.nova_score || 0), 0) / todayFood.length : 0;
        const avgChemical = todayFood.length ? todayFood.reduce((s, f) => s + (f.chemical_threat_score || 0), 0) / todayFood.length : 0;

        const sodiumAdj = totalSodium > 1500 ? Math.round((totalSodium - 1500) * 0.3) : 0;
        const inflammationAdj = avgInflammation > 3 ? 200 : 0;
        const chemicalAdj = avgChemical > 5 ? 150 : 0;
        const actBonus = { sedentary: 0, light: 150, moderate: 300, active: 500, very_active: 700 }[userProfile.activity_level] || 0;
        const climBonus = { cool: 0, moderate: 100, hot: 300, humid: 250 }[userProfile.climate] || 0;

        const trueGoal = baseGoal + sodiumAdj + inflammationAdj + chemicalAdj + actBonus + climBonus;
        const achievementPct = Math.round((totalIntake / trueGoal) * 100);
        const adjustmentsCount = [sodiumAdj, inflammationAdj, chemicalAdj].filter(a => a > 0).length;

        const prompt = `
Generate a concise Daily Biological Hydration Report for a user. 

Data:
- Total water intake today: ${totalIntake}ml
- True hydration goal: ${trueGoal}ml  
- Achievement: ${achievementPct}%
- Biological adjustments triggered: ${adjustmentsCount}
- Sodium intake: ${Math.round(totalSodium)}mg
- Average NOVA inflammation score: ${avgInflammation.toFixed(1)}
- Average chemical threat score: ${avgChemical.toFixed(1)}
- Foods scanned today: ${todayFood.length}

Write:
1. A 2-sentence plain language summary of how today's food choices affected hydration needs.
2. One specific, actionable recommendation for tomorrow.

Be warm, supportive and scientifically grounded. Do not use bullet points. Keep it brief.`;

        const llmResult = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    summary: { type: 'string' },
                    recommendation: { type: 'string' }
                },
                required: ['summary', 'recommendation']
            }
        });

        const title = `Daily Hydration Report — ${today}`;
        const message = `${totalIntake}ml consumed of ${trueGoal}ml goal (${achievementPct}%). ${adjustmentsCount} biological adjustment${adjustmentsCount !== 1 ? 's' : ''} applied today. ${llmResult?.summary || ''}`;

        const existingInsights = await base44.entities.HydrationInsight.filter({ insight_date: today, insight_type: 'daily_biological_report' }, '-created_date', 1);

        let insight;
        if (existingInsights.length > 0) {
            insight = await base44.entities.HydrationInsight.update(existingInsights[0].id, {
                title,
                message,
                severity: achievementPct >= 100 ? 'positive' : achievementPct >= 75 ? 'info' : 'warning',
                recommendation: llmResult?.recommendation || '',
                data: { totalIntake, trueGoal, achievementPct, adjustmentsCount, totalSodium, avgInflammation, avgChemical }
            });
        } else {
            insight = await base44.entities.HydrationInsight.create({
                insight_type: 'daily_biological_report',
                title,
                message,
                severity: achievementPct >= 100 ? 'positive' : achievementPct >= 75 ? 'info' : 'warning',
                insight_date: today,
                recommendation: llmResult?.recommendation || '',
                data: { totalIntake, trueGoal, achievementPct, adjustmentsCount, totalSodium, avgInflammation, avgChemical }
            });
        }

        return Response.json({ success: true, insight });
    } catch (error) {
        console.error('Daily hydration report error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});