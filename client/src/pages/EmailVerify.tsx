import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function EmailVerify() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in URL');
      return;
    }

    // Verify the token
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      return response.json();
    })
    .then(() => {
      setStatus('success');
      setMessage('Email verified successfully! You can now access your account.');
      
      // Redirect to main app after 2 seconds
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    })
    .catch((error) => {
      setStatus('error');
      setMessage(error.message || 'Verification failed. Please try again.');
    });
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'verifying' && <Loader2 className="h-6 w-6 animate-spin text-blue-600" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
            
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  🎉 Welcome to Sofeia AI! You now have 3 free credits to create amazing content.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the app...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  Need help with verification?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  📱 WhatsApp: +31 6 2807 3996
                </p>
              </div>
              
              <Button onClick={() => setLocation('/')} className="w-full">
                Go to Home Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}