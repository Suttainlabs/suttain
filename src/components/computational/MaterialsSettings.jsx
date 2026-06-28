import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Key, CheckCircle2, Loader2, ExternalLink, AlertCircle, Trash2 } from "lucide-react";

export default function MaterialsSettings() {
  const [apiKey, setApiKey] = useState("");
  const [savedSetting, setSavedSetting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    try {
      const settings = await base44.entities.MaterialsSetting.list();
      if (settings && settings.length > 0) {
        setSavedSetting(settings[0]);
        setApiKey(settings[0].materials_project_api_key || "");
      }
    } catch (e) {
      console.error("Failed to load materials settings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      if (savedSetting) {
        await base44.entities.MaterialsSetting.update(savedSetting.id, {
          materials_project_api_key: apiKey.trim(),
        });
      } else {
        const newSetting = await base44.entities.MaterialsSetting.create({
          materials_project_api_key: apiKey.trim(),
        });
        setSavedSetting(newSetting);
      }
    } catch (e) {
      setError(e.message || "Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!savedSetting) return;
    setIsSaving(true);
    setError(null);
    try {
      await base44.entities.MaterialsSetting.delete(savedSetting.id);
      setSavedSetting(null);
      setApiKey("");
    } catch (e) {
      setError(e.message || "Failed to remove API key");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading materials settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm">Materials Settings</h3>
          {savedSetting && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold ml-auto">
              <CheckCircle2 className="w-3 h-3" /> API key set
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Get a free key at{" "}
          <a
            href="https://materialsproject.org/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline inline-flex items-center gap-0.5"
          >
            materialsproject.org <ExternalLink className="w-3 h-3" />
          </a>
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Materials Project API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Materials Project API key..."
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
              disabled={isSaving || !apiKey.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              {savedSetting ? "Update Key" : "Save Key"}
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
            Your key is stored securely per your account and only used for live
            Materials Project queries. OPTIMADE searches work without a key.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}