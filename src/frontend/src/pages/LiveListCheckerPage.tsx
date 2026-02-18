import { useState, useEffect } from 'react';
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
  const saveToStorage = (data: Partial<StoredData>) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current: StoredData = stored ? JSON.parse(stored) : { selectedApps: [], usernames: '', lastResults: null };
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAppToggle = (appName: string) => {
    const newSelected = selectedApps.includes(appName)
      ? selectedApps.filter(a => a !== appName)
      : [...selectedApps, appName];
    setSelectedApps(newSelected);
    saveToStorage({ selectedApps: newSelected });
  };

  const handleRunCheck = async () => {
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
      toast.error(error.message || 'Failed to run check');
    }
  };

  const handleExport = () => {
    if (!results) {
      toast.error('No results to export');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      selectedApps,
      usernames: usernames.split(/[\n,]/).map(u => u.trim()).filter(u => u.length > 0),
      results: {
        totalMatches: Number(results.totalMatches),
        detailedResults: results.detailedResults.map(r => ({
          appName: r.appName,
          matchCount: Number(r.matchCount),
          matches: r.matches
        }))
      }
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
    toast.success('Results exported successfully!');
  };

  const handleClear = () => {
    setSelectedApps([]);
    setUsernames('');
    setResults(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Data cleared');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <ListChecks className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Live List Checker</h1>
        </div>
        <p className="text-gray-600 text-lg">Select apps and check usernames against admin lists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="card-pastel">
            <CardHeader>
              <CardTitle>Select Apps</CardTitle>
              <CardDescription>Choose which apps to check against</CardDescription>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <p className="text-gray-500">Loading apps...</p>
              ) : availableApps.length === 0 ? (
                <p className="text-gray-500">No apps available. Admin needs to add apps first.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableApps.map((app) => (
                    <div key={app} className="flex items-center space-x-2">
                      <Checkbox
                        id={`app-${app}`}
                        checked={selectedApps.includes(app)}
                        onCheckedChange={() => handleAppToggle(app)}
                      />
                      <Label
                        htmlFor={`app-${app}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {app}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-pastel">
            <CardHeader>
              <CardTitle>Enter Usernames</CardTitle>
              <CardDescription>One per line or comma-separated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={usernames}
                onChange={(e) => {
                  setUsernames(e.target.value);
                  saveToStorage({ usernames: e.target.value });
                }}
                placeholder="username1&#10;username2&#10;username3"
                className="min-h-[150px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleRunCheck}
                  disabled={checkLiveList.isPending || selectedApps.length === 0}
                  className="flex-1 btn-gradient"
                >
                  <ListChecks className="w-4 h-4 mr-2" />
                  {checkLiveList.isPending ? 'Checking...' : 'Run Check'}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="icon"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          <Card className="card-pastel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>Match counts and detailed breakdown</CardDescription>
                </div>
                {results && (
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!results ? (
                <div className="text-center py-12 text-gray-500">
                  <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Run a check to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-900">
                      {Number(results.totalMatches)} Total Matches
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Detailed Results:</h3>
                    {results.detailedResults.length === 0 ? (
                      <p className="text-gray-500 text-sm">No matches found</p>
                    ) : (
                      results.detailedResults.map((result) => (
                        <div key={result.appName} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{result.appName}</h4>
                            <span className="text-sm font-medium text-blue-600">
                              {Number(result.matchCount)} matches
                            </span>
                          </div>
                          {result.matches.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 mb-1">Matched usernames:</p>
                              <div className="flex flex-wrap gap-1">
                                {result.matches.map((username, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {username}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
