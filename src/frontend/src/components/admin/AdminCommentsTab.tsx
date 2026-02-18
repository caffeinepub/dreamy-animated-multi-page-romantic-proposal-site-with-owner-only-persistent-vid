import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Lock, Trash2, RotateCcw, Database } from 'lucide-react';
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

  const { data: commentLists = [] } = useGetAvailableCommentLists();
  const { data: selectedListComments = [] } = useGetCommentList(selectedList);
  const { data: totals } = useGetBulkCommentTotals();
  const createList = useCreateCommentList();
  const addSingle = useAddSingleComment();
  const addBulk = useBulkUploadComments();
  const deleteComment = useDeleteComment();
  const resetList = useResetList();
  const deleteList = useDeleteList();

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      await createList.mutateAsync(newListName.trim());
      setNewListName('');
      toast.success('List created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create list');
    }
  };

  const handleAddComments = async () => {
    if (!selectedList) {
      toast.error('Please select a list first');
      return;
    }

    try {
      if (addMode === 'bulk') {
        const comments = bulkComments
          .split('\n')
          .map((c) => c.trim())
          .filter((c) => c.length > 0);

        if (comments.length === 0) {
          toast.error('Please enter at least one comment');
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
      toast.error(error.message || 'Failed to add comments');
    }
  };

  const handleDeleteComment = async (comment: string) => {
    if (!selectedList) return;

    try {
      await deleteComment.mutateAsync({ listName: selectedList, comment });
      toast.success('Comment deleted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const handleResetList = async () => {
    if (!selectedList) return;

    try {
      await resetList.mutateAsync(selectedList);
      toast.success('List usage reset!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset list');
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;

    if (!confirm(`Are you sure you want to delete the list "${selectedList}"?`)) {
      return;
    }

    try {
      await deleteList.mutateAsync(selectedList);
      setSelectedList('');
      toast.success('List deleted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete list');
    }
  };

  const availableCount = selectedListComments.filter((c) => !c.used).length;
  const usedCount = selectedListComments.filter((c) => c.used).length;

  return (
    <div className="space-y-6">
      {/* Create New List */}
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Create New List</CardTitle>
              <CardDescription>Add a new comment list to the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="list-name">List Name</Label>
            <Input
              id="list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., product-reviews"
              className="mt-1.5"
            />
          </div>
          <Button onClick={handleCreateList} disabled={createList.isPending} className="btn-gradient">
            Create List
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
          {commentLists.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No lists created yet</p>
          ) : (
            commentLists.map((list) => (
              <button
                key={list}
                onClick={() => setSelectedList(list)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all
                  ${selectedList === list 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <span className="font-medium text-gray-900">{list}</span>
                <Lock className="w-5 h-5 text-gray-400" />
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Managing Selected List */}
      {selectedList && (
        <>
          <Card className="card-pastel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-600">Managing: {selectedList}</CardTitle>
                  <CardDescription>Add, view, and manage comments in this list</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                    {availableCount} available
                  </Badge>
                  <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                    {usedCount} used
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetList}
                  disabled={resetList.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Usage
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteList}
                  disabled={deleteList.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete List
                </Button>
              </div>

              {/* Add Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setAddMode('bulk')}
                  className={`
                    px-4 py-2 rounded-md font-medium text-sm transition-all
                    ${addMode === 'bulk' 
                      ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-sm' 
                      : 'text-gray-700'
                    }
                  `}
                >
                  Bulk Upload
                </button>
                <button
                  onClick={() => setAddMode('single')}
                  className={`
                    px-4 py-2 rounded-md font-medium text-sm transition-all
                    ${addMode === 'single' 
                      ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-sm' 
                      : 'text-gray-700'
                    }
                  `}
                >
                  Single Comment
                </button>
              </div>

              {addMode === 'bulk' ? (
                <div>
                  <Label htmlFor="bulk-comments">Comments (one per line)</Label>
                  <Textarea
                    id="bulk-comments"
                    value={bulkComments}
                    onChange={(e) => setBulkComments(e.target.value)}
                    placeholder="Enter comments, one per line..."
                    rows={6}
                    className="mt-1.5"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="single-comment">Comment</Label>
                  <Input
                    id="single-comment"
                    value={singleComment}
                    onChange={(e) => setSingleComment(e.target.value)}
                    placeholder="Enter a single comment..."
                    className="mt-1.5"
                  />
                </div>
              )}

              <Button
                onClick={handleAddComments}
                disabled={addSingle.isPending || addBulk.isPending}
                className="btn-gradient"
              >
                Add {addMode === 'bulk' ? `${bulkComments.split('\n').filter(c => c.trim()).length}` : '1'} Comment{addMode === 'bulk' && 's'}
              </Button>
            </CardContent>
          </Card>

          {/* Comments in List */}
          <Card className="card-pastel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comments in List ({selectedListComments.length})</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                    {availableCount} available
                  </Badge>
                  <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                    {usedCount} used
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedListComments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments in this list yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedListComments.map((comment, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <p className="text-gray-800 flex-1 text-sm">{comment.text}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComment(comment.text)}
                        className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Bulk Comment Totals */}
      {totals && (
        <Card className="card-pastel">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Bulk Comment Totals</CardTitle>
                <CardDescription>Quick summary of total comments in each list</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Lists</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.totalLists)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.totalComments)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Unused</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.unusedComments)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Used</p>
                <p className="text-2xl font-bold text-gray-900">{Number(totals.usedComments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
