import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const TODAY = () => new Date().toISOString().split('T')[0];

export function useHydration(user) {
    const [profile, setProfile] = useState(null);
    const [todayLogs, setTodayLogs] = useState([]);
    const [todayFood, setTodayFood] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAll = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        try {
            const [profiles, logs, food] = await Promise.all([
                base44.entities.HydrationProfile.list('-created_date', 1),
                base44.entities.HydrationLog.filter({ log_date: TODAY() }, '-logged_at', 100),
                base44.entities.FoodScanHistory.filter({}, '-scanned_at', 50)
            ]);
            setProfile(profiles[0] || null);
            setTodayLogs(logs);
            // Filter food to today
            const todayStr = TODAY();
            setTodayFood(food.filter(f => f.scanned_at && f.scanned_at.startsWith(todayStr)));
        } catch (e) {
            console.error('hydration load error', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const totalIntake = todayLogs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);

    // Biological adjustments
    const bioAdjustments = useBioAdjustments(todayFood, profile);

    const trueGoal = profile
        ? Math.round((profile.base_goal_ml || 2000) + bioAdjustments.total)
        : 2000;

    const logDrink = useCallback(async (amount_ml, drink_type = 'water') => {
        if (!user) return;
        const now = new Date();
        const entry = await base44.entities.HydrationLog.create({
            amount_ml,
            drink_type,
            triggered_by: 'manual',
            logged_at: now.toISOString(),
            log_date: TODAY()
        });
        setTodayLogs(prev => [entry, ...prev]);
        return entry;
    }, [user]);

    const saveProfile = useCallback(async (data) => {
        let saved;
        if (profile?.id) {
            saved = await base44.entities.HydrationProfile.update(profile.id, data);
        } else {
            saved = await base44.entities.HydrationProfile.create(data);
        }
        setProfile(saved);
        return saved;
    }, [profile]);

    const deleteLog = useCallback(async (id) => {
        await base44.entities.HydrationLog.delete(id);
        setTodayLogs(prev => prev.filter(l => l.id !== id));
    }, []);

    return { profile, todayLogs, todayFood, totalIntake, trueGoal, bioAdjustments, loading, logDrink, saveProfile, deleteLog, reload: loadAll };
}

export function useBioAdjustments(todayFood, profile) {
    if (!profile?.biological_mode || !todayFood?.length) {
        return { sodium: 0, inflammation: 0, chemical: 0, activity: 0, climate: 0, total: 0, cards: [] };
    }

    const totalSodium = todayFood.reduce((s, f) => s + (f.sodium_mg || 0), 0);
    const avgInflammation = todayFood.length
        ? todayFood.reduce((s, f) => s + (f.nova_score || 0), 0) / todayFood.length
        : 0;
    const avgChemical = todayFood.length
        ? todayFood.reduce((s, f) => s + (f.chemical_threat_score || 0), 0) / todayFood.length
        : 0;

    const activityBonus = { sedentary: 0, light: 150, moderate: 300, active: 500, very_active: 700 }[profile.activity_level] || 0;
    const climateBonus = { cool: 0, moderate: 100, hot: 300, humid: 250 }[profile.climate] || 0;

    const sodiumAdj = totalSodium > 1500 ? Math.round((totalSodium - 1500) * 0.3) : 0;
    const inflammationAdj = avgInflammation > 3 ? 200 : 0;
    const chemicalAdj = avgChemical > 5 ? 150 : 0;

    const cards = [];
    if (sodiumAdj > 0) cards.push({ type: 'sodium', sodium: totalSodium, adj: sodiumAdj });
    if (inflammationAdj > 0) cards.push({ type: 'inflammation', score: avgInflammation, adj: inflammationAdj });
    if (chemicalAdj > 0) cards.push({ type: 'chemical', score: avgChemical, adj: chemicalAdj });

    return {
        sodium: sodiumAdj,
        inflammation: inflammationAdj,
        chemical: chemicalAdj,
        activity: activityBonus,
        climate: climateBonus,
        total: sodiumAdj + inflammationAdj + chemicalAdj + activityBonus + climateBonus,
        cards,
        totalSodium,
        avgInflammation,
        avgChemical
    };
}