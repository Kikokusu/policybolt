import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/shared/navigation";
import { Footer } from "@/components/shared/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  Code,
  Zap,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Heart,
  Rocket,
  GitBranch,
  FileText,
  Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const beliefs = [
  {
    icon: Shield,
    title: "Innovation shouldn't break the rules",
    description: "Creativity and compliance can, and should, coexist.",
  },
  {
    icon: Zap,
    title: "Automation beats anxiety",
    description:
      "If a task is critical yet repetitive, software should handle it.",
  },
  {
    icon: Heart,
    title: "Clarity builds trust",
    description:
      "Users deserve to know exactly how their data is handled—always.",
  },
];

const whoWeServe = [
  {
    icon: Code,
    title: "Indie makers & no-code founders",
    description:
      "Who want legal peace of mind without becoming privacy experts.",
  },
  {
    icon: Users,
    title: "Lean dev teams",
    description:
      "Drowning in feature requests and happy to off-load the paperwork.",
  },
];

const processSteps = [
  {
    icon: GitBranch,
    title: "Connect your GitHub repo once",
    description:
      "Simple one-click integration that starts monitoring immediately.",
  },
  {
    icon: Code,
    title: "We read each commit",
    description:
      "Detect data-relevant changes and generate region-specific privacy policies with GPT-4o.",
  },
  {
    icon: FileText,
    title: "Auto-publish on every deploy",
    description:
      "Refresh text, version diffs, and publish approved copy via embeddable widget.",
  },
];

const roadmapItems = [
  {
    title: "Today we keep your privacy policy accurate",
    status: "current",
  },
  {
    title: "Tomorrow we'll release auto-syncing cookie consent",
    status: "next",
  },
  {
    title:
      "Soon we'll cover terms of service, DPAs, and every legal doc your SaaS or mobile app needs",
    status: "future",
  },
];

export function AboutPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasSubscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  // Redirect authenticated users to appropriate page
  useEffect(() => {
    if (!authLoading && user) {
      if (!subscriptionLoading) {
        if (hasSubscription) {
          navigate("/dashboard");
        } else {
          navigate("/select-plan");
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

  // Don't render if user is authenticated
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6">
              <Shield className="w-3 h-3 mr-1" />
              About PolicyBolt
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Keep Vibing on Product
              <br />
              <span className="block h-2" aria-hidden="true"></span>
              <span className="gradient-text">
                Let PolicyBolt Handle Compliance
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              From privacy policies today to cookie banners and DPAs tomorrow,
              PolicyBolt drafts, updates, and publishes every legal document
              automatically while you keep building.
            </p>
          </div>
        </div>
      </section>

      {/* Why We Exist Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why <span className="gradient-text">we exist</span>
            </h2>
          </div>

          <Card className="shadow-lg border-0 mb-12">
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Low-code and AI have turned software creation into pure
                momentum: founders can "vibe-code" a full SaaS in a weekend.
                What hasn't changed is the legal responsibility that comes with
                handling user data. A single new API or data-center region can
                trigger GDPR, CCPA, or other regulations overnight—and busy
                teams rarely have the bandwidth to keep those clauses current.
              </p>
              <div className="text-center">
                <h3 className="text-2xl font-bold gradient-text mb-4">
                  PolicyBolt bridges that gap.
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Process Steps */}
          <div className="space-y-6 mb-12">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="card-hover border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-lg border-0 bg-muted/30">
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground leading-relaxed text-center mb-6">
                On every deploy, we refresh the text, version the diff, and
                publish the approved copy via an embeddable widget—no templates,
                no manual edits, no lawyer fees.
              </p>

              <div className="space-y-4 mb-6">
                {roadmapItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.status === "current"
                          ? "bg-success"
                          : item.status === "next"
                          ? "bg-primary"
                          : "bg-muted-foreground"
                      }`}
                    ></div>
                    <p
                      className={`text-sm ${
                        item.status === "current"
                          ? "text-success font-medium"
                          : item.status === "next"
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  Keep shipping at the speed of inspiration; PolicyBolt keeps
                  the compliance matched to every push.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="gradient-text">promise</span>
            </h2>
          </div>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  PolicyBolt turns privacy compliance into set-it-and-forget-it.
                </h3>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed text-center">
                Connect your GitHub repo once; we read the code (not just a
                questionnaire), draft the right clauses with OpenAI, track every
                version, and publish a live policy that updates itself. You keep
                vibing on product and never wonder if your privacy page is out
                of date.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Who <span className="gradient-text">we serve</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whoWeServe.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="card-hover border-0 shadow-md">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What <span className="gradient-text">we believe</span>
            </h2>
          </div>

          <div className="space-y-6">
            {beliefs.map((belief, index) => {
              const Icon = belief.icon;
              return (
                <Card key={index} className="card-hover border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">
                          {belief.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {belief.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Road Ahead */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              The road <span className="gradient-text">ahead</span>
            </h2>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed text-center mb-8">
                Today we handle privacy policies. Tomorrow we'll guard every
                clause that keeps your product trustworthy—terms of service,
                data-processing agreements, the works—all on the same
                "write-it-once, update-forever" autopilot.
              </p>

              <div className="text-center">
                <h3 className="text-2xl font-bold gradient-text mb-4">
                  PolicyBolt. Keep coding, we'll keep you compliant.
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to focus on what matters?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join developers who've automated their privacy compliance and never
            look back.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8"
            >
              <Link to="/contact">Talk to Founder</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
