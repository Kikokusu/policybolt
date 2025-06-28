import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a confirmation callback with token
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    if (token && type === 'signup') {
      handleEmailConfirmation();
    }
  }, [token, type]);

  const handleEmailConfirmation = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        throw error;
      }

      setConfirmed(true);
      toast.success('Email confirmed successfully!');
      
      // Redirect to plan selection after a short delay
      setTimeout(() => {
        navigate('/select-plan');
      }, 2000);

    } catch (err: any) {
      console.error('Email confirmation error:', err);
      setError(err.message || 'Failed to confirm email. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = sessionStorage.getItem('signup_email') || localStorage.getItem('signup_email');
    
    if (!email) {
      setError('No email found. Please sign up again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw error;
      }

      toast.success('Confirmation email sent! Please check your inbox.');
    } catch (err: any) {
      console.error('Resend email error:', err);
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && token) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Confirming your email...</h2>
                <p className="text-muted-foreground">Please wait while we verify your email address.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <h2 className="text-xl font-semibold text-green-600">Email Confirmed!</h2>
                <p className="text-muted-foreground">
                  Your email has been successfully confirmed. Redirecting you to plan selection...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent you a confirmation link to verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/auth/login')}
                >
                  Sign In
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}