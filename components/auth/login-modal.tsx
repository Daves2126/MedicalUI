'use client'

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Chrome, AlertCircle, Shield, Users, Clock } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginModalProps {
  children: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      setOpen(false);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Chrome className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to MedChat AI</CardTitle>
            <CardDescription className="text-base">
              Sign in with your Google account to access personalized medical information and save your chat history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              size="lg"
              className="w-full h-12 text-base"
            >
              <Chrome className="mr-3 h-5 w-5" />
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-gray-900 text-center">Why sign in?</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Secure and private conversations</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Personalized medical information</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Access your chat history anytime</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center pt-4 border-t">
              By signing in, you agree to our Terms of Service and Privacy Policy. 
              Your medical conversations are kept private and secure.
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
