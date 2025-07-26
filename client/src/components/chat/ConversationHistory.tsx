import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, Trash2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

interface ConversationHistoryProps {
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
}

export default function ConversationHistory({ 
  currentConversationId, 
  onSelectConversation 
}: ConversationHistoryProps) {
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: showHistory,
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await apiRequest("DELETE", `/api/conversations/${conversationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed from your history.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed", 
        description: "Could not delete the conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteConversationMutation.mutate(conversationId);
  };

  if (!showHistory) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHistory(true)}
        className="mb-4"
      >
        <Clock className="w-4 h-4 mr-2" />
        View Chat History
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Chats</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(false)}
          >
            Hide
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No previous conversations
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    currentConversationId === conversation.id 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-background'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm font-medium truncate">
                          {conversation.title || "Untitled Chat"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}