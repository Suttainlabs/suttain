import {useQuery} from '@tanstack/react-query';
import {getComputeEngines} from '@/functions/getComputeEngines';
export default function useEngineRegistry() {
  return useQuery({queryKey:['compute-engine-registry-md'],queryFn:async()=> (await getComputeEngines({})).data,staleTime:300000});
}