import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Github, GitBranch, Zap, Shield } from "lucide-react";
import { ProjectFormData } from "@/pages/AddProject";

interface GitHubConnectionStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

export function GitHubConnectionStep({
  formData,
  updateFormData,
}: GitHubConnectionStepProps) {
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateGitHubUrl = (url: string) => {
    if (!url) return false; // URL is now required
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  const handleUrlChange = (url: string) => {
    updateFormData({ repositoryUrl: url });
    setIsValidUrl(validateGitHubUrl(url));
  };

  return (
    <div className="space-y-8">
      {/* Repository URL Input - Now Always Visible */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="repositoryUrl" className="text-base font-semibold">
            GitHub Repository URL *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the full URL of your GitHub repository that will be scanned
            for policy generation
          </p>
        </div>

        <div className="space-y-2">
          <Input
            id="repositoryUrl"
            type="url"
            placeholder="https://github.com/username/repository"
            value={formData.repositoryUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={!isValidUrl ? "border-destructive" : ""}
            required
          />
          {!isValidUrl && formData.repositoryUrl && (
            <p className="text-sm text-destructive">
              Please enter a valid GitHub repository URL (e.g.,
              https://github.com/username/repository)
            </p>
          )}
          {!formData.repositoryUrl && (
            <p className="text-sm text-muted-foreground">
              This field is required to identify which repository to scan for
              policy generation
            </p>
          )}
        </div>
      </div>

      {/* GitHub Connection Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Github className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Connect to GitHub After Project Creation
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
              After creating your project, you can connect to GitHub for
              automatic monitoring. We'll generate an initial privacy policy
              based on your configuration, then you can authorize our GitHub App
              to scan your repository for updates.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How Repository Scanning Works</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-medium text-sm">1. Repository Scan</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                We analyze your repository to identify APIs, third-party
                services, and data collection patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-medium text-sm">2. Policy Generation</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                AI generates a comprehensive privacy policy based on your code
                and configuration.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-medium text-sm">3. Review & Publish</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Review the generated policy and publish it to your website when
                ready.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Privacy & Security
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
              We only read your repository to analyze privacy-relevant code
              patterns. We never store your source code or access sensitive
              information. You can revoke access at any time from your GitHub
              settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
