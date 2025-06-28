import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/shared/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";

// Import wizard steps
import { ProjectNameStep } from "@/components/wizard/ProjectNameStep";
import { EnglishPreferenceStep } from "@/components/wizard/EnglishPreferenceStep";
import { UserGeographyStep } from "@/components/wizard/UserGeographyStep";
import { AIServicesStep } from "@/components/wizard/AIServicesStep";
import { HostingProviderStep } from "@/components/wizard/HostingProviderStep";
import { GitHubConnectionStep } from "@/components/wizard/GitHubConnectionStep";

export interface ProjectFormData {
  // Step 1: Project Name & Purpose
  projectName: string;
  purpose: "website" | "mobile-app" | "saas-platform" | "";

  // Step 2: English Spelling Preference
  englishPreference: "us" | "uk" | "";

  // Step 3: User Geography
  geographyScope: "worldwide" | "specific-regions" | "";
  selectedRegions: string[];

  // Step 4: AI-Based Services
  aiUsage: "no-ai" | "basic-ai" | "advanced-ai" | "";
  aiTypes: string[];
  aiDataUsage: string[];

  // Step 5: Hosting Provider
  hostingProvider: string;
  hostingRegion: string;
  customHosting: string;

  // Step 6: GitHub Repository
  repositoryUrl: string;
}

const initialFormData: ProjectFormData = {
  projectName: "",
  purpose: "",
  englishPreference: "",
  geographyScope: "",
  selectedRegions: [],
  aiUsage: "",
  aiTypes: [],
  aiDataUsage: [],
  hostingProvider: "",
  hostingRegion: "",
  customHosting: "",
  repositoryUrl: "",
};

const steps = [
  { id: 1, title: "Project Details", description: "Name and purpose" },
  { id: 2, title: "Language Preference", description: "English spelling" },
  { id: 3, title: "User Geography", description: "Target regions" },
  { id: 4, title: "AI Services", description: "AI features used" },
  { id: 5, title: "Hosting Provider", description: "Infrastructure details" },
  { id: 6, title: "GitHub Repository", description: "Repository setup" },
];

export function AddProjectPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    subscription,
    loading: subscriptionLoading,
    hasActiveSubscription,
  } = useStripeSubscription();
  const { projects, createProject } = useProjects();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect logic
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth/login");
      return;
    }

    if (
      !authLoading &&
      !subscriptionLoading &&
      user &&
      !hasActiveSubscription
    ) {
      navigate("/select-plan");
      return;
    }
  }, [user, authLoading, subscriptionLoading, hasActiveSubscription, navigate]);

  // Check project limits
  const getMaxProjects = () => {
    if (!subscription || !subscription.price_id) {
      return 0;
    }

    // Only allow project creation for active or trialing subscriptions
    if (
      !["active", "trialing"].includes(subscription.subscription_status || "")
    ) {
      return 0;
    }

    // Map Stripe price IDs to project limits
    if (subscription.price_id === "price_1RddANKSNriwT6N669BShQb0") {
      return 1; // Solo Developer
    } else if (subscription.price_id === "price_1RddB1KSNriwT6N6Ku1vE00V") {
      return 5; // Growing Startup
    }

    return 0;
  };

  const maxProjects = getMaxProjects();
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const canCreateProject = maxProjects > 0 && activeProjects < maxProjects;

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

  if (!canCreateProject) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Project Limit Reached</h2>
              <p className="text-muted-foreground mb-6">
                You've reached the maximum number of projects ({maxProjects})
                for your current plan. Upgrade to add more projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/dashboard")}>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/settings")}
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.projectName.trim() && formData.purpose);
      case 2:
        return !!formData.englishPreference;
      case 3:
        return !!(
          formData.geographyScope &&
          (formData.geographyScope === "worldwide" ||
            formData.selectedRegions.length > 0)
        );
      case 4:
        return !!formData.aiUsage;
      case 5:
        return !!(
          formData.hostingProvider &&
          (formData.hostingProvider !== "other" ||
            formData.customHosting.trim())
        );
      case 6:
        return !!formData.repositoryUrl.trim(); // Repository URL is now always required
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError(null);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      setError("Please complete all required fields before continuing.");
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create project configuration object
      const projectConfig = {
        purpose: formData.purpose,
        englishPreference: formData.englishPreference,
        geographyScope: formData.geographyScope,
        selectedRegions: formData.selectedRegions,
        aiUsage: formData.aiUsage,
        aiTypes: formData.aiTypes,
        aiDataUsage: formData.aiDataUsage,
        hostingProvider: formData.hostingProvider,
        hostingRegion: formData.hostingRegion,
        customHosting: formData.customHosting,
      };

      // Extract repository name from URL (now always provided)
      let repositoryName = null;
      if (formData.repositoryUrl) {
        const match = formData.repositoryUrl.match(
          /github\.com\/(.+?)(?:\.git)?(?:\/)?$/
        );
        repositoryName = match ? match[1] : null;
      }

      const { error } = await createProject({
        name: formData.projectName,
        repository_url: formData.repositoryUrl, // Always save the repository URL
        github_synced: false, // Will be set to true when actually connected via GitHub App
        github_installation_id: null,
        github_repository_name: repositoryName,
        config: projectConfig,
      });

      if (error) {
        throw error;
      }

      toast.success("Project created successfully!");
      navigate("/dashboard/projects");
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectNameStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <EnglishPreferenceStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <UserGeographyStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <AIServicesStep formData={formData} updateFormData={updateFormData} />
        );
      case 5:
        return (
          <HostingProviderStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 6:
        return (
          <GitHubConnectionStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  // Calculate progress: 0% at start of step 1, 100% when completed
  const progressPercentage = ((currentStep - 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Add New <span className="gradient-text">Project</span>
              </h1>
              <p className="text-muted-foreground">
                Set up your project to start generating privacy policies
                automatically
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>

            {/* Glassmorphism Progress Bar */}
            <div className="relative">
              <Progress value={progressPercentage} className="h-2" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full backdrop-blur-sm"></div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center space-y-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id < currentStep
                        ? "bg-success text-white"
                        : step.id === currentStep
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {currentStep < steps.length ? (
              <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !validateStep(currentStep)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    Create Project
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
