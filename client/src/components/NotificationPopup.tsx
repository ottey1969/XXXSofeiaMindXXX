import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
};

const typeColors = {
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
};

export default function NotificationPopup() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Check for new notifications every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Show unread notifications that haven't been shown yet
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadNotifications = notifications.filter(
        (n: Notification) => !n.isRead && !Array.from(shownNotifications).includes(n.id)
      );

      if (unreadNotifications.length > 0 && !currentNotification) {
        const nextNotification = unreadNotifications[0];
        setCurrentNotification(nextNotification);
        setShownNotifications(prev => new Set([...Array.from(prev), nextNotification.id]));
      }
    }
  }, [notifications, currentNotification, shownNotifications]);

  const handleClose = () => {
    if (currentNotification) {
      markAsReadMutation.mutate(currentNotification.id);
      setCurrentNotification(null);
      
      // Check if there are more unread notifications to show
      setTimeout(() => {
        const remainingUnread = notifications.filter(
          (n: Notification) => !n.isRead && !shownNotifications.has(n.id)
        );
        if (remainingUnread.length > 0) {
          const nextNotification = remainingUnread[0];
          setCurrentNotification(nextNotification);
          setShownNotifications(prev => new Set([...Array.from(prev), nextNotification.id]));
        }
      }, 500);
    }
  };

  if (!currentNotification) {
    return null;
  }

  const IconComponent = typeIcons[currentNotification.type];

  return (
    <Dialog open={!!currentNotification} onOpenChange={() => handleClose()}>
      <DialogContent className={`max-w-md ${typeColors[currentNotification.type]} border-2`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="w-5 h-5" />
              <DialogTitle className="text-lg font-semibold">
                {currentNotification.title}
              </DialogTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentNotification.type.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-base leading-relaxed mt-2">
          {currentNotification.message}
        </DialogDescription>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-current/20">
          <span className="text-xs opacity-70">
            {new Date(currentNotification.createdAt).toLocaleString()}
          </span>
          <Button 
            onClick={handleClose}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}