import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  useGetAvailableLiveListApps,
  useAddLiveListApp,
  useAddUsernamesToApp,
  useDeleteLiveListApp,
  useResetUsernamesForApp,
  useResetAllLiveListApps,
} from '@/hooks/useLiveListChecker';
import { toast } from 'sonner';

export default function AdminLiveListTab() {
  const [newAppName, setNewAppName] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [addMode, setAddMode] = useState<'bulk' | 'comma'>('bulk');
  const [bulkUsernames, setBulkUsernames] = useState('');
  const [commaUsernames, setCommaUsernames] = useState('');

  const { data: apps = [] } = useGetAvailableLiveListApps();
  const addApp = useAddLiveListApp();
  const addUsernames = useAddUsernamesToApp();
  const deleteApp = useDeleteLiveListApp();
  const resetApp = useResetUsernamesForApp();
  const resetAll = useResetAllLiveListApps();

  const handleCreateApp = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminLiveListTab] Create app button clicked:', newAppName);
    
    if (!newAppName.trim()) {
      toast.error('Please enter an app name');
      return;
    }

    try {
      await addApp.mutateAsync(newAppName.trim());
      setNewAppName('');
      toast.success('App created successfully!');
    } catch (error: any) {
      console.error('[AdminLiveListTab] Error creating app:', error);
      toast.error(error.message || 'Failed to create app');
    }
  }, [newAppName, addApp]);

  const handleAddUsernames = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminLiveListTab] Add usernames button clicked:', { selectedApp, addMode });
    
    if (!selectedApp) {
      toast.error('Please select an app first');
      return;
    }

    try {
      let usernames: string[] = [];

      if (addMode === 'bulk') {
        if (!bulkUsernames.trim()) {
          toast.error('Please enter usernames');
          return;
        }
        usernames = bulkUsernames
          .split('\n')
          .map(u => u.trim())
          .filter(u => u.length > 0);
      } else {
        if (!commaUsernames.trim()) {
          toast.error('Please enter usernames');
          return;
        }
        usernames = commaUsernames
          .split(',')
          .map(u => u.trim())
          .filter(u => u.length > 0);
      }

      if (usernames.length === 0) {
        toast.error('Please enter valid usernames');
        return;
      }

      await addUsernames.mutateAsync({ appName: selectedApp, usernames });
      setBulkUsernames('');
      setCommaUsernames('');
      toast.success(`Added ${usernames.length} usernames!`);
    } catch (error: any) {
      console.error('[AdminLiveListTab] Error adding usernames:', error);
      toast.error(error.message || 'Failed to add usernames');
    }
  }, [selectedApp, addMode, bulkUsernames, commaUsernames, addUsernames]);

  const handleDeleteApp = useCallback(async (appName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminLiveListTab] Delete app button clicked:', appName);
    
    if (!confirm(`Are you sure you want to delete "${appName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteApp.mutateAsync(appName);
      if (selectedApp === appName) {
        setSelectedApp('');
      }
      toast.success('App deleted successfully!');
    } catch (error: any) {
      console.error('[AdminLiveListTab] Error deleting app:', error);
      toast.error(error.message || 'Failed to delete app');
    }
  }, [selectedApp, deleteApp]);

  const handleResetApp = useCallback(async (appName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminLiveListTab] Reset app button clicked:', appName);
    
    if (!confirm(`Are you sure you want to reset all usernames for "${appName}"?`)) {
      return;
    }

    try {
      await resetApp.mutateAsync(appName);
      toast.success('App reset successfully!');
    } catch (error: any) {
      console.error('[AdminLiveListTab] Error resetting app:', error);
      toast.error(error.message || 'Failed to reset app');
    }
  }, [resetApp]);

  const handleResetAll = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminLiveListTab] Reset all button clicked');
    
    if (!confirm('Are you sure you want to delete ALL apps and their usernames? This action cannot be undone.')) {
      return;
    }

    try {
      await resetAll.mutateAsync();
      setSelectedApp('');
      toast.success('All apps reset successfully!');
    } catch (error: any) {
      console.error('[AdminLiveListTab] Error resetting all apps:', error);
      toast.error(error.message || 'Failed to reset all apps');
    }
  }, [resetAll]);

  return (
    <div className="space-y-6">
      {/* Create New App */}
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Create New App/Event</CardTitle>
              <CardDescription>Add a new app or event to track usernames</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new-app-name">App/Event Name</Label>
            <Input
              id="new-app-name"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="Enter app or event name..."
              className="mt-1.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateApp();
                }
              }}
            />
          </div>
          <Button
            onClick={(e) => handleCreateApp(e)}
            disabled={addApp.isPending}
            className="w-full btn-gradient"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addApp.isPending ? 'Creating...' : 'Create App/Event'}
          </Button>
        </CardContent>
      </Card>

      {/* Manage Existing Apps */}
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <List className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Manage Apps/Events</CardTitle>
              <CardDescription>Add usernames and manage existing apps</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="select-app">Select App/Event</Label>
            <select
              id="select-app"
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose an app/event...</option>
              {apps.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </div>

          {selectedApp && (
            <>
              {/* Add Usernames Section */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-2">
                  <Button
                    variant={addMode === 'bulk' ? 'default' : 'outline'}
                    onClick={() => setAddMode('bulk')}
                    size="sm"
                    type="button"
                  >
                    Bulk (Line by Line)
                  </Button>
                  <Button
                    variant={addMode === 'comma' ? 'default' : 'outline'}
                    onClick={() => setAddMode('comma')}
                    size="sm"
                    type="button"
                  >
                    Comma Separated
                  </Button>
                </div>

                {addMode === 'bulk' ? (
                  <div>
                    <Label htmlFor="bulk-usernames">Usernames (one per line)</Label>
                    <Textarea
                      id="bulk-usernames"
                      value={bulkUsernames}
                      onChange={(e) => setBulkUsernames(e.target.value)}
                      placeholder="Enter usernames, one per line..."
                      rows={6}
                      className="mt-1.5"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="comma-usernames">Usernames (comma separated)</Label>
                    <Textarea
                      id="comma-usernames"
                      value={commaUsernames}
                      onChange={(e) => setCommaUsernames(e.target.value)}
                      placeholder="user1, user2, user3..."
                      rows={4}
                      className="mt-1.5"
                    />
                  </div>
                )}

                <Button
                  onClick={(e) => handleAddUsernames(e)}
                  disabled={addUsernames.isPending}
                  className="w-full btn-gradient"
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addUsernames.isPending ? 'Adding...' : 'Add Usernames'}
                </Button>
              </div>

              {/* App Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => handleResetApp(selectedApp, e)}
                  disabled={resetApp.isPending}
                  className="flex-1"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Usernames
                </Button>
                <Button
                  variant="destructive"
                  onClick={(e) => handleDeleteApp(selectedApp, e)}
                  disabled={deleteApp.isPending}
                  className="flex-1"
                  type="button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete App
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* All Apps List */}
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Apps/Events ({apps.length})</CardTitle>
              <CardDescription>Overview of all tracked apps and events</CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => handleResetAll(e)}
              disabled={resetAll.isPending || apps.length === 0}
              type="button"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apps.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No apps/events created yet</p>
          ) : (
            <div className="space-y-2">
              {apps.map((app) => (
                <div
                  key={app}
                  className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {app}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleResetApp(app, e)}
                      disabled={resetApp.isPending}
                      type="button"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteApp(app, e)}
                      disabled={deleteApp.isPending}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
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
