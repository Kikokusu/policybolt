import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  Code,
  CheckCircle,
  ArrowRight,
  GitBranch,
  FileText,
  MousePointer,
  Layers,
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

const features = [
  {
    icon: Code,
    title: 'Code-aware scanning',
    description: 'Reads your repo to spot new APIs & regions.',
    subtitle: 'Automatically detects privacy-relevant changes in your codebase.',
  },
  {
    icon: Zap,
    title: 'GPT-powered drafting',
    description: 'Generates lawyer-grade copy in seconds.',
    subtitle: 'AI creates compliant policy language that actually makes sense.',
  },
  {
    icon: MousePointer,
    title: 'One-click approve',
    description: 'Review highlights, hit Approve, done.',
    subtitle: 'Simple approval workflow keeps you in control without the hassle.',
  },
  {
    icon: Layers,
    title: 'Live embed widget',
    description: 'Your site always shows the latest version.',
    subtitle: 'Dynamic widget updates automatically - no manual deployments.',
  },
];

const howItWorksSteps = [
  {
    number: 1,
    title: 'Connect GitHub',
    description: 'OAuth in 30 seconds.',
    detail: 'Simple one-click integration with your GitHub repository. PolicyBolt starts monitoring immediately.',
    icon: GitBranch,
  },
  {
    number: 2,
    title: 'Ship code',
    description: 'PolicyBolt drafts updates automatically.',
    detail: 'Every time you add features or APIs, our AI detects changes and generates policy updates.',
    icon: Code,
  },
  {
    number: 3,
    title: 'Embed once',
    description: 'Copy a `<script>` tag and forget about it.',
    detail: 'One simple script tag keeps your privacy policy current forever. No more manual updates.',
    icon: FileText,
  },
];

const pricingPlans = [
  {
    name: 'Solo Developer',
    description: 'Perfect for indie makers and solo founders',
    price: '£29',
    period: 'per month',
    badge: null,
    features: [
      '1 project/repository',
      'Auto-updating privacy policies',
      'Limited compliance coverage',
      'GDPR & CCPA compliance',
      'Email support',
      'GitHub integration',
    ],
    cta: 'Start Free Trial',
    popular: false,
    icon: Code,
  },
  {
    name: 'Growing Startup',
    description: 'Best for small teams shipping fast',
    price: '£79',
    period: 'per month',
    badge: 'Most Popular',
    features: [
      'Up to 5 projects',
      'Global regulation coverage',
      'Team collaboration tools',
      'GitHub integration',
      'Priority support',
      'Auto-updating privacy policies',
    ],
    cta: 'Start Free Trial',
    popular: true,
    icon: Zap,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: 'Custom',
    period: 'pricing',
    badge: null,
    features: [
      'Unlimited projects',
      'Custom compliance frameworks',
      'Dedicated account manager',
      'Advanced team management',
      'Custom integrations',
      'SLA guarantees',
      'On-premise deployment options',
      'Advanced analytics & reporting',
    ],
    cta: "Let's Talk",
    popular: false,
    icon: Shield,
  },
];

export function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { hasSubscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  // Redirect authenticated users to appropriate page
  useEffect(() => {
    if (!authLoading && user) {
      if (!subscriptionLoading) {
        if (hasSubscription) {
          navigate('/dashboard');
        } else {
          navigate('/select-plan');
        }
      }
    }
  }, [user, authLoading, hasSubscription, subscriptionLoading, navigate]);

  // Show loading state while checking authentication
  if (authLoading || (user && subscriptionLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              <Cpu className="w-3 h-3 mr-1" />
              Developer-First Privacy Solution
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="gradient-text">AI-Powered</span> Auto-Updating
              <br />
              Privacy Policies
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Stay compliant effortlessly with AI-powered privacy policy management. Automatically detect 
              changes in your app and update your privacy policies in real-time, ensuring continuous 
              compliance with global regulations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built for
              <span className="gradient-text"> developers who ship fast</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Auto-updating, developer-first privacy-policy generator for single-user MVPs. 
              Focus on building features, not legal compliance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-hover border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-lg font-medium text-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.subtitle}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How <span className="gradient-text">PolicyBolt</span> Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to never worry about privacy compliance again
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-8">
                    {/* Large numbered circle */}
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-white">{step.number}</span>
                    </div>
                    {/* Simple line icon */}
                    <div className="w-12 h-12 bg-white border-2 border-primary rounded-full flex items-center justify-center mx-auto -mt-2">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-lg text-primary font-medium mb-4">{step.description}</p>
                  <p className="text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Code example */}
          <div className="mt-16 max-w-2xl mx-auto">
            <Card className="bg-slate-900 text-white border-0">
              <CardHeader>
                <CardTitle className="text-white">Embed once, update forever</CardTitle>
                <CardDescription className="text-slate-300">
                  Copy this script tag to your site and your privacy policy stays current automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                  <code className="text-green-400">
                    {'<script src="https://widget.policybolt.com/v1/policy.js"'}
                    <br />
                    <span className="text-blue-400 ml-8">{'data-project="your-project-id"'}</span>
                    <br />
                    <span className="text-blue-400 ml-8">{'data-style="minimal">'}</span>
                    <br />
                    {'</script>'}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Simple pricing for <span className="gradient-text">developers</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your development workflow. All plans include 
              auto-updating privacy policies and continuous compliance monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={index}
                  className={`relative card-hover ${
                    plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-4 py-1">
                        {plan.badge}
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
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">/{plan.period}</span>
                      </div>
                      {plan.name !== 'Enterprise' && (
                        <p className="text-sm text-muted-foreground mt-2">
                          14-day free trial included
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button
                      className={`w-full mb-6 ${
                        plan.popular ? 'bg-primary hover:bg-primary/90' : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to={plan.cta === "Let's Talk" ? '/contact' : '/auth/signup'}>
                        {plan.cta}
                      </Link>
                    </Button>
                    
                    <div className="space-y-3">
                      <div className="text-sm font-medium">What's included:</div>
                      {plan.features.map((feature, featureIndex) => (
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-primary text-white border-0">
            <CardContent className="py-16 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Stop hoping. Start knowing.
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join developers who've automated their privacy compliance. 
                Focus on building great products while PolicyBolt handles the legal stuff.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="text-lg px-8">
                  <Link to="/auth/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 border-white/20 text-white hover:bg-white/10">
                  <Link to="/contact">Talk to Founder</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}