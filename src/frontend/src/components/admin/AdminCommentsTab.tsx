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
      toast.error('Please enter a list ID');
      return;
    }

    try {
      console.log('[AdminCommentsTab] Calling createList mutation...');
      await createList.mutateAsync(trimmedName);
      console.log('[AdminCommentsTab] List created successfully');
      setNewListName('');
      toast.success('Comment list created successfully');
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
              <CardTitle className="text-xl">Create New Comment List</CardTitle>
              <CardDescription>Add a new comment list to the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="new-list-name" className="text-base font-semibold">List ID</Label>
            <Input
              id="new-list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter list ID..."
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
                Creating...
              </>
            ) : (
              'Create'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manage Comments */}
      <Card className="card-pastel border-2 border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <List className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Manage Comments</CardTitle>
              <CardDescription>Add, view, and manage comments in lists</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Select Comment List */}
          <div>
            <Label htmlFor="select-list" className="text-base font-semibold">Select Comment List</Label>
            <select
              id="select-list"
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="w-full mt-2 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Name</option>
              {listsWithLockStatus.map((list) => (
                <option key={list.name} value={list.name}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lock List and Delete List Buttons */}
          {selectedList && (
            <div className="flex gap-3">
              <Button
                onClick={(e) => handleToggleLock(selectedList, e)}
                disabled={toggleLock.isPending}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-2"
                type="button"
              >
                {toggleLock.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : selectedListSummary?.locked ? (
                  <Unlock className="w-5 h-5 mr-2" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                {selectedListSummary?.locked ? 'Unlock List' : 'Lock List'}
              </Button>
              <Button
                onClick={(e) => handleDeleteList(e)}
                disabled={deleteList.isPending}
                variant="destructive"
                className="flex-1 h-12 text-base font-semibold"
                type="button"
              >
                {deleteList.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5 mr-2" />
                )}
                Delete List
              </Button>
            </div>
          )}

          {/* Add Comments Section */}
          {selectedList && (
            <>
              <div>
                <Label htmlFor="bulk-comments" className="text-base font-semibold">Add Comments (one per line)</Label>
                <Textarea
                  id="bulk-comments"
                  value={bulkComments}
                  onChange={(e) => setBulkComments(e.target.value)}
                  placeholder="Enter comments, one per line..."
                  className="mt-2 min-h-[150px] text-base border-2 focus:border-blue-500"
                  disabled={addBulk.isPending}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={(e) => handleAddComments(e)}
                  disabled={addBulk.isPending || !bulkComments.trim()}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
                  type="button"
                >
                  {addBulk.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add {bulkCommentCount > 0 ? `${bulkCommentCount} ` : ''}Comments
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-6 text-base font-semibold border-2"
                  type="button"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Upload File
                </Button>
              </div>
            </>
          )}

          {/* Comments in List Counter */}
          {selectedList && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-700">Comments in List</span>
                <Badge className="bg-blue-600 text-white text-lg font-bold px-4 py-1">
                  {totalCount}
                </Badge>
              </div>
            </div>
          )}

          {/* Comments List */}
          {selectedList && selectedListComments.length > 0 && (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {selectedListComments.map((comment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <span className={`text-sm ${comment.used ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {comment.text}
                  </span>
                  <Button
                    onClick={(e) => handleDeleteComment(comment.text, e)}
                    variant="ghost"
                    size="sm"
                    disabled={deleteComment.isPending}
                    type="button"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
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

      {/* Danger Zone */}
      <Card className="card-pastel border-2 border-red-300">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">Irreversible actions - use with caution</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={(e) => handleClearAllLists(e)}
            disabled={clearAllLists.isPending || listsWithLockStatus.length === 0}
            variant="destructive"
            className="w-full h-12 text-base font-semibold"
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
                Clear All Lists
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
