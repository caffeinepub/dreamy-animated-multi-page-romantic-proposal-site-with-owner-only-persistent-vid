import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
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
  const [usernamesToAdd, setUsernamesToAdd] = useState('');

  const { data: apps = [], isLoading } = useGetAvailableLiveListApps();
  const addApp = useAddLiveListApp();
  const addUsernames = useAddUsernamesToApp();
  const deleteApp = useDeleteLiveListApp();
  const resetApp = useResetUsernamesForApp();
  const resetAll = useResetAllLiveListApps();

  const handleAddApp = async () => {
    if (!newAppName.trim()) {
      toast.error('Please enter an app name');
      return;
    }

    try {
      await addApp.mutateAsync(newAppName.trim());
      setNewAppName('');
      toast.success('App added successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add app');
    }
  };

  const handleAddUsernames = async () => {
    if (!selectedApp) {
      toast.error('Please select an app');
      return;
    }

    if (!usernamesToAdd.trim()) {
      toast.error('Please enter at least one username');
      return;
    }

    const usernameList = usernamesToAdd
      .split(/[\n,]/)
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (usernameList.length === 0) {
      toast.error('Please enter valid usernames');
      return;
    }

    try {
      await addUsernames.mutateAsync({ appName: selectedApp, usernames: usernameList });
      setUsernamesToAdd('');
      toast.success(`Added ${usernameList.length} usernames to ${selectedApp}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add usernames');
    }
  };

  const handleDeleteApp = async (appName: string) => {
    try {
      await deleteApp.mutateAsync(appName);
      if (selectedApp === appName) {
        setSelectedApp('');
      }
      toast.success('App deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete app');
    }
  };

  const handleResetApp = async (appName: string) => {
    try {
      await resetApp.mutateAsync(appName);
      toast.success('App usernames reset successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset app');
    }
  };

  const handleResetAll = async () => {
    try {
      await resetAll.mutateAsync();
      setSelectedApp('');
      toast.success('All live list data reset successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset all data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New App */}
      <Card className="card-pastel">
        <CardHeader>
          <CardTitle>Create New App</CardTitle>
          <CardDescription>Add a new app to the live list system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new-app-name">App Name</Label>
            <Input
              id="new-app-name"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="Enter app name..."
              className="mt-1.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddApp();
                }
              }}
            />
          </div>
          <Button
            onClick={handleAddApp}
            disabled={addApp.isPending || !newAppName.trim()}
            className="w-full btn-gradient"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addApp.isPending ? 'Adding...' : 'Add App'}
          </Button>
        </CardContent>
      </Card>

      {/* Manage Apps */}
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Apps</CardTitle>
              <CardDescription>Add usernames and manage existing apps</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Live List Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all apps and their usernames from the live list system.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetAll}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reset All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-gray-500">Loading apps...</p>
          ) : apps.length === 0 ? (
            <p className="text-gray-500">No apps created yet. Create one above to get started.</p>
          ) : (
            <>
              <div>
                <Label htmlFor="select-app">Select App</Label>
                <select
                  id="select-app"
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an app...</option>
                  {apps.map((app) => (
                    <option key={app} value={app}>
                      {app}
                    </option>
                  ))}
                </select>
              </div>

              {selectedApp && (
                <>
                  <div>
                    <Label htmlFor="usernames-to-add">Add Usernames</Label>
                    <Textarea
                      id="usernames-to-add"
                      value={usernamesToAdd}
                      onChange={(e) => setUsernamesToAdd(e.target.value)}
                      placeholder="username1&#10;username2&#10;username3&#10;(one per line or comma-separated)"
                      className="mt-1.5 min-h-[120px] font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleAddUsernames}
                    disabled={addUsernames.isPending || !usernamesToAdd.trim()}
                    className="w-full btn-gradient"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addUsernames.isPending ? 'Adding...' : 'Add Usernames'}
                  </Button>

                  <div className="flex gap-2 pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset Usernames
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Usernames for {selectedApp}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove all usernames from this app. The app itself will remain.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleResetApp(selectedApp)}>
                            Reset Usernames
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete App
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {selectedApp}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this app and all its usernames. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteApp(selectedApp)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete App
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Apps List */}
      {apps.length > 0 && (
        <Card className="card-pastel">
          <CardHeader>
            <CardTitle>Current Apps ({apps.length})</CardTitle>
            <CardDescription>All apps in the live list system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apps.map((app) => (
                <div
                  key={app}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-900">{app}</span>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Usernames for {app}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove all usernames from this app. The app itself will remain.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleResetApp(app)}>
                            Reset Usernames
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {app}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this app and all its usernames. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteApp(app)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete App
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
