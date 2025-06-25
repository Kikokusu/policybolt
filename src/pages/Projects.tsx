import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/shared/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Shield,
  GitBranch,
  Plus,
  Trash2,
  Link,
  Unlink,
  Globe,
  Code,
  Smartphone,
  Layers,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  MapPin,
  Server,
  Bot,
  Brain,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";
import { getGitHubDevConfig } from "@/lib/github-dev-config";

const getPurposeIcon = (purpose: string) => {
  switch (purpose) {
    case "website":
      return Globe;
    case "mobile-app":
      return Smartphone;
    case "saas-platform":
      return Layers;
    default:
      return Code;
  }
};

const getPurposeLabel = (purpose: string) => {
  switch (purpose) {
    case "website":
      return "Website";
    case "mobile-app":
      return "Mobile App";
    case "saas-platform":
      return "SaaS Platform";
    default:
      return "Unknown";
  }
};

const getAIIcon = (aiUsage: string) => {
  switch (aiUsage) {
    case "no-ai":
      return CheckCircle;
    case "basic-ai":
      return Bot;
    case "advanced-ai":
      return Brain;
    default:
      return Zap;
  }
};

const getAILabel = (aiUsage: string) => {
  switch (aiUsage) {
    case "no-ai":
      return "No AI Features";
    case "basic-ai":
      return "Basic AI Features";
    case "advanced-ai":
      return "Advanced AI Systems";
    default:
      return "Unknown";
  }
};

const formatRegions = (regions: string[]) => {
  if (!regions || regions.length === 0) return "None selected";

  const regionMap: { [key: string]: string } = {
    us: "United States",
    eu: "European Union",
    uk: "United Kingdom",
    canada: "Canada",
    australia: "Australia",
    "asia-pacific": "Asia-Pacific",
    "latin-america": "Latin America",
    other: "Other Regions",
  };

  return regions.map((r) => regionMap[r] || r).join(", ");
};

const formatAITypes = (aiTypes: string[]) => {
  if (!aiTypes || aiTypes.length === 0) return "None";

  const typeMap: { [key: string]: string } = {
    recommendations: "Recommendations",
    chatbots: "Chatbots",
    personalization: "Personalization",
    "fraud-detection": "Fraud Detection",
    "content-moderation": "Content Moderation",
    "image-recognition": "Image Recognition",
    "voice-processing": "Voice Processing",
    "predictive-analytics": "Predictive Analytics",
  };

  return aiTypes.map((t) => typeMap[t] || t).join(", ");
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-success text-white";
    case "inactive":
      return "bg-muted text-muted-foreground";
    case "error":
      return "bg-red-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasSubscription, loading: subscriptionLoading } = useSubscription();
  const {
    projects,
    deleteProject,
    updateProject,
    loading: projectsLoading,
  } = useProjects();
  const navigate = useNavigate();

  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth/login");
      return;
    }

    if (!authLoading && !subscriptionLoading && user && !hasSubscription) {
      navigate("/select-plan");
      return;
    }
  }, [user, authLoading, subscriptionLoading, hasSubscription, navigate]);

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProjectId(projectId);
    setError(null);

    try {
      const { error } = await deleteProject(projectId);

      if (error) {
        throw error;
      }

      toast.success("Project deleted successfully");
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message || "Failed to delete project");
      toast.error("Failed to delete project");
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleToggleGitHub = async (
    projectId: string,
    currentlyConnected: boolean
  ) => {
    setUpdatingProjectId(projectId);
    setError(null);

    try {
      if (currentlyConnected) {
        // Disconnecting - clear GitHub data
        const { error } = await updateProject(projectId, {
          github_synced: false,
          github_installation_id: null,
          repository_url: null,
        });

        if (error) {
          throw error;
        }

        toast.success("GitHub repository disconnected successfully");
      } else {
        // Connecting - redirect to GitHub App installation
        const config = getGitHubDevConfig();
        
        // Store project ID in sessionStorage for callback
        sessionStorage.setItem('github_project_id', projectId);
        
        // Redirect to GitHub App installation with state parameter
        const state = btoa(JSON.stringify({ project_id: projectId, return_url: config.callbackUrl }));
        const installUrl = `https://github.com/apps/${config.githubAppId}/installations/new?state=${encodeURIComponent(state)}`;
        window.location.href = installUrl;
      }
    } catch (err: any) {
      console.error("Error updating GitHub connection:", err);
      setError(err.message || "Failed to update GitHub connection");
      toast.error("Failed to update GitHub connection");
    } finally {
      setUpdatingProjectId(null);
    }
  };

  if (authLoading || subscriptionLoading || projectsLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Your <span className="gradient-text">Projects</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your projects and their privacy policy configurations
              </p>
            </div>
            <Button asChild>
              <RouterLink to="/dashboard/projects/new">
                <Plus className="mr-2 w-4 h-4" />
                Add New Project
              </RouterLink>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {hasActiveSubscription
                  ? "Create your first project to start generating privacy policies automatically. Connect your GitHub repository for real-time monitoring."
                  : "You need an active subscription to create and manage projects. Please upgrade your plan to continue."}
              </p>
              {hasActiveSubscription ? (
                <Button asChild>
                  <RouterLink to="/dashboard/projects/new">
                    <Plus className="mr-2 w-4 h-4" />
                    Create Your First Project
                  </RouterLink>
                </Button>
              ) : (
                <Button asChild>
                  <RouterLink to="/select-plan">
                    <Plus className="mr-2 w-4 h-4" />
                    Upgrade Plan
                  </RouterLink>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => {
              const config = project.config || {};
              const PurposeIcon = getPurposeIcon(config.purpose);
              const AIIcon = getAIIcon(config.aiUsage);
              const isDeleting = deletingProjectId === project.id;
              const isUpdating = updatingProjectId === project.id;
              const isGitHubConnected = project.github_synced && project.github_installation_id;

              return (
                <Card
                  key={project.id}
                  className="shadow-lg border-0 card-hover"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <PurposeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className={getStatusColor(project.status)}
                            >
                              {project.status}
                            </Badge>
                            {config.purpose && (
                              <span className="text-sm">
                                {getPurposeLabel(config.purpose)}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>

                      {/* GitHub Status */}
                      <div className="flex items-center space-x-2">
                        {isGitHubConnected ? (
                          <Badge
                            variant="secondary"
                            className="bg-success text-white"
                          >
                            <GitBranch className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <GitBranch className="w-3 h-3 mr-1" />
                            Not Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Repository URL */}
                    {isGitHubConnected && project.repository_url && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate flex-1"
                        >
                          {project.repository_url}
                        </a>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}

                    {/* Configuration Summary */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Configuration Summary
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Geography */}
                        {config.geographyScope && (
                          <div className="flex items-start space-x-3">
                            <MapPin className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">
                                User Geography
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {config.geographyScope === "worldwide"
                                  ? "Worldwide"
                                  : formatRegions(config.selectedRegions)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* AI Usage */}
                        {config.aiUsage && (
                          <div className="flex items-start space-x-3">
                            <AIIcon className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">AI Features</p>
                              <p className="text-xs text-muted-foreground">
                                {getAILabel(config.aiUsage)}
                                {config.aiTypes &&
                                  config.aiTypes.length > 0 && (
                                    <span className="block mt-1">
                                      Types: {formatAITypes(config.aiTypes)}
                                    </span>
                                  )}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Hosting */}
                        {config.hostingProvider && (
                          <div className="flex items-start space-x-3">
                            <Server className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Hosting</p>
                              <p className="text-xs text-muted-foreground">
                                {config.hostingProvider === "other"
                                  ? config.customHosting || "Custom Provider"
                                  : config.hostingProvider}
                                {config.hostingRegion && (
                                  <span> • {config.hostingRegion}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* English Preference */}
                        {config.englishPreference && (
                          <div className="flex items-start space-x-3">
                            <Globe className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Language</p>
                              <p className="text-xs text-muted-foreground">
                                {config.englishPreference === "us"
                                  ? "US English"
                                  : "UK English"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Metadata */}
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created:{" "}
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Last scan:{" "}
                          {project.last_scan_at
                            ? new Date(
                                project.last_scan_at
                              ).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleGitHub(
                              project.id,
                              isGitHubConnected
                            )
                          }
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : isGitHubConnected ? (
                            <Unlink className="w-4 h-4 mr-2" />
                          ) : (
                            <GitBranch className="w-4 h-4 mr-2" />
                          )}
                          {isGitHubConnected
                            ? "Disconnect GitHub"
                            : "Connect GitHub"}
                        </Button>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Remove
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Project</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove "{project.name}"?
                              This action cannot be undone. All associated
                              privacy policies and configurations will be
                              permanently deleted.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteProject(project.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Removing...
                                </>
                              ) : (
                                "Remove Project"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
