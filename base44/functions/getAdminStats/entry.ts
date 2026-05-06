import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { format, subDays, startOfDay } from 'npm:date-fns@2.30.0';

const aggregateActivityByDay = (records) => {
  const activity = records.reduce((acc, record) => {
    const day = format(startOfDay(new Date(record.created_date)), 'yyyy-MM-dd');
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const result = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const day = format(startOfDay(date), 'yyyy-MM-dd');
    result.push({
      date: format(date, 'MMM d'),
      count: activity[day] || 0,
    });
  }
  return result;
};

// Fetch all records by paginating through results
const fetchAll = async (entity) => {
  const allRecords = [];
  let skip = 0;
  const limit = 100;
  while (true) {
    const batch = await entity.list('-created_date', limit, skip);
    if (!batch || batch.length === 0) break;
    allRecords.push(...batch);
    if (batch.length < limit) break;
    skip += limit;
  }
  return allRecords;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const entities = base44.asServiceRole.entities;

    // Fetch all records from each entity with pagination
    const [users, formulas, simulations, reviews, waitlist, demos, contacts, barcodeHistory, complianceChecks, safetyProfiles] = await Promise.all([
      fetchAll(entities.User).catch(() => []),
      fetchAll(entities.Formula).catch(() => []),
      fetchAll(entities.Simulation).catch(() => []),
      fetchAll(entities.Review).catch(() => []),
      fetchAll(entities.EnterpriseWaitlist).catch(() => []),
      fetchAll(entities.DemoRequest).catch(() => []),
      fetchAll(entities.ContactSubmission).catch(() => []),
      fetchAll(entities.BarcodeHistory).catch(() => []),
      fetchAll(entities.ComplianceCheck).catch(() => []),
      fetchAll(entities.SafetyProfile).catch(() => []),
    ]);

    const totals = {
      user: users.length,
      formula: formulas.length,
      simulation: simulations.length,
      review: reviews.length,
      enterprise_waitlist: waitlist.length,
      demo_request: demos.length,
      contact_submission: contacts.length,
      barcode_scan: barcodeHistory.length,
      compliance_check: complianceChecks.length,
      safety_profile: safetyProfiles.length,
      subscribers: subscribers.length,
    };

    // Recent activity (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();

    // Count subscribers (users with active pro/enterprise subscription)
    const subscribers = users.filter(u => u.subscription_plan && u.subscription_status === 'active');
    const weekSubscribers = subscribers.filter(u => u.updated_date && new Date(u.updated_date) >= new Date(sevenDaysAgo));

    const recentUsers = users.filter(u => u.created_date && new Date(u.created_date) >= new Date(thirtyDaysAgo));
    const recentFormulas = formulas.filter(f => f.created_date && new Date(f.created_date) >= new Date(thirtyDaysAgo));
    const recentSimulations = simulations.filter(s => s.created_date && new Date(s.created_date) >= new Date(thirtyDaysAgo));
    const recentScans = barcodeHistory.filter(b => b.created_date && new Date(b.created_date) >= new Date(thirtyDaysAgo));

    // 7-day counts for growth indicators
    const weekUsers = users.filter(u => u.created_date && new Date(u.created_date) >= new Date(sevenDaysAgo)).length;
    const weekFormulas = formulas.filter(f => f.created_date && new Date(f.created_date) >= new Date(sevenDaysAgo)).length;
    const weekSimulations = simulations.filter(s => s.created_date && new Date(s.created_date) >= new Date(sevenDaysAgo)).length;
    const weekScans = barcodeHistory.filter(b => b.created_date && new Date(b.created_date) >= new Date(sevenDaysAgo)).length;

    // Aggregate chart data
    const usersByDay = aggregateActivityByDay(recentUsers);
    const formulasByDay = aggregateActivityByDay(recentFormulas);
    const simulationsByDay = aggregateActivityByDay(recentSimulations);
    const scansByDay = aggregateActivityByDay(recentScans);

    const activityData = usersByDay.map((ud, i) => ({
      date: ud.date,
      Users: ud.count,
      Formulas: formulasByDay[i]?.count || 0,
      Simulations: simulationsByDay[i]?.count || 0,
      Scans: scansByDay[i]?.count || 0,
    }));

    // Formula status breakdown
    const formulaStatuses = formulas.reduce((acc, f) => {
      const status = f.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Review ratings distribution
    const ratingDistribution = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating - 1]++;
      }
    });
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0;

    // Recent signups (last 10)
    const recentSignups = users
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10)
      .map(u => ({
        name: u.full_name || 'Unknown',
        email: u.email,
        date: u.created_date,
        role: u.role || 'user'
      }));

    // Demo request statuses
    const demoStatuses = demos.reduce((acc, d) => {
      const status = d.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return new Response(JSON.stringify({
      totals,
      activityData,
      weeklyGrowth: { weekUsers, weekFormulas, weekSimulations, weekScans, weekSubscribers: weekSubscribers.length },
      formulaStatuses,
      ratingDistribution,
      avgRating,
      recentSignups,
      demoStatuses,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting admin stats:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to retrieve admin statistics.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});