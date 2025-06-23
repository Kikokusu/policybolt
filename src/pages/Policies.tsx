import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Shield,
  GitBranch,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  RefreshCw,
  Eye,
  Download,
  ExternalLink,
  Zap,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useProjects } from '@/hooks/useProjects';
import { usePolicies } from '@/hooks/usePolicies';
import { downloadPolicyAsMarkdown, generateEmbedCode, copyToClipboard } from '@/utils/policyUtils';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success text-white';
    case 'pending_review':
      return 'bg-yellow-500 text-white';
    case 'inactive':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return CheckCircle;
    case 'pending_review':
      return Clock;
    case 'inactive':
      return AlertCircle;
    default:
      return AlertCircle;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending_review':
      return 'Pending Review';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

export function PoliciesPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasSubscription, loading: subscriptionLoading } = useSubscription();
  const { projects } = useProjects();
  const { policies, policiesByProject, approvePolicy, syncPolicy, deletePolicy, loading: policiesLoading } = usePolicies();
  const navigate = useNavigate();
  
  const [approvingPolicyId, setApprovingPolicyId] = useState<string | null>(null);
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);
  const [deletingPolicyId, setDeletingPolicyId] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [showEmbedDialog, setShowEmbedDialog] = useState<any>(null);
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleApprovePolicy = async (policyId: string) => {
    setApprovingPolicyId(policyId);
    setError(null);

    try {
      const { error } = await approvePolicy(policyId);
      
      if (error) {
        throw error;
      }

      toast.success('Policy approved and activated successfully');
    } catch (err: any) {
      console.error('Error approving policy:', err);
      setError(err.message || 'Failed to approve policy');
      toast.error('Failed to approve policy');
    } finally {
      setApprovingPolicyId(null);
    }
  };

  const handleSyncPolicy = async (projectId: string) => {
    setSyncingProjectId(projectId);
    setError(null);

    try {
      const { error } = await syncPolicy(projectId);
      
      if (error) {
        throw error;
      }

      toast.success('New policy generated successfully');
    } catch (err: any) {
      console.error('Error syncing policy:', err);
      setError(err.message || 'Failed to generate policy');
      toast.error('Failed to generate policy');
    } finally {
      setSyncingProjectId(null);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    setDeletingPolicyId(policyId);
    setError(null);

    try {
      const { error } = await deletePolicy(policyId);
      
      if (error) {
        throw error;
      }

      toast.success('Policy deleted successfully');
    } catch (err: any) {
      console.error('Error deleting policy:', err);
      setError(err.message || 'Failed to delete policy');
      toast.error('Failed to delete policy');
    } finally {
      setDeletingPolicyId(null);
    }
  };

  const handleDownloadPolicy = (policy: any) => {
    downloadPolicyAsMarkdown(policy);
    toast.success('Policy downloaded successfully');
  };

  const handleCopyEmbedCode = async (embedCode: string) => {
    const success = await copyToClipboard(embedCode);
    if (success) {
      setEmbedCodeCopied(true);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setEmbedCodeCopied(false), 2000);
    } else {
      toast.error('Failed to copy embed code');
    }
  };

  if (authLoading || subscriptionLoading || policiesLoading) {
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

  const projectsWithGitHub = projects.filter(p => p.github_synced);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Privacy <span className="gradient-text">Policies</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your auto-generated privacy policies and their approval workflow
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {projectsWithGitHub.length > 0 && (
                <Button variant="outline" asChild>
                  <RouterLink to="/dashboard/projects">
                    <GitBranch className="mr-2 w-4 h-4" />
                    Manage Projects
                  </RouterLink>
                </Button>
              )}
              <Button asChild>
                <RouterLink to="/dashboard/projects/new">
                  <Plus className="mr-2 w-4 h-4" />
                  Add Project
                </RouterLink>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Policies Content */}
        {policies.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">No policies generated yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {projects.length === 0 
                  ? "Create your first project to start generating privacy policies automatically."
                  : projectsWithGitHub.length === 0
                  ? "Connect your projects to GitHub to enable automatic policy generation."
                  : "Your policies will appear here once generated. Use the sync button to create your first policy."
                }
              </p>
              {projects.length === 0 ? (
                <Button asChild>
                  <RouterLink to="/dashboard/projects/new">
                    <Plus className="mr-2 w-4 h-4" />
                    Create Your First Project
                  </RouterLink>
                </Button>
              ) : projectsWithGitHub.length === 0 ? (
                <Button asChild>
                  <RouterLink to="/dashboard/projects">
                    <GitBranch className="mr-2 w-4 h-4" />
                    Connect Projects to GitHub
                  </RouterLink>
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select a project to generate its first policy:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectsWithGitHub.map((project) => (
                      <Button
                        key={project.id}
                        variant="outline"
                        onClick={() => handleSyncPolicy(project.id)}
                        disabled={syncingProjectId === project.id}
                      >
                        {syncingProjectId === project.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Generate for {project.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Projects with Policies */}
            {Object.entries(policiesByProject).map(([projectId, projectPolicies]) => {
              const project = projects.find(p => p.id === projectId);
              if (!project) return null;

              const activePolicies = projectPolicies.filter(p => p.status === 'active');
              const pendingPolicies = projectPolicies.filter(p => p.status === 'pending_review');
              const inactivePolicies = projectPolicies.filter(p => p.status === 'inactive');

              return (
                <Card key={projectId} className="shadow-lg border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-primary" />
                          <span>{project.name}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <span>{projectPolicies.length} total policies</span>
                          <span>•</span>
                          <span>{activePolicies.length} active</span>
                          <span>•</span>
                          <span>{pendingPolicies.length} pending review</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {project.github_synced ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncPolicy(project.id)}
                            disabled={syncingProjectId === project.id}
                          >
                            {syncingProjectId === project.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Sync Policy
                          </Button>
                        ) : (
                          <Badge variant="outline">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            GitHub Not Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {/* Active Policies */}
                      {activePolicies.length > 0 && (
                        <AccordionItem value={`active-${projectId}`}>
                          <AccordionTrigger>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-success text-white">
                                Active ({activePolicies.length})
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {activePolicies.map((policy) => (
                                <PolicyCard
                                  key={policy.id}
                                  policy={policy}
                                  project={project}
                                  onApprove={handleApprovePolicy}
                                  onDelete={handleDeletePolicy}
                                  onView={setSelectedPolicy}
                                  onDownload={handleDownloadPolicy}
                                  onShowEmbed={setShowEmbedDialog}
                                  isApproving={approvingPolicyId === policy.id}
                                  isDeleting={deletingPolicyId === policy.id}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Pending Review Policies */}
                      {pendingPolicies.length > 0 && (
                        <AccordionItem value={`pending-${projectId}`}>
                          <AccordionTrigger>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-yellow-500 text-white">
                                Pending Review ({pendingPolicies.length})
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {pendingPolicies.map((policy) => (
                                <PolicyCard
                                  key={policy.id}
                                  policy={policy}
                                  project={project}
                                  onApprove={handleApprovePolicy}
                                  onDelete={handleDeletePolicy}
                                  onView={setSelectedPolicy}
                                  onDownload={handleDownloadPolicy}
                                  onShowEmbed={setShowEmbedDialog}
                                  isApproving={approvingPolicyId === policy.id}
                                  isDeleting={deletingPolicyId === policy.id}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Inactive Policies */}
                      {inactivePolicies.length > 0 && (
                        <AccordionItem value={`inactive-${projectId}`}>
                          <AccordionTrigger>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">
                                Inactive ({inactivePolicies.length})
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {inactivePolicies.map((policy) => (
                                <PolicyCard
                                  key={policy.id}
                                  policy={policy}
                                  project={project}
                                  onApprove={handleApprovePolicy}
                                  onDelete={handleDeletePolicy}
                                  onView={setSelectedPolicy}
                                  onDownload={handleDownloadPolicy}
                                  onShowEmbed={setShowEmbedDialog}
                                  isApproving={approvingPolicyId === policy.id}
                                  isDeleting={deletingPolicyId === policy.id}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Policy Viewer Dialog */}
        <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{selectedPolicy?.title}</span>
              </DialogTitle>
              <DialogDescription>
                Version {selectedPolicy?.version} • Created {selectedPolicy?.created_at ? new Date(selectedPolicy.created_at).toLocaleDateString() : 'Unknown'}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                  {selectedPolicy?.content}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPolicy(null)}>
                Close
              </Button>
              <Button variant="outline" onClick={() => handleDownloadPolicy(selectedPolicy)}>
                <Download className="w-4 h-4 mr-2" />
                Download Markdown
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Embed Code Dialog */}
        <Dialog open={!!showEmbedDialog} onOpenChange={() => setShowEmbedDialog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Embed Privacy Policy</span>
              </DialogTitle>
              <DialogDescription>
                Copy this code to embed the privacy policy on your website. The widget will automatically update when you approve new policy versions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="embed-code">Embed Code</Label>
                <div className="relative">
                  <Textarea
                    id="embed-code"
                    value={showEmbedDialog ? generateEmbedCode(showEmbedDialog.project_id, showEmbedDialog.id) : ''}
                    readOnly
                    rows={12}
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyEmbedCode(generateEmbedCode(showEmbedDialog.project_id, showEmbedDialog.id))}
                  >
                    {embedCodeCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• The widget automatically displays your active privacy policy</li>
                  <li>• Updates in real-time when you approve new policy versions</li>
                  <li>• Responsive design that adapts to your website's styling</li>
                  <li>• No manual updates required - set it and forget it</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmbedDialog(null)}>
                Close
              </Button>
              <Button onClick={() => handleCopyEmbedCode(generateEmbedCode(showEmbedDialog.project_id, showEmbedDialog.id))}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Embed Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Policy Card Component
function PolicyCard({ 
  policy, 
  project,
  onApprove, 
  onDelete, 
  onView, 
  onDownload,
  onShowEmbed,
  isApproving, 
  isDeleting 
}: {
  policy: any;
  project: any;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (policy: any) => void;
  onDownload: (policy: any) => void;
  onShowEmbed: (policy: any) => void;
  isApproving: boolean;
  isDeleting: boolean;
}) {
  const StatusIcon = getStatusIcon(policy.status);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{policy.title}</h4>
            <Badge
              variant="secondary"
              className={getStatusColor(policy.status)}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {getStatusLabel(policy.status)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center space-x-4">
              <span>Version {policy.version}</span>
              <span>•</span>
              <span>Created {new Date(policy.created_at).toLocaleDateString()}</span>
              {policy.approved_at && (
                <>
                  <span>•</span>
                  <span>Approved {new Date(policy.approved_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(policy)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(policy)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          {policy.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowEmbed(policy)}
            >
              <Code className="w-4 h-4 mr-2" />
              Embed
            </Button>
          )}
          
          {policy.status === 'pending_review' && (
            <Button
              size="sm"
              onClick={() => onApprove(policy.id)}
              disabled={isApproving}
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          )}
          
          {policy.status !== 'active' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Policy</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this policy? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(policy.id)}
                    disabled={isDeleting}
                  >
                    Delete Policy
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}