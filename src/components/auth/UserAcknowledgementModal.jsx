import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User } from "@/entities/User";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

export default function UserAcknowledgementModal({ isOpen, onClose }) {
  const [generatorCategory, setGeneratorCategory] = useState("");
  const [simulatorCategory, setSimulatorCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAcknowledge = async () => {
    if (!generatorCategory || !simulatorCategory) {
      alert("Please select a category for both features.");
      return;
    }
    setIsSaving(true);
    try {
      const currentUser = await base44.auth.me();
      
      // Track successful signup completion
      base44.analytics.track({
        eventName: 'signup_completed',
        properties: {
          generator_category: generatorCategory,
          simulator_category: simulatorCategory
        }
      });
      
      await User.updateMyUserData({
        first_login: false,
        generator_category: generatorCategory,
        simulator_category: simulatorCategory
      });

      // Create in-app notification for admins about new user signup
      await base44.entities.Notification.create({
        title: 'New User Signup',
        message: `${currentUser.full_name || currentUser.email} has just signed up for Suttain.`,
        type: 'user_signup',
        severity: 'info',
        target_user: 'admin',
        metadata: {
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          generator_category: generatorCategory,
          simulator_category: simulatorCategory
        }
      });

      // Send welcome email to user and notification to admin via Resend
      try {
        await base44.functions.invoke('sendEmailResend', {
          type: 'welcome',
          data: {
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            generatorCategory,
            simulatorCategory
          }
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      // Send Slack notification to team
      try {
        await base44.functions.invoke('sendSlackNotification', {
          channel: '#all-suttain',
          type: 'new_user',
          data: {
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            generatorCategory,
            simulatorCategory
          }
        });
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save user preferences:", error);
      alert("Could not save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Suttain!</DialogTitle>
          <DialogDescription>
            Before you begin, please acknowledge our terms and tell us a bit about yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800">User Agreement</h3>
            <div className="text-sm p-4 bg-slate-50 rounded-lg max-h-32 overflow-y-auto space-y-2">
              <p>
                By using Suttain, you agree to formulate responsibly and accept that our tools are for informational purposes.
                All real-world product decisions are your responsibility.
              </p>
              <p>
                You must validate critical decisions with expert review or lab testing and follow all applicable regulations for manufacturing and labeling.
              </p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="generator-category">How will you primarily use the <span className="font-semibold">Formula Generator</span>?</Label>
              <Select value={generatorCategory} onValueChange={setGeneratorCategory}>
                <SelectTrigger id="generator-category">
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual / DIY</SelectItem>
                  <SelectItem value="business">Business / Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simulator-category">Which best describes you for the <span className="font-semibold">Chemical Simulator</span>?</Label>
              <Select value={simulatorCategory} onValueChange={setSimulatorCategory}>
                <SelectTrigger id="simulator-category">
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diy">DIY / Hobbyist</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="teacher">STEM Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="household">Household User</SelectItem>
                  <SelectItem value="business">Small Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>
        <Button onClick={handleAcknowledge} className="w-full" disabled={isSaving || !generatorCategory || !simulatorCategory}>
          {isSaving ? "Saving..." : "Acknowledge & Continue"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}