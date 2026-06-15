import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Tag, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Deterministic color per tag based on its text
const TAG_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
];

export const getTagColor = (tag, allTags) => {
  const idx = allTags.indexOf(tag);
  return TAG_COLORS[(idx >= 0 ? idx : tag.charCodeAt(0)) % TAG_COLORS.length];
};

export default function TagManagerModal({ chemical, onClose, onTagsUpdated, existingAllTags }) {
  const chemId = chemical.id || `pubchem_${chemical._pubchem_cid}`;
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  useEffect(() => {
    // Load existing tags for this chemical
    base44.entities.ChemicalTag.filter({ chemical_id: chemId })
      .then(records => {
        if (records && records.length > 0) {
          setExistingRecord(records[0]);
          setTags(records[0].tags || []);
        }
      })
      .catch(() => {});
  }, [chemId]);

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags(prev => [...prev, trimmed]);
    setInput("");
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingRecord) {
        await base44.entities.ChemicalTag.update(existingRecord.id, { tags });
      } else {
        await base44.entities.ChemicalTag.create({
          chemical_id: chemId,
          chemical_name: chemical.name,
          tags,
        });
      }
      onTagsUpdated(chemId, tags);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const allSuggestions = existingAllTags.filter(t => !tags.includes(t));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-base">Manage Tags</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Tagging <span className="font-semibold text-slate-700">{chemical.name}</span>. Tags are private to your account.
        </p>

        {/* Tag input area */}
        <div className="flex flex-wrap gap-1.5 min-h-[44px] border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-violet-400 focus-within:border-violet-400 transition-all">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-violet-400 hover:text-violet-700 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={tags.length === 0 ? "Type a tag, press Enter or comma..." : ""}
            className="flex-1 min-w-[120px] outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
          />
        </div>

        {/* Existing tags from library */}
        {allSuggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Your existing tags</p>
            <div className="flex flex-wrap gap-1.5">
              {allSuggestions.map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  <Plus className="w-3 h-3" /> {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 font-semibold">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : "Save tags"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}