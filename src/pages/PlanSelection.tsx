import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Code,
  Zap,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStripe } from '@/hooks/useStripe';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { stripeProducts } from '@/stripe-config';
import { toast } from 'sonner';

const planFeatures = {
  'Solo Developer Plan': [
    '1 project/repository',
    'Auto-updating privacy policies',
    'Limited compliance coverage',
    'GDPR & CCPA compliance',
    'Email support',
    'GitHub integration',
  ],
  'Growing Startup': [
    'Up to 5 projects',
    'Global regulation coverage',
    'Team collaboration tools',
    'GitHub integration',
    'Priority support',
    'Auto-updating privacy policies',
  ],
};

const planPrices = {
  'Solo Developer Plan': '£29.00',
  'Growing Startup': '£79.00',
};

export function PlanSelectionPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subscriptionLoading } = useStripeSubscription();
  const { createCheckoutSession, loading: checkoutLoading } = useStripe();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect logic
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth/login');
        return;
      }
      
      // If user already has a subscription, redirect to dashboard
      if (!subscriptionLoading && hasActiveSubscription) {
        navigate('/dashboard');
        return;
      }
    }
  }, [user, authLoading, subscriptionLoading, hasActiveSubscription, navigate]);

  const handlePlanSelect = async (priceId: string, planName: string) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    setSelectedPlanId(priceId);
    setError(null);

    try {
      await createCheckoutSession(priceId, 'subscription');
    } catch (err: any) {
      console.error('Error selecting plan:', err);
      setError(err.message || 'Failed to start checkout process. Please try again.');
      toast.error('Failed to start checkout process');
    } finally {
      setSelectedPlanId(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Solo')) return Code;
    if (planName.includes('Growing')) return Zap;
    return Shield;
  };

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

  // Don't render if user is not authenticated or already has subscription
  if (!user || hasActiveSubscription) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Choose your <span className="gradient-text">plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Welcome to PolicyBolt! Select the plan that best fits your needs. 
            All plans include a 14-day free trial with full access to features.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stripeProducts.map((product, index) => {
            const Icon = getPlanIcon(product.name);
            const isPopular = product.name.includes('Growing');
            const isSelecting = checkoutLoading && selectedPlanId === product.priceId;
            const features = planFeatures[product.name as keyof typeof planFeatures] || [];
            const price = planPrices[product.name as keyof typeof planPrices] || 'Custom';

            return (
              <Card
                key={product.id}
                className={`relative card-hover ${
                  isPopular ? 'ring-2 ring-primary shadow-xl scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
                  <CardDescription className="text-base">
                    {product.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">{price}</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      14-day free trial included
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button
                    className={`w-full mb-6 ${
                      isPopular ? 'bg-primary hover:bg-primary/90' : ''
                    }`}
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect(product.priceId, product.name)}
                    disabled={checkoutLoading}
                  >
                    {isSelecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting checkout...
                      </>
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium">What's included:</div>
                    {features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-success mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-muted/30 border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">
                Questions about pricing?
              </h3>
              <p className="text-muted-foreground mb-6">
                All plans include our core AI-powered privacy policy generation. 
                You can upgrade or downgrade at any time, and we'll prorate the difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/contact')}>
                  Contact Sales
                </Button>
                <Button variant="ghost" onClick={() => navigate('/about')}>
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}