import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { LiveListCheckSummary } from '@/backend';

export function useGetAvailableLiveListApps() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['liveListApps'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableLiveListApps();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckLiveList() {
  const { actor } = useActor();

  return useMutation<LiveListCheckSummary, Error, string[]>({
    mutationFn: async (usernames: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkLiveList(usernames);
    },
  });
}

// Admin mutations
export function useAddLiveListApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (appName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLiveListApp(appName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveListApps'] });
    },
  });
}

export function useAddUsernamesToApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { appName: string; usernames: string[] }>({
    mutationFn: async ({ appName, usernames }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addUsernamesToApp(appName, usernames);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveListApps'] });
    },
  });
}

export function useDeleteLiveListApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (appName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLiveListApp(appName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveListApps'] });
    },
  });
}

export function useResetUsernamesForApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (appName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetUsernamesForApp(appName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveListApps'] });
    },
  });
}

export function useResetAllLiveListApps() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetAllLiveListApps();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveListApps'] });
    },
  });
}
