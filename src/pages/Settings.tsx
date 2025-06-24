import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  User,
  Settings as SettingsIcon,
  AlertTriangle,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { CancellationWizard } from '@/components/CancellationWizard';
import { SupportRequestForm } from '@/components/SupportRequestForm';
import { stripeProducts } from '@/stripe-config';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, hasActiveSubscription, loading: subscriptionLoading } = useStripeSubscription();
  const navigate = useNavigate();
  const [showCancellationWizard, setShowCancellationWizard] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && !subscriptionLoading && user && !hasActiveSubscription) {
      navigate('/select-plan');
      return;
    }
  }, [user, authLoading, subscriptionLoading, hasActiveSubscription, navigate]);

  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasActiveSubscription) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  // Get plan name from Stripe subscription
  const getPlanName = () => {
    if (!subscription) return 'Unknown Plan';
    
    // Find the plan name from stripe config
    const product = stripeProducts.find(p => p.priceId === subscription.price_id);
    if (product) {
      return product.name.replace(' Plan', ''); // Remove "Plan" suffix for cleaner display
    }
    
    return 'Pro Plan';
  };

  const isTrialing = subscription?.subscription_status === 'trialing';
  const isActive = subscription?.subscription_status === 'active';
  const canChangeplan = isActive; // Only allow plan changes for active subscriptions

  const handleManageBilling = async () => {
    // Open Stripe customer portal in a new tab
    window.open('https://billing.stripe.com/p/login/9B6dRa0u5diKdi9gpL4wM00', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Account <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your account, subscription, and development roadmap
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Account Information */}
          <div className="h-full">
            {/* Account Information */}
            <Card className="shadow-lg border-0 h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <RouterLink to="/dashboard/profile">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </RouterLink>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Current Subscription */}
          <div className="h-full">
            {/* Current Subscription */}
            <Card className="shadow-lg border-0 h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Current Subscription</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <Badge variant="secondary">{getPlanName()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge 
                    variant="secondary" 
                    className={isTrialing ? 'bg-yellow-500 text-white' : 'bg-success text-white'}
                  >
                    {isTrialing ? 'Free Trial' : 'Active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price</span>
                  <span className="text-sm">
                    {subscription?.price_id === 'price_1RdTBsKSNriwT6N60Z6lrIQQ' ? '£29' : '£79'}/month
                  </span>
                </div>
                {isTrialing && subscription?.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trial Ends</span>
                    <span className="text-sm">{new Date(subscription.current_period_end * 1000).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="space-y-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleManageBilling}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                        Manage Billing
                  </Button>
                  {canChangeplan ? (
                    <Button variant="outline" className="w-full">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Change Plan
                    </Button>
                  ) : (
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Plan changes are available after your trial period ends
                      </p>
                    </div>
                  )}
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowCancellationWizard(true)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {isTrialing ? 'Cancel Trial' : 'Cancel Subscription'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>Support & Help</span>
                </CardTitle>
                <CardDescription>
                  Need assistance? Our support team is here to help you with any questions or issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SupportRequestForm />
                  <Button variant="outline" asChild>
                    <RouterLink to="/contact">
                      <CreditCard className="w-4 h-4 mr-2" />
                      General Contact
                    </RouterLink>
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Quick Help</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Check our documentation for common questions</p>
                    <p>• Use the support form for technical issues</p>
                    <p>• Billing questions are handled within 4 hours</p>
                    <p>• Critical issues receive priority support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancellation Wizard */}
      <CancellationWizard
        open={showCancellationWizard}
        onOpenChange={setShowCancellationWizard}
        onSuccess={() => {
          // Refresh the page or redirect after successful cancellation
          window.location.reload();
        }}
      />
    </div>
  );
}