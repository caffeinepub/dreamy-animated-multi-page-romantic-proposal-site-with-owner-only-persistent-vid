import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetAvailableCommentLists() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['commentLists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableCommentLists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateSingleComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, deviceId }: { listName: string; deviceId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateSingleComment(listName, deviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentLists'] });
    },
  });
}

export function useGenerateBulkComments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, count, accessKey }: { listName: string; count: number; accessKey: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateBulkComments(listName, BigInt(count), accessKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentLists'] });
    },
  });
}

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
