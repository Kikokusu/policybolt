import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const githubAppId = Deno.env.get('GITHUB_APP_ID');
const githubPrivateKey = Deno.env.get('GITHUB_PRIVATE_KEY');
const githubClientId = Deno.env.get('GITHUB_CLIENT_ID');
const githubClientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Max-Age': '86400',
  };

  if (status === 204 || body === null) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

// Get installation repositories
async function getInstallationRepositories(installationId: string) {
  try {
    // In a real implementation, you'd generate a JWT and get an installation access token
    // For now, we'll use a simplified approach with the GitHub REST API
    
    const installationTokenResponse = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${await generateJWT()}`,
        },
      }
    );

    if (!installationTokenResponse.ok) {
      throw new Error('Failed to generate installation access token');
    }

    const { token } = await installationTokenResponse.json();

    // Get repositories for this installation
    const reposResponse = await fetch(
      `https://api.github.com/installation/repositories`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${token}`,
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const { repositories } = await reposResponse.json();
    return repositories;
  } catch (error) {
    console.error('Error fetching installation repositories:', error);
    throw error;
  }
}

// Generate JWT for GitHub App authentication
async function generateJWT() {
  if (!githubAppId || !githubPrivateKey) {
    throw new Error('GitHub App credentials not configured');
  }

  // This is a simplified JWT generation
  // In production, you'd use a proper JWT library
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 600, // 10 minutes
    iss: githubAppId,
  };

  // For this example, we'll return a placeholder
  // In production, implement proper JWT signing with the private key
  return 'jwt-token-placeholder';
}

Deno.serve(async (req) => {
  // Handle CORS preflight first, before any try/catch
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    console.log('GitHub callback handler called:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
    });

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await req.json();
    console.log('Request body:', body);
    
    const { installation_id, code, project_id, setup_action } = body;

    if ((!installation_id && !code) || !project_id) {
      console.error('Missing required parameters:', { installation_id, code, project_id });
      return corsResponse({ 
        error: 'Missing installation_id/code or project_id' 
      }, 400);
    }

    // If we have a code but no installation_id, we need to exchange the code
    let actualInstallationId = installation_id;
    if (code && !installation_id) {
      try {
        // Exchange code for access token and get installation details
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: githubClientId,
            client_secret: githubClientSecret,
            code: code,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        
        // Get user installations to find the installation_id
        const installationsResponse = await fetch('https://api.github.com/user/installations', {
          headers: {
            'Authorization': `token ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (!installationsResponse.ok) {
          throw new Error('Failed to get user installations');
        }

        const installationsData = await installationsResponse.json();
        
        // For simplicity, use the most recent installation
        // In production, you might want to match by repository or other criteria
        if (installationsData.installations && installationsData.installations.length > 0) {
          actualInstallationId = installationsData.installations[0].id.toString();
        } else {
          throw new Error('No installations found for user');
        }
      } catch (error) {
        console.error('Error processing OAuth code:', error);
        // Continue with the installation_id if we have it from the URL
        if (!installation_id) {
          throw error;
        }
      }
    }

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    // Verify the project belongs to the user
    const { data: project, error: getProjectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (getProjectError || !project) {
      return corsResponse({ error: 'Project not found' }, 404);
    }

    try {
      // First, get installation details from GitHub API (simplified for now)
      let installationData = {
        account_id: 0,
        account_login: 'unknown',
        account_type: 'User'
      };

      try {
        // In a real implementation, you'd fetch this from GitHub API
        // For now, we'll use placeholder data
        console.log('Would fetch installation details from GitHub API for:', actualInstallationId);
      } catch (apiError) {
        console.warn('Could not fetch installation details from GitHub API:', apiError);
      }

      // Insert or update the github_installations table
      const { data: installationRecord, error: installationError } = await supabase
        .from('github_installations')
        .upsert({
          installation_id: parseInt(actualInstallationId),
          account_id: installationData.account_id,
          account_login: installationData.account_login,
          account_type: installationData.account_type,
          status: 'active',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'installation_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (installationError) {
        console.error('Error upserting installation:', installationError);
        throw installationError;
      }

      console.log('Upserted installation record:', installationRecord);

      // Update the project with the foreign key reference
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          github_synced: true,
          github_installation_id: installationRecord.id,
          repository_url: null, // Will be set later by n8n after scanning
          github_repository_name: null, // Will be set later by n8n
          updated_at: new Date().toISOString(),
        })
        .eq('id', project_id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating project:', updateError);
        throw updateError;
      }

      console.log('Successfully updated project with installation reference');

      return corsResponse({
        success: true,
        message: 'GitHub integration configured successfully',
        installation: {
          id: installationRecord.id,
          installation_id: actualInstallationId,
          account_login: installationData.account_login,
        },
      });

    } catch (error: any) {
      console.error('Error setting up GitHub integration:', error);
      throw error; // Let the outer catch handle this
    }

  } catch (error: any) {
    console.error('GitHub callback handler error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
    });
    return corsResponse({ 
      error: error.message || 'Internal server error' 
    }, 500);
  }
});