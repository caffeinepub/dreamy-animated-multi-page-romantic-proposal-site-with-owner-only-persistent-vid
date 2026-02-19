import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send } from 'lucide-react';
import { useGetAllChatMessages, useAddChatMessage } from '@/hooks/useChatMessages';
import { toast } from 'sonner';

export default function AdminChatTab() {
  const [sender, setSender] = useState('Admin');
  const [message, setMessage] = useState('');

  const { data: messages = [], isLoading } = useGetAllChatMessages();
  const addMessage = useAddChatMessage();

  const handleSendMessage = useCallback(async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[AdminChatTab] Send message button clicked');
    
    if (!sender.trim() || !message.trim()) {
      toast.error('Please enter both sender and message');
      return;
    }

    try {
      await addMessage.mutateAsync({ sender: sender.trim(), message: message.trim() });
      setMessage('');
      toast.success('Message added!');
    } catch (error: any) {
      console.error('[AdminChatTab] Error adding message:', error);
      toast.error(error.message || 'Failed to add message');
    }
  }, [sender, message, addMessage]);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card className="card-pastel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Chat Messages</CardTitle>
              <CardDescription>Add and view chat messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="sender">Sender</Label>
              <Input
                id="sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Your name..."
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="message">Message</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  onClick={(e) => handleSendMessage(e)}
                  disabled={addMessage.isPending}
                  className="btn-gradient shrink-0"
                  type="button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-pastel">
        <CardHeader>
          <CardTitle>Message History ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-medium text-gray-900">{msg.sender}</p>
                    <p className="text-xs text-gray-500">{formatDate(msg.timestamp)}</p>
                  </div>
                  <p className="text-gray-700">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
