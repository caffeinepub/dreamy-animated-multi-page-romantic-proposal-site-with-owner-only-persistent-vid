import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ListChecks, Download, RotateCcw } from 'lucide-react';
import { useGetAvailableLiveListApps, useCheckLiveList } from '@/hooks/useLiveListChecker';
import { toast } from 'sonner';
import type { LiveListCheckSummary } from '@/backend';

const STORAGE_KEY = 'liveListCheckerData';

interface StoredData {
  selectedApps: string[];
  usernames: string;
  lastResults: LiveListCheckSummary | null;
}

export default function LiveListCheckerPage() {
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [usernames, setUsernames] = useState('');
  const [results, setResults] = useState<LiveListCheckSummary | null>(null);

  const { data: availableApps = [], isLoading: appsLoading } = useGetAvailableLiveListApps();
  const checkLiveList = useCheckLiveList();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored);
        setSelectedApps(data.selectedApps || []);
        setUsernames(data.usernames || '');
        setResults(data.lastResults || null);
      } catch (error) {
        console.error('Failed to load stored data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  const saveToStorage = useCallback((data: Partial<StoredData>) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current: StoredData = stored ? JSON.parse(stored) : { selectedApps: [], usernames: '', lastResults: null };
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const handleAppToggle = useCallback((appName: string) => {
    const newSelected = selectedApps.includes(appName)
      ? selectedApps.filter(a => a !== appName)
      : [...selectedApps, appName];
    setSelectedApps(newSelected);
    saveToStorage({ selectedApps: newSelected });
  }, [selectedApps, saveToStorage]);

  const handleRunCheck = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[LiveListCheckerPage] Run check button clicked');
    
    if (selectedApps.length === 0) {
      toast.error('Please select at least one app');
      return;
    }

    if (!usernames.trim()) {
      toast.error('Please enter at least one username');
      return;
    }

    const usernameList = usernames
      .split(/[\n,]/)
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (usernameList.length === 0) {
      toast.error('Please enter valid usernames');
      return;
    }

    try {
      console.log('[LiveListCheckerPage] Checking usernames:', usernameList);
      const result = await checkLiveList.mutateAsync(usernameList);
      
      // Filter results to only show selected apps
      const filteredResults = {
        ...result,
        detailedResults: result.detailedResults.filter(r => selectedApps.includes(r.appName))
      };
      
      setResults(filteredResults);
      saveToStorage({ usernames, lastResults: filteredResults });
      toast.success('Check completed successfully!');
    } catch (error: any) {
      console.error('[LiveListCheckerPage] Error checking usernames:', error);
      toast.error(error.message || 'Failed to run check');
    }
  }, [selectedApps, usernames, checkLiveList, saveToStorage]);

  const handleExport = useCallback(() => {
    if (!results) {
      toast.error('No results to export');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      totalMatches: Number(results.totalMatches),
      results: results.detailedResults.map(r => ({
        appName: r.appName,
        matchCount: Number(r.matchCount),
        matches: r.matches
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-list-check-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Results exported!');
  }, [results]);

  const handleReset = useCallback(() => {
    setSelectedApps([]);
    setUsernames('');
    setResults(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Form reset!');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Live List Checker</h1>
        <p className="text-gray-600 text-lg">Check if usernames exist in tracked apps/events</p>
      </div>

      <div className="space-y-6">
        {/* App Selection */}
        <Card className="card-pastel">
          <CardHeader>
            <CardTitle>Select Apps/Events to Check</CardTitle>
            <CardDescription>Choose which apps or events to search</CardDescription>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <p className="text-gray-500 text-center py-4">Loading apps...</p>
            ) : availableApps.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No apps available. Contact admin to add apps.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableApps.map((app) => (
                  <div key={app} className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
                    <Checkbox
                      id={`app-${app}`}
                      checked={selectedApps.includes(app)}
                      onCheckedChange={() => handleAppToggle(app)}
                    />
                    <label
                      htmlFor={`app-${app}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {app}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Username Input */}
        <Card className="card-pastel">
          <CardHeader>
            <CardTitle>Enter Usernames to Check</CardTitle>
            <CardDescription>Enter usernames separated by commas or new lines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="usernames">Usernames</Label>
              <Textarea
                id="usernames"
                value={usernames}
                onChange={(e) => {
                  setUsernames(e.target.value);
                  saveToStorage({ usernames: e.target.value });
                }}
                placeholder="user1, user2, user3&#10;or one per line..."
                rows={6}
                className="mt-1.5"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={(e) => handleRunCheck(e)}
                disabled={checkLiveList.isPending || selectedApps.length === 0}
                className="flex-1 btn-gradient"
                type="button"
              >
                <ListChecks className="w-4 h-4 mr-2" />
                {checkLiveList.isPending ? 'Checking...' : 'Run Check'}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                type="button"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="card-pastel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Check Results</CardTitle>
                  <CardDescription>Total matches: {Number(results.totalMatches)}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  type="button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.detailedResults.map((result, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{result.appName}</h3>
                      <span className="text-sm font-medium text-gray-600">
                        {Number(result.matchCount)} match{Number(result.matchCount) !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    {result.matches.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.matches.map((match, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                          >
                            {match}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No matches found</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
