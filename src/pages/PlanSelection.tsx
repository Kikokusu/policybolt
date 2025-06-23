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
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function PlanSelectionPage() {
  const { user, loading: authLoading } = useAuth();
  const { plans, createSubscription, loading: subscriptionLoading, hasSubscription } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
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
      if (!subscriptionLoading && hasSubscription) {
        navigate('/dashboard');
        return;
      }
    }
  }, [user, authLoading, subscriptionLoading, hasSubscription, navigate]);

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSelectedPlanId(planId);

    try {
      const { error } = await createSubscription(planId);
      
      if (error) {
        throw error;
      }

      toast.success('Plan selected successfully! Welcome to PolicyBolt!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error selecting plan:', err);
      setError(err.message || 'Failed to select plan. Please try again.');
    } finally {
      setIsCreating(false);
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
  if (!user || hasSubscription) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(plan.name);
            const isPopular = plan.name.includes('Growing');
            const isEnterprise = plan.name.includes('Enterprise');
            const isSelecting = isCreating && selectedPlanId === plan.id;

            return (
              <Card
                key={plan.id}
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
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">
                        {isEnterprise ? 'Custom' : `$${plan.price}`}
                      </span>
                      {!isEnterprise && (
                        <span className="text-muted-foreground ml-1">/month</span>
                      )}
                    </div>
                    {!isEnterprise && (
                      <p className="text-sm text-muted-foreground mt-2">
                        14-day free trial included
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button
                    className={`w-full mb-6 ${
                      isPopular ? 'bg-primary hover:bg-primary/90' : ''
                    }`}
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isCreating || isEnterprise}
                  >
                    {isSelecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Selecting...
                      </>
                    ) : isEnterprise ? (
                      'Contact Sales'
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium">What's included:</div>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-success mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center text-sm font-medium">
                        <Shield className="w-4 h-4 text-primary mr-2" />
                        <span>
                          {plan.max_projects === 999999 
                            ? 'Unlimited projects' 
                            : `Up to ${plan.max_projects} project${plan.max_projects > 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                    </div>
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