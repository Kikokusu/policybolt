interface GitHubDevConfig {
  isLocalDevelopment: boolean;
  callbackUrl: string;
  supabaseUrl: string;
  githubAppId: string; // This is actually the app slug for the installation URL
  warnings: string[];
}

export function getGitHubDevConfig(): GitHubDevConfig {
  const isDevelopment = import.meta.env.DEV;
  const githubAppId = import.meta.env.VITE_GITHUB_APP_SLUG || 'policy-bolt';
  const warnings: string[] = [];

  // Determine callback URL
  const callbackUrl = isDevelopment 
    ? 'http://localhost:5173/github/callback'
    : `${window.location.origin}/github/callback`;

  // Determine Supabase URL for edge functions
  const supabaseUrl = isDevelopment 
    ? 'http://localhost:54321'
    : import.meta.env.VITE_SUPABASE_URL;

  // Development-specific warnings
  if (isDevelopment) {
    warnings.push(
      'Running in development mode. Make sure your GitHub App is configured with the callback URL: http://localhost:5173/github/callback'
    );

    if (!import.meta.env.VITE_GITHUB_APP_SLUG) {
      warnings.push(
        'VITE_GITHUB_APP_SLUG not found in environment variables. Using default value.'
      );
    }

    if (!import.meta.env.VITE_SUPABASE_URL) {
      warnings.push(
        'VITE_SUPABASE_URL not found in environment variables. Edge functions may not work correctly.'
      );
    }
  }

  return {
    isLocalDevelopment: isDevelopment,
    callbackUrl,
    supabaseUrl,
    githubAppId,
    warnings,
  };
}

export function logGitHubDevWarnings(): void {
  const config = getGitHubDevConfig();
  
  if (config.warnings.length > 0) {
    console.group('GitHub Development Configuration Warnings:');
    config.warnings.forEach(warning => {
      console.warn(`⚠️ ${warning}`);
    });
    console.groupEnd();
  }

  if (config.isLocalDevelopment) {
    console.log('GitHub Development Configuration:', {
      callbackUrl: config.callbackUrl,
      supabaseUrl: config.supabaseUrl,
      githubAppId: config.githubAppId,
    });
  }
}