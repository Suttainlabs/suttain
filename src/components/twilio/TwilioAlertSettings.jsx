import React, { useState } from "react";
import { Bell, MessageCircle, Phone, Check, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function TwilioAlertSettings({ user }) {
  const [phone, setPhone] = useState(user?.twilio_phone || "");
  const [channel, setChannel] = useState(user?.twilio_channel || "whatsapp");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    if (!phone.match(/^\+[1-9]\d{7,14}$/)) {
      toast.error("Please enter a valid phone number in E.164 format (e.g. +15551234567)");
      return;
    }
    setSaving(true);
    try {
      await base44.auth.updateMe({ twilio_phone: phone, twilio_channel: channel, twilio_alerts_enabled: true });
      toast.success("Alert settings saved!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async () => {
    if (!phone.match(/^\+[1-9]\d{7,14}$/)) {
      toast.error("Save a valid phone number first");
      return;
    }
    setTesting(true);
    try {
      await base44.functions.invoke("sendTwilioAlert", {
        to: phone,
        channel,
        productName: "Test Product (Suttain Demo)",
        riskLevel: "high",
        regulatoryAlert: "Demo regulatory flag",
        reportUrl: "https://suttain.com/BarcodeScanner",
        flaggedIngredients: ["Formaldehyde", "Parabens", "SLS"]
      });
      toast.success(`Test alert sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}! Check your phone.`);
    } catch (err) {
      toast.error("Failed to send test alert: " + err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleDisable = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ twilio_alerts_enabled: false });
      toast.success("Alerts disabled");
    } catch {
      toast.error("Failed to disable alerts");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Real-Time Safety Alerts</h3>
          <p className="text-xs text-slate-500">Get SMS or WhatsApp alerts when a scanned product is High risk</p>
        </div>
      </div>

      {/* Channel Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setChannel("whatsapp")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            channel === "whatsapp"
              ? "bg-green-50 border-green-400 text-green-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
        <button
          onClick={() => setChannel("sms")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            channel === "sms"
              ? "bg-blue-50 border-blue-400 text-blue-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          SMS
        </button>
      </div>

      {/* Phone Input */}
      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">
          Phone Number <span className="text-slate-400">(E.164 format, e.g. +15551234567)</span>
        </label>
        <div className="flex gap-2">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+15551234567"
            className="flex-1"
          />
        </div>
      </div>

      {channel === "whatsapp" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
          <p className="font-semibold mb-1">📱 WhatsApp Setup</p>
          <p>First save your number below, then send <strong>"join [sandbox-keyword]"</strong> to <strong>+1 415 523 8886</strong> on WhatsApp to activate the Suttain bot.</p>
          <p className="mt-1">You can also ask the bot about ingredients! Send any ingredient name to get instant safety info.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
          {saving ? "Saving..." : (
            <><Check className="w-4 h-4 mr-1" /> Save Settings</>
          )}
        </Button>
        <Button onClick={handleTestAlert} disabled={testing} variant="outline" className="flex-1">
          {testing ? "Sending..." : (
            <><Bell className="w-4 h-4 mr-1" /> Test Alert</>
          )}
        </Button>
      </div>

      {user?.twilio_alerts_enabled && (
        <button
          onClick={handleDisable}
          className="w-full text-xs text-red-500 hover:text-red-700 flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" /> Disable all alerts
        </button>
      )}
    </div>
  );
}