import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Lock, Unlock, Trash2, RotateCcw, Database, Loader2, RefreshCw } from 'lucide-react';
import {
  useGetListsWithLockStatus,
  useCreateCommentList,
  useGetCommentList,
  useGetCommentListSummary,
  useAddSingleComment,
  useBulkUploadComments,
  useDeleteComment,
  useResetList,
  useDeleteList,
  useToggleLockList,
  useClearAllCommentLists,
} from '@/hooks/useAdminComments';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminCommentsTab() {
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [addMode, setAddMode] = useState<'bulk' | 'single'>('bulk');
  const [bulkComments, setBulkComments] = useState('');
  const [singleComment, setSingleComment] = useState('');
  const addCommentsSectionRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { data: listsWithLockStatus = [], isLoading: listsLoading } = useGetListsWithLockStatus();
  const { data: selectedListComments = [] } = useGetCommentList(selectedList);
  const { data: selectedListSummary } = useGetCommentListSummary(selectedList);
  const createList = useCreateCommentList();
  const addSingle = useAddSingleComment();
  const addBulk = useBulkUploadComments();
  const deleteComment = useDeleteComment();
  const resetList = useResetList();
  const deleteList = useDeleteList();
  const toggleLock = useToggleLockList();
  const clearAllLists = useClearAllCommentLists();

  // Calculate comment count from textarea
  const bulkCommentCount = useMemo(() => {
    if (!bulkComments.trim()) return 0;
    return bulkComments
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0).length;
  }, [bulkComments]);

  const handleCreateList = useCallback(async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Create list button clicked:', newListName);
    
    const trimmedName = newListName.trim();
    
    if (!trimmedName) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      console.log('[AdminCommentsTab] Calling createList mutation...');
      await createList.mutateAsync(trimmedName);
      console.log('[AdminCommentsTab] List created successfully');
      setNewListName('');
      setSelectedList(trimmedName);
      toast.success(`List "${trimmedName}" created successfully!`);
      
      // Scroll to add comments section after a short delay
      setTimeout(() => {
        addCommentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error creating list:', error);
      toast.error(error.message || 'Failed to create list');
    }
  }, [newListName, createList]);

  const handleAddComments = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Add comments button clicked:', { selectedList, addMode });
    
    if (!selectedList) {
      toast.error('Please select a list first');
      return;
    }

    try {
      if (addMode === 'bulk') {
        if (!bulkComments.trim()) {
          toast.error('Please enter comments');
          return;
        }

        const comments = bulkComments
          .split('\n')
          .map(c => c.trim())
          .filter(c => c.length > 0);

        if (comments.length === 0) {
          toast.error('Please enter valid comments');
          return;
        }

        await addBulk.mutateAsync({ listName: selectedList, comments });
        setBulkComments('');
        toast.success(`Added ${comments.length} comments!`);
      } else {
        if (!singleComment.trim()) {
          toast.error('Please enter a comment');
          return;
        }

        await addSingle.mutateAsync({ listName: selectedList, comment: singleComment.trim() });
        setSingleComment('');
        toast.success('Comment added!');
      }
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error adding comments:', error);
      toast.error(error.message || 'Failed to add comments');
    }
  }, [selectedList, addMode, bulkComments, singleComment, addBulk, addSingle]);

  const handleDeleteComment = useCallback(async (comment: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Delete comment button clicked:', comment);
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment.mutateAsync({ listName: selectedList, comment });
      toast.success('Comment deleted!');
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error deleting comment:', error);
      toast.error(error.message || 'Failed to delete comment');
    }
  }, [selectedList, deleteComment]);

  const handleResetList = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Reset list button clicked:', selectedList);
    
    if (!selectedList) {
      toast.error('Please select a list first');
      return;
    }

    if (!confirm('Are you sure you want to reset all comments in this list to unused?')) {
      return;
    }

    try {
      await resetList.mutateAsync(selectedList);
      toast.success('List reset successfully!');
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error resetting list:', error);
      toast.error(error.message || 'Failed to reset list');
    }
  }, [selectedList, resetList]);

  const handleDeleteList = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Delete list button clicked:', selectedList);
    
    if (!selectedList) {
      toast.error('Please select a list first');
      return;
    }

    if (!confirm('Are you sure you want to delete this entire list? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteList.mutateAsync(selectedList);
      setSelectedList('');
      toast.success('List deleted successfully!');
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error deleting list:', error);
      toast.error(error.message || 'Failed to delete list');
    }
  }, [selectedList, deleteList]);

  const handleToggleLock = useCallback(async (listName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Toggle lock button clicked:', listName);
    
    try {
      const newLockState = await toggleLock.mutateAsync(listName);
      toast.success(newLockState ? 'List locked' : 'List unlocked');
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error toggling lock:', error);
      toast.error(error.message || 'Failed to toggle lock');
    }
  }, [toggleLock]);

  const handleRefresh = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Refresh button clicked');
    
    try {
      await queryClient.invalidateQueries({ queryKey: ['commentList', selectedList] });
      await queryClient.invalidateQueries({ queryKey: ['commentListSummary', selectedList] });
      await queryClient.invalidateQueries({ queryKey: ['listsWithLockStatus'] });
      toast.success('Data refreshed!');
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error refreshing:', error);
      toast.error('Failed to refresh data');
    }
  }, [selectedList, queryClient]);

  const handleClearAllLists = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminCommentsTab] Clear all lists button clicked');
    
    if (!confirm('⚠️ WARNING: This will permanently delete ALL comment lists and their contents. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    try {
      await clearAllLists.mutateAsync();
      setSelectedList('');
      toast.success('All comment lists cleared!');
    } catch (error: any) {
      console.error('[AdminCommentsTab] Error clearing all lists:', error);
      toast.error(error.message || 'Failed to clear all lists');
    }
  }, [clearAllLists]);

  const availableCount = selectedListSummary ? Number(selectedListSummary.totalComments) - Number(selectedListSummary.usedComments) : 0;
  const usedCount = selectedListSummary ? Number(selectedListSummary.usedComments) : 0;
  const totalCount = selectedListSummary ? Number(selectedListSummary.totalComments) : 0;

  return (
    <div className="space-y-6">
      {/* Create New List */}
      <Card className="border-2 border-amber-200 shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-r from-sand-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-md">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-sand-900">Create New List</CardTitle>
              <CardDescription className="text-sand-600">Add a new comment list to the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="new-list-name" className="text-base font-semibold text-sand-900">List Name</Label>
            <Input
              id="new-list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., product-reviews"
              className="mt-2 text-base h-12 border-2 border-sand-200 focus:border-amber-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateList(e);
                }
              }}
              disabled={createList.isPending}
            />
          </div>
          <Button
            onClick={(e) => handleCreateList(e)}
            disabled={createList.isPending || !newListName.trim()}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 shadow-md hover:shadow-lg transition-all text-white"
            type="button"
          >
            {createList.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating List...
              </>
            ) : (
              'Create List'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Lists */}
      <Card className="bg-white border-sand-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <List className="w-6 h-6 text-amber-600" />
            <div>
              <CardTitle className="text-sand-900">Existing Lists</CardTitle>
              <CardDescription className="text-sand-600">Select a list to manage its comments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {listsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-amber-600" />
              <p className="text-sand-600">Loading lists...</p>
            </div>
          ) : listsWithLockStatus.length === 0 ? (
            <div className="p-8 text-center text-sand-500 bg-sand-50 rounded-lg border border-sand-200">
              <List className="w-12 h-12 mx-auto mb-3 text-sand-400" />
              <p className="font-medium">No lists yet</p>
              <p className="text-sm">Create your first list above</p>
            </div>
          ) : (
            listsWithLockStatus.map((list) => (
              <div
                key={list.name}
                onClick={() => setSelectedList(list.name)}
                className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedList === list.name
                    ? 'bg-amber-50 border-amber-400 shadow-md'
                    : 'bg-white border-sand-200 hover:border-amber-300 hover:shadow-sm'
                }`}
              >
                <span className="font-medium text-sand-900">{list.name}</span>
                <Button
                  onClick={(e) => handleToggleLock(list.name, e)}
                  variant="ghost"
                  size="sm"
                  disabled={toggleLock.isPending}
                  type="button"
                  className="ml-2"
                >
                  {list.locked ? (
                    <Lock className="w-5 h-5 text-red-600" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-600" />
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bulk Comment Totals */}
      <Card className="bg-white border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-amber-600" />
            <div>
              <CardTitle className="text-sand-900">Bulk Comment Totals</CardTitle>
              <CardDescription className="text-sand-600">Quick summary of total comments in each list</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {listsWithLockStatus.length === 0 ? (
            <div className="p-8 text-center text-sand-500 bg-sand-50 rounded-lg border border-sand-200">
              <Database className="w-12 h-12 mx-auto mb-3 text-sand-400" />
              <p className="font-medium">No lists to display</p>
              <p className="text-sm">Create a list to see totals here</p>
            </div>
          ) : (
            listsWithLockStatus.map((list) => (
              <div
                key={list.name}
                className="p-4 rounded-lg border border-sand-200 bg-white flex items-center justify-between"
              >
                <span className="font-medium text-sand-900">{list.name}</span>
                <Badge variant="outline" className="text-lg font-bold text-amber-700 border-2 border-amber-400 px-4 py-1">
                  {Number(list.totalComments)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Managing Section */}
      {selectedList && (
        <div ref={addCommentsSectionRef}>
          <Card className="border-2 border-amber-300 bg-white">
            <CardHeader className="bg-gradient-to-r from-sand-50 to-amber-50">
              <CardTitle className="text-xl text-sand-900">Managing: {selectedList}</CardTitle>
              <CardDescription className="text-sand-600">Add, view, and manage comments in this list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Available/Used Badges and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800 border border-green-300 px-4 py-2 text-base font-semibold">
                    {availableCount} available
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-800 border border-orange-300 px-4 py-2 text-base font-semibold">
                    {usedCount} used
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => handleRefresh(e)}
                    variant="outline"
                    size="sm"
                    type="button"
                    className="border-sand-300 hover:bg-sand-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={(e) => handleDeleteList(e)}
                    variant="destructive"
                    size="sm"
                    disabled={deleteList.isPending}
                    type="button"
                  >
                    {deleteList.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Tab Toggle */}
              <div className="flex gap-2 p-1 bg-sand-100 rounded-lg">
                <Button
                  variant={addMode === 'bulk' ? 'default' : 'ghost'}
                  onClick={() => setAddMode('bulk')}
                  className={`flex-1 ${addMode === 'bulk' ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white' : ''}`}
                  type="button"
                >
                  Bulk Upload
                </Button>
                <Button
                  variant={addMode === 'single' ? 'default' : 'ghost'}
                  onClick={() => setAddMode('single')}
                  className={`flex-1 ${addMode === 'single' ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white' : ''}`}
                  type="button"
                >
                  Single Comment
                </Button>
              </div>

              {/* Add Comments Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-sand-900">
                  {addMode === 'bulk' ? 'Comments (one per line)' : 'Single Comment'}
                </Label>
                {addMode === 'bulk' ? (
                  <Textarea
                    value={bulkComments}
                    onChange={(e) => setBulkComments(e.target.value)}
                    placeholder="Enter comments, one per line..."
                    className="min-h-[150px] text-base border-2 border-sand-200 focus:border-amber-500"
                    disabled={addBulk.isPending}
                  />
                ) : (
                  <Input
                    value={singleComment}
                    onChange={(e) => setSingleComment(e.target.value)}
                    placeholder="Enter a single comment..."
                    className="text-base h-12 border-2 border-sand-200 focus:border-amber-500"
                    disabled={addSingle.isPending}
                  />
                )}
                <Button
                  onClick={(e) => handleAddComments(e)}
                  disabled={
                    (addMode === 'bulk' && (addBulk.isPending || !bulkComments.trim())) ||
                    (addMode === 'single' && (addSingle.isPending || !singleComment.trim()))
                  }
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white"
                  type="button"
                >
                  {(addMode === 'bulk' && addBulk.isPending) || (addMode === 'single' && addSingle.isPending) ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : addMode === 'bulk' ? (
                    `Add ${bulkCommentCount} Comment${bulkCommentCount !== 1 ? 's' : ''}`
                  ) : (
                    'Add Comment'
                  )}
                </Button>
              </div>

              {/* Comments List */}
              {selectedListComments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-sand-900">Comments ({selectedListComments.length})</Label>
                    <Button
                      onClick={(e) => handleResetList(e)}
                      variant="outline"
                      size="sm"
                      disabled={resetList.isPending}
                      type="button"
                      className="border-sand-300 hover:bg-sand-50"
                    >
                      {resetList.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-2" />
                      )}
                      Reset All
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2 border border-sand-200 rounded-lg p-3 bg-sand-50">
                    {selectedListComments.map((comment, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                          comment.used
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-white border-sand-200'
                        }`}
                      >
                        <p className="text-sm text-sand-800 flex-1">{comment.text}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {comment.used && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                              Used
                            </Badge>
                          )}
                          <Button
                            onClick={(e) => handleDeleteComment(comment.text, e)}
                            variant="ghost"
                            size="sm"
                            disabled={deleteComment.isPending}
                            type="button"
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Danger Zone */}
      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">Irreversible actions - use with extreme caution</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={(e) => handleClearAllLists(e)}
            variant="destructive"
            disabled={clearAllLists.isPending}
            className="w-full h-12 text-base font-semibold"
            type="button"
          >
            {clearAllLists.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              'Clear All Comment Lists'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
