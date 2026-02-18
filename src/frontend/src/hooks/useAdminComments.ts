import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Comment, BulkCommentTotals } from '@/backend';

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
      return actor.createCommentList(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentLists'] });
      queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useAddSingleComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, comment }: { listName: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSingleComment(listName, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commentList', variables.listName] });
      queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useBulkUploadComments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, comments }: { listName: string; comments: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkUploadComments(listName, comments);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commentList', variables.listName] });
      queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listName, comment }: { listName: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComment(listName, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commentList', variables.listName] });
      queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useResetList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetList(listName);
    },
    onSuccess: (_, listName) => {
      queryClient.invalidateQueries({ queryKey: ['commentList', listName] });
      queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
    },
  });
}

export function useDeleteList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteList(listName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentLists'] });
      queryClient.invalidateQueries({ queryKey: ['bulkCommentTotals'] });
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
