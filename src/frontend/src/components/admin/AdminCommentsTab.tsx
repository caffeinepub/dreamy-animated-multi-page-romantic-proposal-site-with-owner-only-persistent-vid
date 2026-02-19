import { useState, useCallback, useMemo } from 'react';
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
      toast.success(`List "${trimmedName}" created successfully!`);
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
      <Card className="card-pastel border-2 border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New List</CardTitle>
              <CardDescription>Add a new comment list to the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="new-list-name" className="text-base font-semibold">List Name</Label>
            <Input
              id="new-list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., product-reviews"
              className="mt-2 text-base h-12 border-2 focus:border-blue-500"
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
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 shadow-md hover:shadow-lg transition-all"
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
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <List className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Existing Lists</CardTitle>
              <CardDescription>Select a list to manage its comments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {listsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading lists...</p>
            </div>
          ) : listsWithLockStatus.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <List className="w-12 h-12 mx-auto mb-3 text-gray-400" />
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
                    ? 'bg-blue-50 border-blue-400 shadow-md'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <span className="font-medium text-gray-900">{list.name}</span>
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
      <Card className="card-pastel border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Bulk Comment Totals</CardTitle>
              <CardDescription>Quick summary of total comments in each list</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {listsWithLockStatus.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <Database className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No lists to display</p>
              <p className="text-sm">Create a list to see totals here</p>
            </div>
          ) : (
            listsWithLockStatus.map((list) => (
              <div
                key={list.name}
                className="p-4 rounded-lg border border-gray-200 bg-white flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{list.name}</span>
                <Badge variant="outline" className="text-lg font-bold text-blue-600 border-2 border-blue-400 px-4 py-1">
                  {Number(list.totalComments)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Managing Section */}
      {selectedList && (
        <Card className="card-pastel border-2 border-blue-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
            <CardTitle className="text-xl text-blue-900">Managing: {selectedList}</CardTitle>
            <CardDescription>Add, view, and manage comments in this list</CardDescription>
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
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={addMode === 'bulk' ? 'default' : 'ghost'}
                onClick={() => setAddMode('bulk')}
                className="flex-1"
                type="button"
              >
                Bulk Upload
              </Button>
              <Button
                variant={addMode === 'single' ? 'default' : 'ghost'}
                onClick={() => setAddMode('single')}
                className="flex-1"
                type="button"
              >
                Single Comment
              </Button>
            </div>

            {/* Add Comments Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {addMode === 'bulk' ? 'Comments (one per line)' : 'Single Comment'}
              </Label>
              {addMode === 'bulk' ? (
                <Textarea
                  value={bulkComments}
                  onChange={(e) => setBulkComments(e.target.value)}
                  placeholder="Enter comments, one per line..."
                  className="min-h-[150px] text-base"
                  disabled={addBulk.isPending}
                />
              ) : (
                <Input
                  value={singleComment}
                  onChange={(e) => setSingleComment(e.target.value)}
                  placeholder="Enter a single comment..."
                  className="text-base h-12"
                  disabled={addSingle.isPending}
                />
              )}

              <Button
                onClick={(e) => handleAddComments(e)}
                disabled={addBulk.isPending || addSingle.isPending}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
                type="button"
              >
                {(addBulk.isPending || addSingle.isPending) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add ${addMode === 'bulk' ? bulkCommentCount : (singleComment.trim() ? 1 : 0)} Comment${addMode === 'bulk' && bulkCommentCount !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Comments in List ({totalCount})</Label>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800 border border-green-300">
                    {availableCount} available
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-800 border border-orange-300">
                    {usedCount} used
                  </Badge>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {selectedListComments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <List className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">No comments yet</p>
                    <p className="text-sm">Add comments using the form above</p>
                  </div>
                ) : (
                  selectedListComments.map((comment, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-white flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm break-words text-gray-900">{comment.text}</p>
                      </div>
                      <Button
                        onClick={(e) => handleDeleteComment(comment.text, e)}
                        variant="ghost"
                        size="sm"
                        disabled={deleteComment.isPending}
                        type="button"
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="card-pastel border-2 border-red-300">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-xl text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">Irreversible actions that affect all comment lists</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={(e) => handleClearAllLists(e)}
            disabled={clearAllLists.isPending}
            variant="destructive"
            className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700"
            type="button"
          >
            {clearAllLists.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5 mr-2" />
                Clear All Comment Lists
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
