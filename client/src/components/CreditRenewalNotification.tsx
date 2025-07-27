import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, Clock } from "lucide-react";

export function CreditRenewalNotification() {
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user?.creditRenewal?.renewed) {
      setShowNotification(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user?.creditRenewal?.renewed]);

  if (!showNotification || !user?.creditRenewal?.renewed) {
    return null;
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-green-700 dark:text-green-300">
        🎉 {user.creditRenewal.message} You now have {user.credits} credits + {user.bonusCredits || 0} bonus credits.
      </AlertDescription>
    </Alert>
  );
}

export function NextRenewalInfo() {
  const { user } = useAuth();

  if (!user?.creditRenewal?.nextRenewalDate) {
    return null;
  }

  const nextRenewal = new Date(user.creditRenewal.nextRenewalDate);
  const now = new Date();
  const hoursUntilRenewal = Math.max(0, Math.ceil((nextRenewal.getTime() - now.getTime()) / (1000 * 60 * 60)));

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>
        Next 3 credits in {hoursUntilRenewal > 24 ? `${Math.ceil(hoursUntilRenewal / 24)} day(s)` : `${hoursUntilRenewal} hour(s)`}
      </span>
    </div>
  );
}