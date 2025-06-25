import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getGitHubDevConfig, logGitHubDevWarnings } from "@/lib/github-dev-config";

interface CallbackState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>({
    loading: true,
    error: null,
    success: false,
  });

  useEffect(() => {
    // Log development configuration warnings
    logGitHubDevWarnings();

    const handleCallback = async () => {
      try {
        // Extract installation_id from URL parameters
        const installationId = searchParams.get('installation_id');
        const setupAction = searchParams.get('setup_action');
        const state = searchParams.get('state');
        
        if (!installationId) {
          throw new Error('No installation ID found in callback URL');
        }

        if (setupAction === 'cancelled') {
          throw new Error('GitHub App installation was cancelled');
        }

        // Get project_id from state parameter or sessionStorage
        let projectId: string | null = null;
        
        if (state) {
          try {
            const stateData = JSON.parse(atob(state));
            projectId = stateData.project_id;
          } catch (e) {
            console.warn('Failed to parse state parameter, falling back to sessionStorage');
          }
        }
        
        if (!projectId) {
          projectId = sessionStorage.getItem('github_project_id');
        }
        
        if (!projectId) {
          throw new Error('No project ID found in state or session');
        }

        // Call the Supabase edge function
        const config = getGitHubDevConfig();

        // Get the auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No authentication session found');
        }

        const { data, error } = await supabase.functions.invoke('github-callback-handler', {
          body: {
            installation_id: installationId,
            project_id: projectId,
          },
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        // Clear sessionStorage
        sessionStorage.removeItem('github_project_id');

        setState({
          loading: false,
          error: null,
          success: true,
        });

        // Show success toast and redirect after a brief delay
        toast.success('GitHub repository connected successfully!');
        
        setTimeout(() => {
          navigate('/dashboard/projects');
        }, 2000);

      } catch (err: any) {
        console.error('GitHub callback error:', err);
        setState({
          loading: false,
          error: err.message || 'Failed to connect GitHub repository',
          success: false,
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

          {state.success && (
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
                  Redirecting you back to your projects...
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