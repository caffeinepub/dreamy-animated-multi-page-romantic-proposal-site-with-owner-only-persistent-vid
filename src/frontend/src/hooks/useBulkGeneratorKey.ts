import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetBulkKeyStatus() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['bulkKeyStatus'],
    queryFn: async () => {
      if (!actor) return { hasKey: false, maskedKey: null };
      const hasKey = await actor.hasBulkGeneratorKey();
      const maskedKey = hasKey ? await actor.getBulkGeneratorKeyMasked() : null;
      return { hasKey, maskedKey };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetBulkGeneratorKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newKey: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setBulkGeneratorKey(newKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulkKeyStatus'] });
    },
  });
}

export function useResetBulkGeneratorKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetBulkGeneratorKey();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulkKeyStatus'] });
    },
  });
}
