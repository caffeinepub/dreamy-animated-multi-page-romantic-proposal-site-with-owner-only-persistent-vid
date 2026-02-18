import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { useGetAllRatingImages, useDeleteRatingImage } from '@/hooks/useRatingImages';
import { toast } from 'sonner';

export default function AdminImagesTab() {
  const { data: images = [], isLoading } = useGetAllRatingImages();
  const deleteMutation = useDeleteRatingImage();

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(index);
      toast.success('Image deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Uploaded Rating Images</CardTitle>
              <CardDescription>View and manage uploaded rating images</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">Loading images...</p>
          ) : images.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={image.imageBlob.getDirectURL()}
                      alt={`Uploaded by ${image.uploaderName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-gray-900 mb-1">{image.uploaderName}</p>
                    <p className="text-sm text-gray-600 mb-3">{formatDate(image.uploadTime)}</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(index)}
                      disabled={deleteMutation.isPending}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
