import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Key, CheckCircle2, Loader2, ExternalLink, AlertCircle, Trash2 } from "lucide-react";

export default function QuantumSettings() {
  const [token, setToken] = useState("");
  const [savedSetting, setSavedSetting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const settings = await base44.entities.QuantumSetting.list();
      if (settings && settings.length > 0) {
        setSavedSetting(settings[0]);
        setToken(settings[0].ibm_quantum_token || "");
      }
    } catch (e) {
      console.error("Failed to load quantum settings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      if (savedSetting) {
        await base44.entities.QuantumSetting.update(savedSetting.id, {
          ibm_quantum_token: token.trim(),
        });
      } else {
        const newSetting = await base44.entities.QuantumSetting.create({
          ibm_quantum_token: token.trim(),
        });
        setSavedSetting(newSetting);
      }
    } catch (e) {
      setError(e.message || "Failed to save token");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!savedSetting) return;
    setIsSaving(true);
    setError(null);
    try {
      await base44.entities.QuantumSetting.delete(savedSetting.id);
      setSavedSetting(null);
      setToken("");
    } catch (e) {
      setError(e.message || "Failed to remove token");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading quantum settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-200 bg-indigo-50/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Quantum Settings</h3>
          {savedSetting && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold ml-auto">
              <CheckCircle2 className="w-3 h-3" /> Token set
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Get a free token at{" "}
          <a
            href="https://quantum.cloud.ibm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
          >
            quantum.cloud.ibm.com <ExternalLink className="w-3 h-3" />
          </a>
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              IBM Quantum API Token
            </label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your IBM Quantum API token..."
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !token.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              {savedSetting ? "Update Token" : "Save Token"}
            </Button>
            {savedSetting && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={isSaving}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your token is stored securely per your account and only used for IBM Quantum
            hardware runs. The local Qiskit simulator works without a token.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}