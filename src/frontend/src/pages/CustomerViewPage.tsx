import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Zap, Copy, Check, Shield, AlertCircle } from 'lucide-react';
import { useGetAvailableCommentLists, useGenerateSingleComment, useGenerateBulkComments, useGetBulkKeyStatus } from '@/hooks/useCommentGenerator';
import { useAdminToken } from '@/hooks/useAdminToken';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import Rotating3DObject from '@/components/Rotating3DObject';
import { getDeviceId, isListUsedForSingleGeneration, markListAsUsedForSingleGeneration } from '@/lib/deviceId';

export default function CustomerViewPage() {
  const [selectedListSingle, setSelectedListSingle] = useState('');
  const [selectedListBulk, setSelectedListBulk] = useState('');
  const [bulkCount, setBulkCount] = useState('5');
  const [accessKey, setAccessKey] = useState('');
  const [singleComment, setSingleComment] = useState('');
  const [bulkComments, setBulkComments] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [adminCode, setAdminCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [singleGeneratorDisabled, setSingleGeneratorDisabled] = useState(false);
  const [singleGeneratorError, setSingleGeneratorError] = useState('');

  const { data: commentLists = [], isLoading: listsLoading } = useGetAvailableCommentLists();
  const { data: keyStatus } = useGetBulkKeyStatus();
  const generateSingle = useGenerateSingleComment();
  const generateBulk = useGenerateBulkComments();
  const { setAdminAccess } = useAdminToken();
  const navigate = useNavigate();

  // Initialize device ID on mount
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
  }, []);

  // Check if selected list is already used when selection changes
  useEffect(() => {
    if (selectedListSingle) {
      const isUsed = isListUsedForSingleGeneration(selectedListSingle);
      setSingleGeneratorDisabled(isUsed);
      if (isUsed) {
        setSingleGeneratorError('You have already generated a comment from this list on this device.');
      } else {
        setSingleGeneratorError('');
      }
    } else {
      setSingleGeneratorDisabled(false);
      setSingleGeneratorError('');
    }
  }, [selectedListSingle]);

  const handleAdminAccess = () => {
    if (adminCode === '7898') {
      setAdminAccess();
      setCodeError('');
      toast.success('Admin access granted!');
      navigate({ to: '/admin' });
    } else {
      setCodeError('Invalid access code. Please try again.');
      toast.error('Invalid access code');
    }
  };

  const handleGenerateSingle = async () => {
    if (!selectedListSingle) {
      toast.error('Please select a comment list');
      return;
    }

    if (singleGeneratorDisabled) {
      toast.error('You have already generated a comment from this list on this device.');
      return;
    }

    try {
      const comment = await generateSingle.mutateAsync({
        listName: selectedListSingle,
        deviceId,
      });
      setSingleComment(comment);
      
      // Mark list as used locally
      markListAsUsedForSingleGeneration(selectedListSingle);
      setSingleGeneratorDisabled(true);
      setSingleGeneratorError('You have already generated a comment from this list on this device.');
      
      toast.success('Comment generated successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate comment';
      
      // If backend rejects due to device restriction, disable the button
      if (errorMessage.includes('device') || errorMessage.includes('one comment per list')) {
        markListAsUsedForSingleGeneration(selectedListSingle);
        setSingleGeneratorDisabled(true);
        setSingleGeneratorError('You have already generated a comment from this list on this device.');
      }
      
      toast.error(errorMessage);
    }
  };

  const handleGenerateBulk = async () => {
    if (!selectedListBulk) {
      toast.error('Please select a comment list');
      return;
    }

    const count = parseInt(bulkCount);
    if (isNaN(count) || count < 1 || count > 50) {
      toast.error('Please enter a valid number between 1 and 50');
      return;
    }

    if (keyStatus?.hasKey && !accessKey) {
      toast.error('Please enter the access key');
      return;
    }

    try {
      const result = await generateBulk.mutateAsync({
        listName: selectedListBulk,
        count,
        accessKey: accessKey || '',
      });
      setBulkComments(result.comments);
      toast.success(`Generated ${result.comments.length} comments!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate comments');
    }
  };

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Admin Access Control - Top Left */}
      <div className="mb-6">
        <Card className="card-pastel border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Shield className="w-5 h-5 text-blue-600" />
              <Label htmlFor="admin-code" className="text-sm font-medium">Admin Access Code:</Label>
              <Input
                id="admin-code"
                type="password"
                value={adminCode}
                onChange={(e) => {
                  setAdminCode(e.target.value);
                  setCodeError('');
                }}
                placeholder="Enter code..."
                className="w-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminAccess();
                  }
                }}
              />
              <Button
                onClick={handleAdminAccess}
                size="sm"
                className="btn-gradient"
              >
                Access Admin
              </Button>
              {codeError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{codeError}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Decorative Object */}
      <div className="flex justify-center mb-8">
        <Rotating3DObject />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Customer View</h1>
        <p className="text-gray-600 text-lg">Generate comments, upload images, and view your activity</p>
      </div>

      <div className="space-y-6">
        {/* Single Comment Generator */}
        <Card className="card-pastel">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Single Comment Generator</CardTitle>
                <CardDescription>Generate one comment per list (one per device)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="single-list">Select Comment List</Label>
              <Select value={selectedListSingle} onValueChange={setSelectedListSingle} disabled={listsLoading}>
                <SelectTrigger id="single-list" className="mt-1.5">
                  <SelectValue placeholder="Choose a comment list..." />
                </SelectTrigger>
                <SelectContent>
                  {commentLists.map((list) => (
                    <SelectItem key={list} value={list}>
                      {list}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {singleGeneratorError && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{singleGeneratorError}</span>
              </div>
            )}

            <Button
              onClick={handleGenerateSingle}
              disabled={!selectedListSingle || generateSingle.isPending || singleGeneratorDisabled}
              className="w-full btn-gradient"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateSingle.isPending ? 'Generating...' : 'Generate Single Comment'}
            </Button>

            {singleComment && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-gray-800 flex-1">{singleComment}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(singleComment)}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Comment Generator */}
        <Card className="card-pastel">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Bulk Comment Generator</CardTitle>
                <CardDescription>Generate multiple comments at once (requires access key)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bulk-list">Select Comment List</Label>
              <Select value={selectedListBulk} onValueChange={setSelectedListBulk} disabled={listsLoading}>
                <SelectTrigger id="bulk-list" className="mt-1.5">
                  <SelectValue placeholder="Choose a comment list..." />
                </SelectTrigger>
                <SelectContent>
                  {commentLists.map((list) => (
                    <SelectItem key={list} value={list}>
                      {list}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulk-count">Number of Comments</Label>
              <Input
                id="bulk-count"
                type="number"
                min="1"
                max="50"
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                placeholder="5"
                className="mt-1.5"
              />
            </div>

            {keyStatus?.hasKey && (
              <div>
                <Label htmlFor="access-key">Access Key</Label>
                <Input
                  id="access-key"
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Enter access key..."
                  className="mt-1.5"
                />
              </div>
            )}

            <Button
              onClick={handleGenerateBulk}
              disabled={!selectedListBulk || generateBulk.isPending}
              className="w-full btn-gradient"
            >
              <Zap className="w-4 h-4 mr-2" />
              {generateBulk.isPending ? 'Generating...' : 'Generate Bulk Comments'}
            </Button>

            {bulkComments.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Generated Comments ({bulkComments.length})</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bulkComments.join('\n'))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </div>
                {bulkComments.map((comment, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-gray-800 flex-1 text-sm">{comment}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(comment, index)}
                        className="shrink-0"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
