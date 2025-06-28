import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getGitHubDevConfig, logGitHubDevWarnings } from "@/lib/github-dev-config";
import { triggerPolicyGeneration } from "@/lib/webhook-utils";

interface CallbackState {
  loading: boolean;
  error: string | null;
  success: boolean;
  generatingPolicy: boolean;
  policyGenerated: boolean;
  policyError: string | null;
}

export function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [state, setState] = useState<CallbackState>({
    loading: true,
    error: null,
    success: false,
    generatingPolicy: false,
    policyGenerated: false,
    policyError: null,
  });

  useEffect(() => {
    // Log development configuration warnings
    logGitHubDevWarnings();

    const handleCallback = async () => {
      try {
        // Debug: Log the current URL and all parameters
        console.log('Current URL:', window.location.href);
        console.log('Search params:', window.location.search);
        
        // Extract parameters from URL
        const installationId = searchParams.get('installation_id');
        const code = searchParams.get('code');
        const setupAction = searchParams.get('setup_action');
        const state = searchParams.get('state');
        
        console.log('Extracted parameters:', {
          installationId,
          code,
          setupAction,
          state,
        });
        
        // GitHub sends different parameters based on OAuth settings
        if (!installationId && !code) {
          console.error('Missing required parameters. Available search params:', 
            Array.from(searchParams.entries()));
          throw new Error('No installation ID or authorization code found in callback URL');
        }

        if (setupAction === 'cancelled') {
          throw new Error('GitHub App installation was cancelled');
        }

        // Get project_id and repository from state parameter or sessionStorage
        let projectId: string | null = null;
        let repositoryName: string | null = null;
        
        if (state) {
          try {
            const stateData = JSON.parse(atob(state));
            projectId = stateData.project_id;
            repositoryName = stateData.repository;
          } catch (e) {
            console.warn('Failed to parse state parameter, falling back to sessionStorage');
          }
        }
        
        if (!projectId) {
          projectId = sessionStorage.getItem('github_project_id');
        }
        
        if (!repositoryName) {
          repositoryName = sessionStorage.getItem('github_repository_name');
        }
        
        if (!projectId) {
          throw new Error('No project ID found in state or session');
        }

        console.log('Repository to scan:', repositoryName);

        // Get the auth session first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No authentication session found');
        }

        // Try the edge function first
        console.log('Calling edge function with:', {
          projectId,
          installationId,
          code,
          setupAction,
        });

        const { data, error } = await supabase.functions.invoke('github-callback-handler', {
          body: {
            installation_id: installationId,
            code: code,
            project_id: projectId,
            setup_action: setupAction,
          },
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.warn('Edge function failed, using direct database update:', error);
          console.log('Edge function error details:', {
            name: error.name,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });

          // Fallback: Update the project directly in the database
          console.log('Fallback update parameters:', {
            projectId,
            installationId,
            userId: session.user.id,
          });
          
          const { error: updateError, data: updateData } = await supabase
            .from('projects')
            .update({
              github_synced: true,
              // Store installation_id in the proper column (keep original repository_url)
              github_installation_id: parseInt(installationId),
              // Store the repository name for easy access
              github_repository_name: repositoryName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId)
            .select();

          console.log('Fallback update result:', { updateError, updateData });

          if (updateError) {
            throw new Error(`Failed to update project: ${updateError.message}`);
          }

          console.log('✅ Successfully connected GitHub App via fallback method');
          console.log('Installation ID stored for n8n processing:', installationId);
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          console.log('✅ Successfully connected GitHub App via edge function');
          console.log('Edge function response:', data);
        }

        // Clear sessionStorage
        sessionStorage.removeItem('github_project_id');
        sessionStorage.removeItem('github_repository_name');

        // Store project ID for policy generation
        setProjectId(projectId);

        setState({
          loading: false,
          error: null,
          success: true,
          generatingPolicy: false,
          policyGenerated: false,
          policyError: null,
        });

        // Show success toast
        toast.success('GitHub repository connected successfully!');

      } catch (err: any) {
        console.error('GitHub callback error:', err);
        setState({
          loading: false,
          error: err.message || 'Failed to connect GitHub repository',
          success: false,
          generatingPolicy: false,
          policyGenerated: false,
          policyError: null,
        });

        // Clear sessionStorage on error too
        sessionStorage.removeItem('github_project_id');
        
        toast.error('Failed to connect GitHub repository');
        
        // Redirect to projects page after error
        setTimeout(() => {
          navigate('/dashboard/projects');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  // Effect to trigger policy generation after successful GitHub connection
  useEffect(() => {
    if (state.success && projectId && !state.generatingPolicy && !state.policyGenerated) {
      const generatePolicy = async () => {
        setState(prev => ({ ...prev, generatingPolicy: true }));

        try {
          // Get the updated project data to trigger webhook
          const { data: updatedProject, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

          if (projectError) {
            throw new Error('Failed to fetch project data');
          }

          if (!updatedProject) {
            throw new Error('Project not found');
          }

          console.log('🚀 Triggering policy generation webhook...');
          await triggerPolicyGeneration(updatedProject);
          console.log('✅ Policy generation triggered successfully');

          setState(prev => ({
            ...prev,
            generatingPolicy: false,
            policyGenerated: true,
            policyError: null,
          }));

          toast.success('Privacy policy generation started successfully!');

          // Navigate to projects page after success
          setTimeout(() => {
            navigate('/dashboard/projects');
          }, 2000);

        } catch (error: any) {
          console.error('Policy generation failed:', error);
          setState(prev => ({
            ...prev,
            generatingPolicy: false,
            policyError: error.message || 'Failed to start policy generation',
          }));

          toast.error('Policy generation failed: ' + (error.message || 'Unknown error'));

          // Still navigate after error, but with longer delay
          setTimeout(() => {
            navigate('/dashboard/projects');
          }, 3000);
        }
      };

      generatePolicy();
    }
  }, [state.success, projectId, state.generatingPolicy, state.policyGenerated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center space-y-6">
          {state.loading && (
            <>
              <div className="w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Connecting GitHub</h2>
                <p className="text-muted-foreground">
                  Please wait while we set up your GitHub integration...
                </p>
              </div>
            </>
          )}

          {state.success && !state.generatingPolicy && !state.policyGenerated && !state.policyError && (
            <>
              <div className="w-16 h-16 mx-auto">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-green-600">
                  Connection Successful!
                </h2>
                <p className="text-muted-foreground">
                  Your GitHub repository has been connected successfully.
                </p>
              </div>
            </>
          )}

          {state.generatingPolicy && (
            <>
              <div className="w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Generating Privacy Policy
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we analyze your repository and generate your first privacy policy...
                </p>
              </div>
            </>
          )}

          {state.policyGenerated && (
            <>
              <div className="w-16 h-16 mx-auto">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-green-600">
                  All Set!
                </h2>
                <p className="text-muted-foreground">
                  GitHub connected and privacy policy generation started successfully! 
                  Redirecting you back to your projects...
                </p>
              </div>
            </>
          )}

          {state.policyError && (
            <>
              <div className="w-16 h-16 mx-auto">
                <AlertCircle className="w-16 h-16 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-yellow-600">
                  GitHub Connected
                </h2>
                <p className="text-muted-foreground mb-4">
                  Your GitHub repository was connected successfully, but we encountered an issue starting the policy generation.
                </p>
                <Alert variant="destructive" className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.policyError}</AlertDescription>
                </Alert>
                <p className="text-muted-foreground mt-4">
                  You can try generating the policy manually from your projects page. Redirecting you there now...
                </p>
              </div>
            </>
          )}

          {state.error && (
            <>
              <div className="w-16 h-16 mx-auto">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-red-600">
                  Connection Failed
                </h2>
                <Alert variant="destructive" className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
                <p className="text-muted-foreground mt-4">
                  Redirecting you back to your projects...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}