import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useGetBulkKeyStatus, useSetBulkGeneratorKey, useResetBulkGeneratorKey } from '@/hooks/useBulkGeneratorKey';
import { toast } from 'sonner';

export default function AdminSettingsTab() {
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const { data: keyStatus, isLoading } = useGetBulkKeyStatus();
  const setKey = useSetBulkGeneratorKey();
  const resetKey = useResetBulkGeneratorKey();

  const handleSetKey = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminSettingsTab] Set key button clicked');
    
    if (!newKey.trim()) {
      toast.error('Please enter an access key');
      return;
    }

    try {
      await setKey.mutateAsync(newKey.trim());
      setNewKey('');
      setShowKey(false);
      toast.success('Access key updated successfully!');
    } catch (error: any) {
      console.error('[AdminSettingsTab] Error setting key:', error);
      toast.error(error.message || 'Failed to update key');
    }
  }, [newKey, setKey]);

  const handleResetKey = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminSettingsTab] Reset key button clicked');
    
    if (!confirm('Are you sure you want to reset the access key? Users will not be able to use bulk generation until a new key is set.')) {
      return;
    }

    try {
      await resetKey.mutateAsync();
      toast.success('Access key reset successfully!');
    } catch (error: any) {
      console.error('[AdminSettingsTab] Error resetting key:', error);
      toast.error(error.message || 'Failed to reset key');
    }
  }, [resetKey]);

  return (
    <div className="space-y-6">
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Bulk Generator Access Key</CardTitle>
              <CardDescription>Manage the access key required for bulk comment generation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-700">CURRENT STATUS</p>
              <Badge variant={keyStatus?.hasKey ? 'default' : 'secondary'} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
                {keyStatus?.hasKey ? 'Key Set' : 'Not Set'}
              </Badge>
            </div>

            {keyStatus?.hasKey && keyStatus.maskedKey && (
              <>
                <Label className="text-gray-700">Masked Key:</Label>
                <div className="mt-1.5 p-3 bg-white rounded-md border border-gray-300 font-mono text-gray-900">
                  {keyStatus.maskedKey}
                </div>

                <Button
                  variant="outline"
                  onClick={(e) => handleResetKey(e)}
                  disabled={resetKey.isPending}
                  className="w-full mt-3"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Key
                </Button>
              </>
            )}
          </div>

          {/* Change Access Key */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Change Access Key</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-key">Enter new access key...</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="new-key"
                    type={showKey ? 'text' : 'password'}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter new access key..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Important:</strong> This key will be required by all users attempting to use the bulk comment generator. Keep it secure and share it only with authorized users.
                </p>
              </div>

              <Button
                onClick={(e) => handleSetKey(e)}
                disabled={setKey.isPending}
                className="w-full btn-gradient"
                type="button"
              >
                <Key className="w-4 h-4 mr-2" />
                Update Key
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
