import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Info, AlertTriangle, AlertCircle, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "announcement";
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
  announcement: Megaphone,
};

const typeColors = {
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
  announcement: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200",
};

export default function BroadcastMessages() {
  const [visibleBroadcasts, setVisibleBroadcasts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: broadcasts = [] } = useQuery<Broadcast[]>({
    queryKey: ['/api/broadcasts'],
    refetchInterval: 60000, // Check for new broadcasts every minute
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (broadcastId: string) => {
      const response = await apiRequest('POST', `/api/broadcasts/${broadcastId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broadcasts'] });
    },
  });

  // Show unread broadcasts
  useEffect(() => {
    const unreadBroadcasts = broadcasts.filter(b => !b.isRead && !visibleBroadcasts.has(b.id));
    
    if (unreadBroadcasts.length > 0) {
      unreadBroadcasts.forEach(broadcast => {
        toast({
          title: broadcast.title,
          description: broadcast.message,
          action: (
            <Button 
              size="sm" 
              onClick={() => {
                markAsReadMutation.mutate(broadcast.id);
                setVisibleBroadcasts(prev => new Set(Array.from(prev).concat([broadcast.id])));
              }}
            >
              Mark as Read
            </Button>
          ),
        });
        
        setVisibleBroadcasts(prev => new Set(Array.from(prev).concat([broadcast.id])));
      });
    }
  }, [broadcasts, visibleBroadcasts, toast, markAsReadMutation]);

  if (broadcasts.length === 0) {
    return null;
  }

  const unreadBroadcasts = broadcasts.filter(b => !b.isRead);

  return (
    <div className="space-y-4">
      {unreadBroadcasts.map((broadcast) => {
        const IconComponent = typeIcons[broadcast.type];
        const colorClass = typeColors[broadcast.type];

        return (
          <Card key={broadcast.id} className={`border-l-4 ${colorClass}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <span>{broadcast.title}</span>
                  <Badge variant="outline" className="text-xs">
                    Broadcast
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsReadMutation.mutate(broadcast.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{broadcast.message}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Sent: {new Date(broadcast.createdAt).toLocaleString()}</span>
                {broadcast.expiresAt && (
                  <span>Expires: {new Date(broadcast.expiresAt).toLocaleString()}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}