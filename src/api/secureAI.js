import { base44 } from '@/api/base44Client';

// Browser-side wrappers for AI and email features. They call the secureAIAssist
// backend function (login required, per-user daily caps) instead of Base44's
// built-in integrations directly, so those integrations can stay closed to the
// browser. Signatures match the old '@/integrations/Core' functions.
async function call(payload) {
  try {
    const res = await base44.functions.invoke('secureAIAssist', payload);
    return res.data;
  } catch (error) {
    const message = error?.response?.data?.error || error?.message || 'Request failed';
    const wrapped = new Error(message);
    wrapped.status = error?.response?.status;
    throw wrapped;
  }
}

export async function InvokeLLM(params = {}) {
  const data = await call({ action: 'invoke_llm', ...params });
  return data?.result;
}

export async function ExtractDataFromUploadedFile(params = {}) {
  const data = await call({ action: 'extract_data', ...params });
  return data?.result;
}

export async function notifyEnterpriseWaitlist(details = {}) {
  return call({ action: 'waitlist_notification', ...details });
}
