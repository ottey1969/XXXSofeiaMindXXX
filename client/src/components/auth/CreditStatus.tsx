import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ExternalLink } from "lucide-react";
import { NextRenewalInfo } from "@/components/CreditRenewalNotification";

export default function CreditStatus() {
  const { user } = useAuth();

  if (!user) return null;

  const handleContactSupport = () => {
    // Open WhatsApp for direct credit purchase
    window.open('https://wa.me/31628073996?text=Hi%2C%20I%20need%20more%20credits%20for%20Sofeia%20AI', '_blank');
  };

  const handleJoinCommunity = () => {
    // Open Facebook group for community support
    window.open('https://www.facebook.com/groups/1079321647257618', '_blank');
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {user.credits} credit{user.credits !== 1 ? 's' : ''} + {user.bonusCredits || 0} bonus
        </p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        <NextRenewalInfo />
      </div>
      {(user.credits + (user.bonusCredits || 0)) <= 1 && (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleContactSupport}
            className="gap-1"
            variant={(user.credits + (user.bonusCredits || 0)) === 0 ? "default" : "outline"}
          >
            <ExternalLink className="h-3 w-3" />
            {(user.credits + (user.bonusCredits || 0)) === 0 ? "Get Credits" : "Buy More"}
          </Button>
          <Button 
            size="sm" 
            onClick={handleJoinCommunity}
            variant="outline"
            className="gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Community
          </Button>
        </div>
      )}
    </div>
  );
}