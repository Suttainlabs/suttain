import { base44 } from '@/api/base44Client';

export async function createSupervisorApprovalRequest(payload) {
  return await base44.functions.invoke('createSupervisorApprovalRequest', payload);
}