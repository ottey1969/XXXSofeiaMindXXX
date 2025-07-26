import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "banner";
  priority: "low" | "medium" | "high" | "urgent";
  isActive: boolean;
  showToNewUsers: boolean;
  createdAt: string;
  expiresAt?: string;
}

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
  banner: Megaphone,
};

const priorityColors = {
  low: "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-200",
  medium: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-200",
  high: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-200",
  urgent: "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200",
};

export default function AnnouncementBanner() {
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]'))
  );

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements'],
    refetchInterval: 300000, // Check every 5 minutes
  });

  const dismissAnnouncement = (id: string) => {
    const newDismissed = new Set(Array.from(dismissedAnnouncements).concat([id]));
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(Array.from(newDismissed)));
  };

  const activeAnnouncements = announcements
    .filter(a => a.isActive && !dismissedAnnouncements.has(a.id))
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  if (activeAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {activeAnnouncements.map((announcement) => {
        const IconComponent = typeIcons[announcement.type];
        const colorClass = priorityColors[announcement.priority];

        return (
          <Alert key={announcement.id} className={`${colorClass} border-l-4`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <AlertTitle className="mb-1 text-sm font-semibold">
                    {announcement.title}
                    <span className="ml-2 text-xs opacity-75 capitalize">
                      ({announcement.priority} priority)
                    </span>
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {announcement.message}
                  </AlertDescription>
                  {announcement.expiresAt && (
                    <div className="mt-2 text-xs opacity-75">
                      Expires: {new Date(announcement.expiresAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAnnouncement(announcement.id)}
                className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}