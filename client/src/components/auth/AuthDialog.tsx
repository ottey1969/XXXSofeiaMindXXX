import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister, useLogin, useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userId, setUserId] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const registerMutation = useRegister();
  const loginMutation = useLogin();

  // Set email from logged-in user and make it permanent
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await registerMutation.mutateAsync({ email, marketingConsent });
      setUserId(result.userId);
      
      // Check if user is already verified and logged in
      if (result.autoLogin) {
        toast({
          title: "Welcome back!",
          description: "You can start creating content immediately with your free credits."
        });
        onOpenChange(false);
        window.location.reload(); // Refresh to load authenticated state
        return;
      }
      
      // Registration complete - show success dialog
      setIsVerifying(true);
      toast({
        title: "Registration Complete!",
        description: "You can start creating content with your 3 free credits.",
        duration: 5000
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {!isVerifying ? "Welcome to Sofeia AI" : "Verify Your Email"}
          </DialogTitle>
        </DialogHeader>

        {!isVerifying && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                readOnly={!!user?.email}
                className={user?.email ? "bg-muted cursor-not-allowed" : ""}
              />
              {user?.email && (
                <p className="text-xs text-muted-foreground">
                  This is your registered email address
                </p>
              )}
            </div>
            
            {/* GDPR Compliance */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  required
                  className="mt-1 accent-blue-600"
                />
                <Label htmlFor="gdprConsent" className="text-xs leading-4 cursor-pointer">
                  <span className="text-red-500">*</span> I agree to the{" "}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  . I consent to processing my email for account creation and service delivery.
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 accent-blue-600"
                />
                <Label htmlFor="marketingConsent" className="text-xs leading-4 cursor-pointer text-gray-600">
                  📧 I'd like to receive marketing emails about Sofeia AI updates and ContentScale content tips <em>(optional)</em>
                </Label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Sending..." : "Get Started with 3 Free Credits"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              No password required. We'll send a verification link to your email.
            </p>
            <p className="text-sm text-center">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={() => setIsReturningUser(true)}
                className="text-primary hover:underline"
              >
                Login here
              </button>
            </p>
          </form>
        )}

        {isReturningUser && !isVerifying && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await loginMutation.mutateAsync({ email });
              toast({
                title: "Login Successful!",
                description: "Welcome back to Sofeia AI."
              });
              onOpenChange(false);
              window.location.reload();
            } catch (error: any) {
              toast({
                title: "Login failed",
                description: error.message || "Please try registering instead",
                variant: "destructive"
              });
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging In..." : "Login to Your Account"}
            </Button>
            <p className="text-sm text-center">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={() => {
                  setIsReturningUser(false);
                  setEmail("");
                }}
                className="text-primary hover:underline"
              >
                Register here
              </button>
            </p>
          </form>
        )}

        {isVerifying && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">🎉 Registration Complete!</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                You can start using Sofeia AI immediately with your 3 free credits.
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                For full access to all features, contact WhatsApp for account verification.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  window.location.reload();
                }}
                className="w-full"
              >
                Start Creating Content
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Need help? Contact{" "}
                <a 
                  href="https://wa.me/31628073996" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WhatsApp: +31 6 2807 3996
                </a>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}