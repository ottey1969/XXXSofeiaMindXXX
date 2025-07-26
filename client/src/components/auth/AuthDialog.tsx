import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister, useVerifyEmail } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [userId, setUserId] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  const { toast } = useToast();
  const registerMutation = useRegister();
  const verifyMutation = useVerifyEmail();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Starting registration for:', email);
      const result = await registerMutation.mutateAsync(email);
      console.log('Registration result:', result);
      setUserId(result.userId);
      
      // Check if user is already verified and logged in
      if (result.autoLogin) {
        console.log('User has autoLogin, redirecting to chat');
        toast({
          title: "Welcome back!",
          description: "You can start creating content immediately with your free credits."
        });
        onOpenChange(false);
        window.location.reload(); // Refresh to load authenticated state
        return;
      }
      
      // User needs email verification
      if (result.requiresVerification) {
        console.log('User requires verification, showing verification dialog');
        setIsVerifying(true);
        if (result.emailSent) {
          toast({
            title: "Verification email sent",
            description: "Please check your email and enter the 6-digit code."
          });
        } else {
          toast({
            title: "Registration Complete",
            description: `Contact WhatsApp ${result.supportContact} with your email for verification, or wait for the verification email.`,
            duration: 8000
          });
        }
      } else {
        console.log('Unexpected registration result - no autoLogin or requiresVerification');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await verifyMutation.mutateAsync(verificationToken);
      toast({
        title: "Email verified!",
        description: "Welcome to Sofeia AI. You have 3 free credits to start."
      });
      onOpenChange(false);
      setIsVerifying(false);
      setEmail("");
      setVerificationToken("");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
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
              />
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
          </form>
        )}

        {false && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Sending Link..." : "Send New Verification Link"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              We'll send a new verification link to access your account.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setIsVerifying(false);
                setIsReturningUser(false);
                setEmail("");
              }}
            >
              Use Different Email
            </Button>
          </form>
        )}

        {isVerifying && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">📧 Check Your Email</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                We've sent a verification link to your email address. Click the link in the email to verify your account.
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Don't see the email? Check your spam folder or contact support.
              </p>
            </div>
            
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Or Enter Verification Code</Label>
                <Input
                  id="token"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  placeholder="Enter code from email"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Sent to: {email}
              </p>
              
              <div className="text-center space-y-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setIsVerifying(false)}
                >
                  Use Different Email
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
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}