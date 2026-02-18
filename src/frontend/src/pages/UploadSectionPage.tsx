import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Image, CheckCircle } from 'lucide-react';
import { useUploadRatingImage } from '@/hooks/useRatingImages';
import { ExternalBlob } from '@/backend';
import { toast } from 'sonner';

export default function UploadSectionPage() {
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadRatingImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!uploaderName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadMutation.mutateAsync({
        uploaderName: uploaderName.trim(),
        image: blob,
      });

      setUploadSuccess(true);
      setUploaderName('');
      setSelectedFile(null);
      setUploadProgress(0);
      toast.success('Image uploaded successfully!');

      // Reset form after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Upload Section</h1>
        <p className="text-gray-600 text-lg">Upload your rating image with your name</p>
      </div>

      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Upload Rating Image</CardTitle>
              <CardDescription>Upload your rating image with your name</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadSuccess ? (
            <div className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Successful!</h3>
              <p className="text-gray-600">Your rating image has been uploaded successfully.</p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="uploader-name">Your Name</Label>
                <Input
                  id="uploader-name"
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Enter your name..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="image-file">Select Image</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1.5"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-400 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!uploaderName.trim() || !selectedFile || uploadMutation.isPending}
                className="w-full btn-gradient"
              >
                <Image className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
