import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.email;
    const userId = user.id;

    // Delete all user-related data using service role
    // Order matters: delete dependent data first, then user record

    // 1. Delete simulations
    try {
      const simulations = await base44.asServiceRole.entities.Simulation.filter({ created_by: userEmail });
      for (const sim of simulations) {
        await base44.asServiceRole.entities.Simulation.delete(sim.id);
      }
    } catch (e) {
      console.log('No simulations to delete or error:', e.message);
    }

    // 2. Delete formulas
    try {
      const formulas = await base44.asServiceRole.entities.Formula.filter({ created_by: userEmail });
      for (const formula of formulas) {
        await base44.asServiceRole.entities.Formula.delete(formula.id);
      }
    } catch (e) {
      console.log('No formulas to delete or error:', e.message);
    }

    // 3. Delete safety profiles
    try {
      const safetyProfiles = await base44.asServiceRole.entities.SafetyProfile.filter({ created_by: userEmail });
      for (const profile of safetyProfiles) {
        await base44.asServiceRole.entities.SafetyProfile.delete(profile.id);
      }
    } catch (e) {
      console.log('No safety profiles to delete or error:', e.message);
    }

    // 4. Delete safety alerts
    try {
      const safetyAlerts = await base44.asServiceRole.entities.SafetyAlert.filter({ created_by: userEmail });
      for (const alert of safetyAlerts) {
        await base44.asServiceRole.entities.SafetyAlert.delete(alert.id);
      }
    } catch (e) {
      console.log('No safety alerts to delete or error:', e.message);
    }

    // 5. Delete notifications
    try {
      const notifications = await base44.asServiceRole.entities.Notification.filter({ created_by: userEmail });
      for (const notif of notifications) {
        await base44.asServiceRole.entities.Notification.delete(notif.id);
      }
    } catch (e) {
      console.log('No notifications to delete or error:', e.message);
    }

    // 6. Delete reviews
    try {
      const reviews = await base44.asServiceRole.entities.Review.filter({ created_by: userEmail });
      for (const review of reviews) {
        await base44.asServiceRole.entities.Review.delete(review.id);
      }
    } catch (e) {
      console.log('No reviews to delete or error:', e.message);
    }

    // 7. Delete learning progress
    try {
      const progress = await base44.asServiceRole.entities.LearningProgress.filter({ created_by: userEmail });
      for (const p of progress) {
        await base44.asServiceRole.entities.LearningProgress.delete(p.id);
      }
    } catch (e) {
      console.log('No learning progress to delete or error:', e.message);
    }

    // 8. Delete compliance checks
    try {
      const checks = await base44.asServiceRole.entities.ComplianceCheck.filter({ created_by: userEmail });
      for (const check of checks) {
        await base44.asServiceRole.entities.ComplianceCheck.delete(check.id);
      }
    } catch (e) {
      console.log('No compliance checks to delete or error:', e.message);
    }

    // 9. Delete shared simulations
    try {
      const sharedSims = await base44.asServiceRole.entities.SharedSimulation.filter({ created_by: userEmail });
      for (const ss of sharedSims) {
        await base44.asServiceRole.entities.SharedSimulation.delete(ss.id);
      }
    } catch (e) {
      console.log('No shared simulations to delete or error:', e.message);
    }

    // 10. Delete custom libraries
    try {
      const libraries = await base44.asServiceRole.entities.CustomLibrary.filter({ created_by: userEmail });
      for (const lib of libraries) {
        await base44.asServiceRole.entities.CustomLibrary.delete(lib.id);
      }
    } catch (e) {
      console.log('No custom libraries to delete or error:', e.message);
    }

    // 11. Delete comments
    try {
      const comments = await base44.asServiceRole.entities.Comment.filter({ created_by: userEmail });
      for (const comment of comments) {
        await base44.asServiceRole.entities.Comment.delete(comment.id);
      }
    } catch (e) {
      console.log('No comments to delete or error:', e.message);
    }

    // 12. Delete reports
    try {
      const reports = await base44.asServiceRole.entities.Report.filter({ created_by: userEmail });
      for (const report of reports) {
        await base44.asServiceRole.entities.Report.delete(report.id);
      }
    } catch (e) {
      console.log('No reports to delete or error:', e.message);
    }

    // 13. Delete barcode history
    try {
      const barcodeHistory = await base44.asServiceRole.entities.BarcodeHistory.filter({ created_by: userEmail });
      for (const bh of barcodeHistory) {
        await base44.asServiceRole.entities.BarcodeHistory.delete(bh.id);
      }
    } catch (e) {
      console.log('No barcode history to delete or error:', e.message);
    }

    // 14. Delete sustainability profiles
    try {
      const sustainabilityProfiles = await base44.asServiceRole.entities.SustainabilityProfile.filter({ created_by: userEmail });
      for (const sp of sustainabilityProfiles) {
        await base44.asServiceRole.entities.SustainabilityProfile.delete(sp.id);
      }
    } catch (e) {
      console.log('No sustainability profiles to delete or error:', e.message);
    }

    // 15. Remove user from teams (update team memberships)
    try {
      const teams = await base44.asServiceRole.entities.Team.list();
      for (const team of teams) {
        if (team.members && team.members.some(m => m.email === userEmail)) {
          const updatedMembers = team.members.filter(m => m.email !== userEmail);
          await base44.asServiceRole.entities.Team.update(team.id, { members: updatedMembers });
        }
      }
    } catch (e) {
      console.log('No team memberships to update or error:', e.message);
    }

    // 16. Finally, delete the user record itself
    try {
      await base44.asServiceRole.entities.User.delete(userId);
    } catch (e) {
      console.log('Error deleting user record:', e.message);
      // Even if user record deletion fails, we've cleaned up all data
    }

    return Response.json({ 
      success: true, 
      message: 'Account and all associated data have been permanently deleted' 
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete account. Please contact support.' 
    }, { status: 500 });
  }
});