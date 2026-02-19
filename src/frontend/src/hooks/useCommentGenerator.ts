import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetAvailableCommentLists() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['commentLists'],
    queryFn: async () => {
      if (!actor) {
        console.warn('[useCommentGenerator] Actor not available for getAvailableCommentLists');
        return [];
      }
      console.log('[useCommentGenerator] Fetching available comment lists...');
      const lists = await actor.getAvailableCommentLists();
      console.log('[useCommentGenerator] Fetched lists:', lists);
      return lists;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateSingleComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, deviceId }: { listName: string; deviceId: string }) => {
      if (!actor) {
        console.error('[useCommentGenerator] Actor not available for generateSingleComment');
        throw new Error('Actor not available');
      }
      console.log('[useCommentGenerator] Generating single comment:', { listName, deviceId });
      const comment = await actor.generateSingleComment(listName, deviceId);
      console.log('[useCommentGenerator] Single comment generated:', comment);
      return comment;
    },
    onSuccess: (data, variables) => {
      console.log('[useCommentGenerator] Single comment generation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['commentLists'] });
    },
    onError: (error) => {
      console.error('[useCommentGenerator] Single comment generation failed:', error);
    },
  });
}

export function useGenerateBulkComments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, count, accessKey }: { listName: string; count: number; accessKey: string }) => {
      if (!actor) {
        console.error('[useCommentGenerator] Actor not available for generateBulkComments');
        throw new Error('Actor not available');
      }
      console.log('[useCommentGenerator] Generating bulk comments:', { listName, count, accessKey: '***' });
      const result = await actor.generateBulkComments(listName, BigInt(count), accessKey);
      console.log('[useCommentGenerator] Bulk comments generated:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[useCommentGenerator] Bulk comment generation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['commentLists'] });
    },
    onError: (error) => {
      console.error('[useCommentGenerator] Bulk comment generation failed:', error);
    },
  });
}

export function useGetBulkKeyStatus() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['bulkKeyStatus'],
    queryFn: async () => {
      if (!actor) {
        console.warn('[useCommentGenerator] Actor not available for getBulkKeyStatus');
        return { hasKey: false, maskedKey: null };
      }
      console.log('[useCommentGenerator] Fetching bulk key status...');
      const hasKey = await actor.hasBulkGeneratorKey();
      const maskedKey = hasKey ? await actor.getBulkGeneratorKeyMasked() : null;
      console.log('[useCommentGenerator] Bulk key status:', { hasKey, maskedKey });
      return { hasKey, maskedKey };
    },
    enabled: !!actor && !isFetching,
  });
}
