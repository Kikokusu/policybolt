import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  ArrowRight,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Link } from 'react-router-dom';

export function SuccessPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, hasActiveSubscription, loading: subscriptionLoading } = useStripeSubscription();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
      return;
    }

    // Give some time for webhook to process and subscription to sync
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, authLoading, navigate]);

  if (authLoading || subscriptionLoading || verifying) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Processing your subscription...</h2>
            <p className="text-muted-foreground">
              Please wait while we set up your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="shadow-lg border-0 max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            {hasActiveSubscription ? (
              <>
                <div className="w-20 h-20 bg-success rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold mb-4">
                  Welcome to <span className="gradient-text">PolicyBolt</span>!
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Your subscription has been successfully activated. You're all set to start 
                  generating AI-powered privacy policies for your projects.
                </p>

                {subscription && (
                  <div className="bg-muted/30 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Subscription Details</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <Badge 
                          variant="secondary" 
                          className={subscription.subscription_status === 'active' ? 'bg-success text-white' : 'bg-yellow-500 text-white'}
                        >
                          {subscription.subscription_status === 'trialing' ? 'Free Trial' : 'Active'}
                        </Badge>
                      </div>
                      
                      {subscription.current_period_end && (
                        <div className="flex items-center justify-between">
                          <span>Next billing:</span>
                          <span>{new Date(subscription.current_period_end * 1000).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {subscription.payment_method_last4 && (
                        <div className="flex items-center justify-between">
                          <span>Payment method:</span>
                          <span>•••• {subscription.payment_method_last4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold mb-4">What's next?</h3>
                  <div className="grid grid-cols-1 gap-4 text-left">
                    <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Create your first project</h4>
                        <p className="text-sm text-muted-foreground">
                          Set up your project and connect your GitHub repository
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Generate your privacy policy</h4>
                        <p className="text-sm text-muted-foreground">
                          Our AI will analyze your project and create a compliant policy
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Embed and automate</h4>
                        <p className="text-sm text-muted-foreground">
                          Add the widget to your site for automatic updates
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button size="lg" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/dashboard/projects/new">
                      Create First Project
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold mb-4">
                  Payment Processing
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  We're still processing your payment. This usually takes just a few moments. 
                  You'll receive an email confirmation once everything is set up.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => window.location.reload()}>
                    <Loader2 className="w-4 h-4 mr-2" />
                    Check Status
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}