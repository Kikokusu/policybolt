import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { getGitHubDevConfig, logGitHubDevWarnings } from "@/lib/github-dev-config";
import { toast } from "sonner";

export function GitHubDebugInfo() {
  const [config, setConfig] = useState<ReturnType<typeof getGitHubDevConfig> | null>(null);

  useEffect(() => {
    const githubConfig = getGitHubDevConfig();
    setConfig(githubConfig);
    logGitHubDevWarnings();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!config) return null;

  const installationUrl = `https://github.com/apps/${config.githubAppId}/installations/new?callback_url=${encodeURIComponent(config.callbackUrl)}`;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          GitHub App Configuration Debug
        </CardTitle>
        <CardDescription>
          Debug information for GitHub App integration setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Info */}
        <div>
          <h3 className="font-semibold mb-3">Environment Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Environment</label>
              <Badge variant={config.isLocalDevelopment ? "destructive" : "default"}>
                {config.isLocalDevelopment ? "Development" : "Production"}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub App Slug</label>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm">{config.githubAppId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(config.githubAppId)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* URLs */}
        <div>
          <h3 className="font-semibold mb-3">URLs</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Callback URL (configure this in GitHub App)</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{config.callbackUrl}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(config.callbackUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Installation URL</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1 break-all">{installationUrl}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(installationUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(installationUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Supabase URL</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{config.supabaseUrl}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(config.supabaseUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {config.warnings.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Configuration Warnings</h3>
            {config.warnings.map((warning, index) => (
              <Alert key={index} variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div>
          <h3 className="font-semibold mb-3">Setup Instructions</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Configure GitHub App Callback URL</p>
                <p className="text-sm text-muted-foreground">
                  Go to{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => window.open('https://github.com/settings/apps/policy-bolt', '_blank')}
                  >
                    GitHub App Settings <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                  {" "}and set the Callback URL to: <code className="bg-muted px-1 rounded">{config.callbackUrl}</code>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Test Installation</p>
                <p className="text-sm text-muted-foreground">
                  Click the installation URL above to test the GitHub App installation flow
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Check Browser Network Tab</p>
                <p className="text-sm text-muted-foreground">
                  Open browser dev tools → Network tab to see if the github-callback-handler function is being called
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div>
          <h3 className="font-semibold mb-3">Environment Variables Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'VITE_GITHUB_APP_SLUG', value: import.meta.env.VITE_GITHUB_APP_SLUG },
              { key: 'VITE_GITHUB_APP_ID', value: import.meta.env.VITE_GITHUB_APP_ID },
              { key: 'VITE_SUPABASE_URL', value: import.meta.env.VITE_SUPABASE_URL },
              { key: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set' },
            ].map(({ key, value }) => (
              <div key={key} className="flex items-center gap-2">
                {value ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-mono">{key}</span>
                <Badge variant={value ? "default" : "destructive"}>
                  {value || 'Not Set'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}