import { base44 } from '@/api/base44Client';

/**
 * Translates dynamic content (chemical descriptions, safety data, research summaries)
 * into the user's selected language using the translateContent backend function.
 *
 * @param {string} content - The English text to translate
 * @param {string} targetLanguage - ISO code: 'en', 'hi', 'sw', 'es'
 * @param {string} contentType - Optional context type (e.g. 'chemical_description', 'safety_classification')
 * @returns {Promise<string>} - The translated text
 */
export async function translateDynamicContent(content, targetLanguage, contentType) {
  if (!content || targetLanguage === 'en') return content;

  try {
    const res = await base44.functions.invoke('translateContent', {
      content,
      target_language: targetLanguage,
      content_type: contentType,
    });
    return res.data?.translated || content;
  } catch (err) {
    console.debug('Translation fallback (returning English):', err.message);
    return content;
  }
}