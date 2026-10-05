import { useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AuthContext from '@/components/auth/AuthContext';
import { manageResearchApiKeys } from '@/functions/manageResearchApiKeys';
export default function useApiKeys() {
 const {user,isAuthLoading}=useContext(AuthContext), cache=useQueryClient();
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[secret,setSecret]=useState('');
 const key=['research-api-keys',user?.id];
 const query=useQuery({queryKey:key,queryFn:async()=> (await manageResearchApiKeys({action:'list'})).data,enabled:!!user,refetchInterval:30000});
 async function action(payload) {
  setBusy(true);setError('');
  try {const response=await manageResearchApiKeys(payload);if(response.data.error) throw new Error(response.data.error);await cache.invalidateQueries({queryKey:key});if(response.data.secret) setSecret(response.data.secret);return response.data;}
  catch(e){setError(e.response?.data?.error || e.message);return null;}finally{setBusy(false);}
 }
 return {user,isAuthLoading,...query,queryError:query.error,busy,error,secret,setSecret,action};
}