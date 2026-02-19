import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CommentListSummary, BulkCommentResult } from '@/backend';

export function useGetAvailableCommentLists() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['availableCommentLists'],
    queryFn: async () => {
      if (!actor) return [];
      console.log('[useCommentGenerator] Fetching available comment lists...');
      const lists = await actor.getAvailableCommentLists();
      console.log('[useCommentGenerator] Fetched lists:', lists);
      return lists;
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetCommentListSummary(listName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CommentListSummary | null>({
    queryKey: ['commentListSummary', listName],
    queryFn: async () => {
      if (!actor || !listName) return null;
      console.log('[useCommentGenerator] Fetching summary for list:', listName);
      const summary = await actor.getCommentListSummary(listName);
      console.log('[useCommentGenerator] Summary:', summary);
      return summary;
    },
    enabled: !!actor && !isFetching && !!listName,
  });
}

export function useGetBulkKeyStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<{ hasKey: boolean }>({
    queryKey: ['bulkKeyStatus'],
    queryFn: async () => {
      if (!actor) return { hasKey: false };
      console.log('[useCommentGenerator] Checking bulk key status...');
      const hasKey = await actor.hasBulkGeneratorKey();
      console.log('[useCommentGenerator] Bulk key status:', hasKey);
      return { hasKey };
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
      console.log('[useCommentGenerator] Generating single comment for list:', listName, 'deviceId:', deviceId);
      
      try {
        const comment = await actor.generateSingleComment(listName, deviceId);
        console.log('[useCommentGenerator] Generated comment:', comment);
        return comment;
      } catch (error: any) {
        console.error('[useCommentGenerator] Error generating comment:', error);
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('device can only generate one comment')) {
          throw new Error('You have already generated a comment from this list on this device');
        } else if (errorMessage.includes('List not found')) {
          throw new Error('The selected list was not found');
        } else if (errorMessage.includes('All comments')) {
          throw new Error('All comments in this list have been used');
        } else {
          throw new Error(errorMessage || 'Failed to generate comment');
        }
      }
    },
    onSuccess: (_, variables) => {
      console.log('[useCommentGenerator] Invalidating queries after comment generation');
      queryClient.invalidateQueries({ queryKey: ['commentListSummary', variables.listName] });
    },
    onError: (error) => {
      console.error('[useCommentGenerator] Mutation error:', error);
    },
  });
}

export function useGenerateBulkComments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, count, accessKey }: { listName: string; count: number; accessKey: string }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useCommentGenerator] Generating bulk comments:', { listName, count });
      
      try {
        const result = await actor.generateBulkComments(listName, BigInt(count), accessKey);
        console.log('[useCommentGenerator] Generated bulk comments:', result);
        return result;
      } catch (error: any) {
        console.error('[useCommentGenerator] Error generating bulk comments:', error);
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('Invalid access key')) {
          throw new Error('Invalid access key');
        } else if (errorMessage.includes('not configured')) {
          throw new Error('Bulk generator access key not configured');
        } else if (errorMessage.includes('List not found')) {
          throw new Error('The selected list was not found');
        } else if (errorMessage.includes('No available comments')) {
          throw new Error('No available comments in this list');
        } else {
          throw new Error(errorMessage || 'Failed to generate comments');
        }
      }
    },
    onSuccess: (_, variables) => {
      console.log('[useCommentGenerator] Invalidating queries after bulk generation');
      queryClient.invalidateQueries({ queryKey: ['commentListSummary', variables.listName] });
    },
    onError: (error) => {
      console.error('[useCommentGenerator] Mutation error:', error);
    },
  });
}
