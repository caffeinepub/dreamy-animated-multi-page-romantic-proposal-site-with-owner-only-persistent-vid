import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Comment, BulkCommentTotals } from '@/backend';

export function useGetAvailableCommentLists() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['availableCommentLists'],
    queryFn: async () => {
      if (!actor) return [];
      console.log('[useAdminComments] Fetching available comment lists...');
      const lists = await actor.getAvailableCommentLists();
      console.log('[useAdminComments] Fetched lists:', lists);
      return lists;
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetCommentList(listName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['commentList', listName],
    queryFn: async () => {
      if (!actor || !listName) return [];
      const result = await actor.getCommentList(listName);
      return result || [];
    },
    enabled: !!actor && !isFetching && !!listName,
  });
}

export function useCreateCommentList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useAdminComments] Creating comment list:', name);
      
      try {
        await actor.createCommentList(name);
        console.log('[useAdminComments] List created successfully');
      } catch (error: any) {
        console.error('[useAdminComments] Backend error:', error);
        // Extract meaningful error message from backend trap
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('already exists')) {
          throw new Error('A list with this name already exists');
        } else if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to create lists');
        } else {
          throw new Error(errorMessage || 'Failed to create list');
        }
      }
    },
    onSuccess: async () => {
      console.log('[useAdminComments] Invalidating queries after list creation');
      // Invalidate and refetch immediately
      await queryClient.invalidateQueries({ queryKey: ['availableCommentLists'] });
      await queryClient.refetchQueries({ queryKey: ['availableCommentLists'] });
      await queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
    onError: (error) => {
      console.error('[useAdminComments] Error creating list:', error);
    },
  });
}

export function useAddSingleComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, comment }: { listName: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.addSingleComment(listName, comment);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage || 'Failed to add comment');
      }
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['commentList', variables.listName] });
      await queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useBulkUploadComments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, comments }: { listName: string; comments: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.bulkUploadComments(listName, comments);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage || 'Failed to upload comments');
      }
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['commentList', variables.listName] });
      await queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, comment }: { listName: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteComment(listName, comment);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage || 'Failed to delete comment');
      }
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['commentList', variables.listName] });
      await queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useResetList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listName: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.resetList(listName);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage || 'Failed to reset list');
      }
    },
    onSuccess: async (_, listName) => {
      await queryClient.invalidateQueries({ queryKey: ['commentList', listName] });
      await queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useDeleteList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listName: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteList(listName);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage || 'Failed to delete list');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['availableCommentLists'] });
      await queryClient.refetchQueries({ queryKey: ['availableCommentLists'] });
      await queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useGetBulkCommentTotals() {
  const { actor, isFetching } = useActor();

  return useQuery<BulkCommentTotals>({
    queryKey: ['bulkCommentTotals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBulkCommentTotals();
    },
    enabled: !!actor && !isFetching,
  });
}
