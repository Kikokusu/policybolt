import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CreditCard,
  User,
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle,
  Code,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

const todoItems = [
  {
    id: 1,
    category: 'Stripe Integration',
    title: 'User can sign up for the plan using Stripe',
    priority: 'High',
    status: 'Todo',
    description: 'Implement complete Stripe checkout flow for plan subscriptions',
    tasks: [
      'Set up Stripe account and get API keys',
      'Install and configure Stripe dependencies',
      'Create Stripe checkout components',
      'Update plan selection flow',
      'Create Stripe webhook handler',
      'Database schema updates',
      'Testing and validation'
    ]
  },
  {
    id: 2,
    category: 'Subscription Management',
    title: 'User can cancel trial or plan',
    priority: 'High',
    status: 'Todo',
    description: 'Allow users to cancel their subscription with proper handling of trial vs paid plans',
    tasks: [
      'Create cancellation UI components',
      'Implement cancellation logic',
      'Handle post-cancellation states',
      'Edge cases and error handling'
    ]
  },
  {
    id: 3,
    category: 'Retention Strategy',
    title: 'Offer 50% discount for 3 months before allowing cancellation',
    priority: 'Medium',
    status: 'Todo',
    description: 'Implement retention flow with discount offer to reduce churn',
    tasks: [
      'Create discount offer UI',
      'Set up Stripe discount coupons',
      'Implement retention flow logic',
      'Database tracking for retention',
      'Post-discount handling',
      'A/B testing framework'
    ]
  },
  {
    id: 4,
    category: 'Infrastructure',
    title: 'Supporting Infrastructure & Security',
    priority: 'High',
    status: 'Todo',
    description: 'Essential infrastructure components for payment processing',
    tasks: [
      'Environment configuration',
      'Security implementation',
      'Error handling and monitoring',
      'Testing infrastructure'
    ]
  },
  {
    id: 5,
    category: 'User Experience',
    title: 'Enhanced Billing & Account Management',
    priority: 'Medium',
    status: 'Todo',
    description: 'Comprehensive billing management and user account features',
    tasks: [
      'Billing dashboard',
      'Plan management features',
      'Email notifications',
      'Customer support integration'
    ]
  }
];

const priorityColors = {
  High: 'bg-red-500 text-white',
  Medium: 'bg-yellow-500 text-white',
  Low: 'bg-green-500 text-white'
};

const statusColors = {
  Todo: 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  Done: 'bg-green-500 text-white'
};

export function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, hasSubscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && !subscriptionLoading && user && !hasSubscription) {
      navigate('/select-plan');
      return;
    }
  }, [user, authLoading, subscriptionLoading, hasSubscription, navigate]);

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

  if (!user || !hasSubscription) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="space-y-6">
            {/* Account Information */}
            <Card className="shadow-lg border-0">
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
                <Button variant="outline" className="w-full" disabled>
                <Button variant="outline" className="w-full" asChild>
                  <RouterLink to="/dashboard/profile">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </RouterLink>
                </Button>
              </CardContent>
            </Card>

            {/* Current Subscription */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Current Subscription</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <Badge variant="secondary">{subscription?.plan?.name || 'Unknown'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge 
                    variant="secondary" 
                    className={subscription?.status === 'trial' ? 'bg-yellow-500 text-white' : 'bg-success text-white'}
                  >
                    {subscription?.status === 'trial' ? 'Free Trial' : 'Active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price</span>
                  <span className="text-sm">${subscription?.plan?.price || 0}/month</span>
                </div>
                {subscription?.trial_ends_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trial Ends</span>
                    <span className="text-sm">{new Date(subscription.trial_ends_at).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="space-y-2 pt-4 border-t">
                  <Button variant="outline" className="w-full" disabled>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing (Todo)
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Change Plan (Todo)
                  </Button>
                  <Button variant="destructive" className="w-full" disabled>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cancel Subscription (Todo)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Development Todo List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Development Roadmap</span>
                </CardTitle>
                <CardDescription>
                  High-level tasks for implementing Stripe integration, subscription management, and retention features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {todoItems.map((item) => (
                    <AccordionItem key={item.id} value={`item-${item.id}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant="secondary" 
                              className={priorityColors[item.priority as keyof typeof priorityColors]}
                            >
                              {item.priority}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className={statusColors[item.status as keyof typeof statusColors]}
                            >
                              {item.status}
                            </Badge>
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Tasks:</h4>
                            <ul className="space-y-2">
                              {item.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}