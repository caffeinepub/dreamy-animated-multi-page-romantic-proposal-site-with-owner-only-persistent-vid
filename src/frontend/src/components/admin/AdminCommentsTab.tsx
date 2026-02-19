import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Lock, Trash2, RotateCcw, Database, Loader2 } from 'lucide-react';
import {
  useGetAvailableCommentLists,
  useCreateCommentList,
  useGetCommentList,
  useAddSingleComment,
  useBulkUploadComments,
  useDeleteComment,
  useResetList,
  useDeleteList,
  useGetBulkCommentTotals,
} from '@/hooks/useAdminComments';
import { toast } from 'sonner';

export default function AdminCommentsTab() {
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [addMode, setAddMode] = useState<'bulk' | 'single'>('bulk');
  const [bulkComments, setBulkComments] = useState('');
  const [singleComment, setSingleComment] = useState('');

  const { data: commentLists = [], isLoading: listsLoading } = useGetAvailableCommentLists();
  const { data: selectedListComments = [] } = useGetCommentList(selectedList);
  const { data: totals } = useGetBulkCommentTotals();
  const createList = useCreateCommentList();
  const addSingle = useAddSingleComment();
  const addBulk = useBulkUploadComments();
  const deleteComment = useDeleteComment();
  const resetList = useResetList();
  const deleteList = useDeleteList();

  const handleCreateList = useCallback(async () => {
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

  const handleSelectListChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('[AdminCommentsTab] List selection changed:', value);
    setSelectedList(value);
  }, []);

  const handleAddComments = useCallback(async () => {
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

  const handleDeleteComment = useCallback(async (comment: string) => {
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

  const handleResetList = useCallback(async () => {
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

  const handleDeleteList = useCallback(async () => {
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

  const availableCount = selectedListComments.filter(c => !c.used).length;
  const usedCount = selectedListComments.filter(c => c.used).length;

  return (
    <div className="space-y-6">
      {/* Totals Summary */}
      {totals && (
        <Card className="card-pastel border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Database Totals</CardTitle>
                <CardDescription>Overview of all comment lists</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Lists</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.totalLists)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.totalComments)}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-600 mb-1">Used</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.usedComments)}</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-sm text-gray-600 mb-1">Available</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.unusedComments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New List */}
      <Card className="card-pastel border-2 border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New Comment List</CardTitle>
              <CardDescription>Add a new list to organize comments</CardDescription>
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
              placeholder="Enter list name (e.g., App7)..."
              className="mt-2 text-base h-12 border-2 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateList();
                }
              }}
              disabled={createList.isPending}
            />
          </div>
          <Button
            onClick={handleCreateList}
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
              <>
                <Plus className="w-5 h-5 mr-2" />
                Create List
              </>
            )}
          </Button>
          {createList.isPending && (
            <p className="text-sm text-gray-600 text-center animate-pulse">
              Please wait while we create your list...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Manage Existing Lists */}
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <List className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Manage Existing Lists</CardTitle>
              <CardDescription>Select a list to view and manage comments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="select-list" className="text-base font-semibold">Select List</Label>
            <select
              id="select-list"
              value={selectedList}
              onChange={handleSelectListChange}
              className="w-full mt-2 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={listsLoading}
            >
              <option value="">
                {listsLoading ? 'Loading lists...' : commentLists.length === 0 ? 'No lists available - create one above' : 'Choose a list...'}
              </option>
              {commentLists.map((list) => (
                <option key={list} value={list}>
                  {list}
                </option>
              ))}
            </select>
          </div>

          {selectedList && (
            <>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-700">List Statistics</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Available: {availableCount}
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Used: {usedCount}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Add Comments Section */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-2">
                  <Button
                    variant={addMode === 'bulk' ? 'default' : 'outline'}
                    onClick={() => setAddMode('bulk')}
                    size="sm"
                    type="button"
                  >
                    Bulk Add
                  </Button>
                  <Button
                    variant={addMode === 'single' ? 'default' : 'outline'}
                    onClick={() => setAddMode('single')}
                    size="sm"
                    type="button"
                  >
                    Single Add
                  </Button>
                </div>

                {addMode === 'bulk' ? (
                  <div>
                    <Label htmlFor="bulk-comments">Bulk Comments (one per line)</Label>
                    <Textarea
                      id="bulk-comments"
                      value={bulkComments}
                      onChange={(e) => setBulkComments(e.target.value)}
                      placeholder="Enter comments, one per line..."
                      className="mt-2 min-h-[150px]"
                      disabled={addBulk.isPending}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="single-comment">Single Comment</Label>
                    <Input
                      id="single-comment"
                      value={singleComment}
                      onChange={(e) => setSingleComment(e.target.value)}
                      placeholder="Enter a single comment..."
                      className="mt-2"
                      disabled={addSingle.isPending}
                    />
                  </div>
                )}

                <Button
                  onClick={handleAddComments}
                  disabled={addBulk.isPending || addSingle.isPending}
                  className="w-full"
                  type="button"
                >
                  {(addBulk.isPending || addSingle.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Comments
                    </>
                  )}
                </Button>
              </div>

              {/* List Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleResetList}
                  variant="outline"
                  size="sm"
                  disabled={resetList.isPending}
                  type="button"
                >
                  {resetList.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Reset List
                </Button>
                <Button
                  onClick={handleDeleteList}
                  variant="destructive"
                  size="sm"
                  disabled={deleteList.isPending}
                  type="button"
                >
                  {deleteList.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete List
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Comments in List</Label>
                  <Badge variant="outline">
                    Total: {selectedListComments.length}
                  </Badge>
                </div>
                {selectedListComments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">No comments yet</p>
                    <p className="text-sm">Add comments using the form above</p>
                  </div>
                ) : (
                  selectedListComments.map((comment, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                        comment.used
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm break-words">{comment.text}</p>
                        <Badge
                          variant="secondary"
                          className={`mt-2 text-xs ${
                            comment.used
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {comment.used ? 'Used' : 'Available'}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleDeleteComment(comment.text)}
                        variant="ghost"
                        size="sm"
                        disabled={deleteComment.isPending}
                        type="button"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
