import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/database";

interface GitHubAppTokenResponse {
  token: string;
  expires_at: string;
  permissions: {
    contents: string;
    metadata: string;
  };
  repository_selection: string;
}

interface WebhookPayload {
  credentials: {
    token: string;
    expires_at: string;
    permissions: {
      contents: string;
      metadata: string;
    };
    repository_selection: string;
  };
  installation_id: number;
  project_id: string;
  user_id: string;
  name: string;
  github_repository_name: string;
  config: any;
}

/**
 * Gets GitHub app token using the installation ID
 */
export async function getGitHubAppToken(installationId: number): Promise<GitHubAppTokenResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No authentication session found');
  }

  const { data, error } = await supabase.functions.invoke('github-app-token', {
    body: {
      installation_id: installationId
    },
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    console.error('GitHub app token error:', error);
    throw new Error(`Failed to get GitHub app token: ${error.message}`);
  }

  if (!data || !data.token) {
    throw new Error('Invalid response from GitHub app token service');
  }

  return data;
}

/**
 * Triggers the n8n webhook to fetch commit and branch information
 */
async function triggerFetchCommitAndBranch(project: Project, tokenResponse: GitHubAppTokenResponse, session: any): Promise<void> {
  try {
    const fetchCommitWebhookUrl = import.meta.env.VITE_FETCH_COMMIT_AND_BRANCH_WEBHOOK_URL;
    if (!fetchCommitWebhookUrl) {
      console.warn('VITE_FETCH_COMMIT_AND_BRANCH_WEBHOOK_URL environment variable is not set, skipping commit/branch fetch');
      return;
    }

    const fetchPayload = {
      credentials: {
        token: tokenResponse.token,
        expires_at: tokenResponse.expires_at,
        permissions: tokenResponse.permissions,
        repository_selection: tokenResponse.repository_selection,
      },
      installation_id: project.github_installation_id,
      project_id: project.id,
      user_id: session.user.id,
      github_repository_name: project.github_repository_name || '',
    };

    const fetchResponse = await fetch(fetchCommitWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fetchPayload),
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.warn(`Fetch commit/branch webhook failed (${fetchResponse.status}): ${errorText}`);
      return; // Fail silently as requested
    }

    console.log('✅ Fetch commit and branch webhook triggered successfully');
  } catch (error) {
    console.warn('Failed to trigger fetch commit/branch webhook:', error);
    // Fail silently as requested
  }
}

/**
 * Triggers the n8n webhook to generate privacy policy
 */
export async function triggerPolicyGeneration(project: Project): Promise<void> {
  if (!project.github_installation_id) {
    throw new Error('Project does not have a GitHub installation ID');
  }

  if (!project.config) {
    throw new Error('Project does not have configuration data');
  }

  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('No authenticated user found');
  }

  // Get GitHub app token
  const tokenResponse = await getGitHubAppToken(project.github_installation_id);

  // Prepare webhook payload
  const payload: WebhookPayload = {
    credentials: {
      token: tokenResponse.token,
      expires_at: tokenResponse.expires_at,
      permissions: tokenResponse.permissions,
      repository_selection: tokenResponse.repository_selection,
    },
    installation_id: project.github_installation_id,
    project_id: project.id,
    user_id: session.user.id,
    name: project.name,
    github_repository_name: project.github_repository_name || '',
    config: project.config,
  };

  // Get the webhook URL from environment
  const webhookUrl = import.meta.env.VITE_GENERATE_POLICY_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('VITE_GENERATE_POLICY_WEBHOOK_URL environment variable is not set');
  }

  // Make the webhook request
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webhook request failed (${response.status}): ${errorText}`);
  }

  console.log('✅ Policy generation webhook triggered successfully');

  // After successful policy generation, trigger the fetch commit/branch webhook
  await triggerFetchCommitAndBranch(project, tokenResponse, session);
}