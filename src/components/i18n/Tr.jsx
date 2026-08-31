import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from './LanguageContext';

/**
 * Runtime translation of arbitrary English UI strings.
 *
 * Strings are translated via the `translateContent` backend function (batched),
 * and cached per-language in localStorage so they only translate once.
 * English is passed through unchanged.
 */

const cache = {}; // lang -> Map<text, translation>
const queues = {}; // lang -> [{ text, cb }]
const timers = {};

function loadLangCache(lang) {
  if (cache[lang]) return cache[lang];
  let m = new Map();
  try {
    const raw = localStorage.getItem(`suttain_tr_${lang}`);
    if (raw) m = new Map(JSON.parse(raw));
  } catch (_) {
    /* ignore corrupt cache */
  }
  cache[lang] = m;
  return m;
}

function persistLangCache(lang) {
  try {
    localStorage.setItem(`suttain_tr_${lang}`, JSON.stringify([...loadLangCache(lang).entries()]));
  } catch (_) {
    /* quota / private mode — ignore */
  }
}

function getCached(lang, text) {
  return loadLangCache(lang).get(text);
}

function setCached(lang, text, translated) {
  loadLangCache(lang).set(text, translated);
  persistLangCache(lang);
}

function queueTranslation(lang, text, cb) {
  (queues[lang] = queues[lang] || []).push({ text, cb });
  if (timers[lang]) return;
  timers[lang] = setTimeout(() => flush(lang), 120);
}

async function flush(lang) {
  timers[lang] = null;
  const batch = queues[lang] || [];
  queues[lang] = [];
  if (!batch.length) return;

  const toFetch = [...new Set(batch.map((b) => b.text))].filter((t) => !getCached(lang, t));
  if (toFetch.length) {
    try {
      const res = await base44.functions.invoke('translateContent', {
        content: toFetch,
        target_language: lang,
      });
      const map = (res && res.translated) || {};
      toFetch.forEach((t) => setCached(lang, t, map[t] || t));
    } catch (_) {
      // On failure, fall back to the original English so UI still renders.
      toFetch.forEach((t) => setCached(lang, t, t));
    }
  }
  batch.forEach(({ text, cb }) => cb(getCached(lang, text) || text));
}

/**
 * Translates its English string children into the active language.
 * Shows the English text immediately, then swaps in the translation once ready.
 *
 * Usage: <Tr>One platform. Two ways to work.</Tr>
 */
export default function Tr({ children }) {
  const { language } = useI18n();
  const text = typeof children === 'string' ? children : String(children ?? '');
  const [out, setOut] = useState(text);

  useEffect(() => {
    setOut(text);
  }, [text]);

  useEffect(() => {
    if (!text) return;
    if (language === 'en') {
      setOut(text);
      return;
    }
    const cached = getCached(language, text);
    if (cached !== undefined) {
      setOut(cached);
      return;
    }
    let active = true;
    setOut(text); // show English meanwhile
    queueTranslation(language, text, (translated) => {
      if (active) setOut(translated);
    });
    return () => {
      active = false;
    };
  }, [language, text]);

  return <>{out}</>;
}