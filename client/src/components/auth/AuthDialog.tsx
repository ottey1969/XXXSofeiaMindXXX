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
  const [step, setStep] = useState<"email" | "verify" | "signin">("email");
  const [userId, setUserId] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  const { toast } = useToast();
  const registerMutation = useRegister();
  const verifyMutation = useVerifyEmail();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await registerMutation.mutateAsync(email);
      setUserId(result.userId);
      setVerificationToken(result.verificationToken); // Auto-fill for demo
      setStep("verify");
      toast({
        title: "Verification email sent",
        description: "Please check your email and enter the verification code."
      });
    } catch (error: any) {
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
      setStep("email");
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
            {step === "email" ? "Welcome to Sofeia AI" : 
             step === "signin" ? "Welcome Back!" : 
             "Verify Your Email"}
          </DialogTitle>
        </DialogHeader>

        {step === "email" && (
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

        {step === "signin" && (
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
                setStep("email");
                setIsReturningUser(false);
                setEmail("");
              }}
            >
              Use Different Email
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="Enter verification code"
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
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={() => setStep("email")}
            >
              Use Different Email
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}