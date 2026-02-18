import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { RatingImage, ExternalBlob } from '@/backend';

export function useUploadRatingImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uploaderName, image }: { uploaderName: string; image: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadRatingImage(uploaderName, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratingImages'] });
    },
  });
}

export function useGetAllRatingImages() {
  const { actor, isFetching } = useActor();

  return useQuery<RatingImage[]>({
    queryKey: ['ratingImages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRatingImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteRatingImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteRatingImage(BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratingImages'] });
    },
  });
}
