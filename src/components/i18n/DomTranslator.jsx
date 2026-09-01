import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from './LanguageContext';

/**
 * Global runtime translator.
 *
 * When a non-English language is active, this walks the live DOM text nodes
 * and translates their English content via the `translateContent` backend
 * (batched + cached in localStorage). It covers every page without per-page
 * wiring. English is left untouched; switching back to English restores
 * originals.
 */

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'CODE', 'PRE',
  'KBD', 'SAMP', 'NOSCRIPT', 'OBJECT', 'IFRAME', 'SVG',
]);
const MIN_LEN = 3;
const HAS_LETTER = /[A-Za-z\u00C0-\u024F\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/;

// lang -> Map<englishText, translatedText>
const caches = {};
// TextNode -> { original, appliedLang, appliedValue }
const nodeMeta = new WeakMap();

let observer = null;
let scanTimer = null;
let flushTimer = null;
let pending = new Map(); // englishText -> Set<TextNode>
let activeLang = 'en';

function getCache(lang) {
  return caches[lang] || (caches[lang] = loadCache(lang));
}

// Set of already-produced translations per language, so we never re-translate
// text that is itself a translation output (e.g. dictionary-managed shell
// strings or our own applied values).
const producedSets = {};
function getProduced(lang) {
  if (!producedSets[lang]) {
    const s = new Set();
    for (const v of getCache(lang).values()) s.add(v);
    producedSets[lang] = s;
  }
  return producedSets[lang];
}

function loadCache(lang) {
  const m = new Map();
  try {
    const raw = localStorage.getItem(`suttain_tr_${lang}`);
    if (raw) {
      for (const [k, v] of JSON.parse(raw)) m.set(k, v);
    }
  } catch (_) { /* ignore */ }
  caches[lang] = m;
  return m;
}

function persistCache(lang) {
  try {
    localStorage.setItem(`suttain_tr_${lang}`, JSON.stringify([...getCache(lang).entries()]));
  } catch (_) { /* quota, ignore */ }
}

function shouldSkip(node) {
  let p = node.parentElement;
  while (p) {
    if (SKIP_TAGS.has(p.tagName)) return true;
    if (p.isContentEditable) return true;
    if (p.getAttribute && (p.getAttribute('data-no-translate') !== null || p.getAttribute('translate') === 'no')) return true;
    p = p.parentElement;
  }
  return false;
}

function collectTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const v = node.nodeValue;
      if (!v || v.trim().length < MIN_LEN) return NodeFilter.FILTER_REJECT;
      if (!HAS_LETTER.test(v)) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const out = [];
  let n;
  while ((n = walker.nextNode())) out.push(n);
  return out;
}

function queueText(text, node) {
  let set = pending.get(text);
  if (!set) { set = new Set(); pending.set(text, set); }
  set.add(node);
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 200);
}

async function flush() {
  flushTimer = null;
  const batch = pending;
  pending = new Map();
  if (!batch.size) return;

  const texts = [...batch.keys()];
  const toFetch = texts.filter((t) => !getCache(activeLang).has(t));

  if (toFetch.length) {
    try {
      const res = await base44.functions.invoke('translateContent', {
        content: toFetch,
        target_language: activeLang,
      });
      const map = (res && res.translated) || {};
      toFetch.forEach((t) => {
        const tr = map[t] || t;
        getCache(activeLang).set(t, tr);
        getProduced(activeLang).add(tr);
      });
      persistCache(activeLang);
    } catch (_) {
      toFetch.forEach((t) => getCache(activeLang).set(t, t)); // fall back to English
    }
  }

  // Apply to queued nodes whose value is still the original.
  for (const [text, nodes] of batch) {
    const tr = getCache(activeLang).get(text) || text;
    for (const node of nodes) {
      if (!node.isConnected) continue;
      const meta = nodeMeta.get(node);
      if (meta && node.nodeValue === text) {
        node.nodeValue = tr;
        meta.appliedValue = tr;
        meta.appliedLang = activeLang;
      }
    }
  }
}

function processNode(node) {
  const v = node.nodeValue;
  if (!v) return;
  // Skip text that is itself already a translation output for this language.
  if (getProduced(activeLang).has(v)) return;
  const meta = nodeMeta.get(node);
  // Already translated for this language and untouched?
  if (meta && meta.appliedLang === activeLang && v === meta.appliedValue) return;

  // React reset it back to the original English → re-apply cached if available.
  if (meta && v === meta.original) {
    const tr = getCache(activeLang).get(v);
    if (tr) {
      node.nodeValue = tr;
      meta.appliedValue = tr;
      meta.appliedLang = activeLang;
    } else {
      queueText(v, node);
    }
    return;
  }

  // New or changed text, treat current value as the English source.
  const original = v;
  nodeMeta.set(node, { original, appliedLang: null, appliedValue: null });
  const tr = getCache(activeLang).get(original);
  if (tr) {
    node.nodeValue = tr;
    nodeMeta.get(node).appliedValue = tr;
    nodeMeta.get(node).appliedLang = activeLang;
  } else {
    queueText(original, node);
  }
}

function scan() {
  if (activeLang === 'en') return;
  for (const node of collectTextNodes()) processNode(node);
}

function scheduleScan() {
  if (activeLang === 'en') return;
  if (scanTimer) return;
  scanTimer = setTimeout(() => {
    scanTimer = null;
    scan();
  }, 150);
}

function restoreEnglish() {
  // Restore every translated text node back to its English original.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) {
    const meta = nodeMeta.get(node);
    if (meta && meta.appliedValue && node.nodeValue === meta.appliedValue) {
      node.nodeValue = meta.original;
    }
  }
}

export default function DomTranslator() {
  const { language } = useI18n();

  useEffect(() => {
    activeLang = language;

    if (language === 'en') {
      if (observer) { observer.disconnect(); observer = null; }
      restoreEnglish();
      return;
    }

    // Switching languages: restore English originals first so we translate the
    // source text (not a previous translation) into the new language.
    restoreEnglish();

    // Initial pass + a couple of follow-ups for late-rendered content.
    scan();
    const t1 = setTimeout(scan, 600);
    const t2 = setTimeout(scan, 1800);

    observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (observer) { observer.disconnect(); observer = null; }
    };
  }, [language]);

  return null;
}