import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Github, 
  GitBranch, 
  Zap, 
  Shield,
  Info,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { ProjectFormData } from '@/pages/AddProject';

interface GitHubConnectionStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const connectionOptions = [
  {
    id: 'connect',
    title: 'Connect Repository',
    description: 'Link your GitHub repository for automatic monitoring',
    icon: Github,
    benefits: [
      'Automatic code change detection',
      'Real-time policy updates',
      'API integration monitoring',
      'Compliance tracking',
    ],
  },
  {
    id: 'skip',
    title: 'Skip for Now',
    description: 'Set up repository connection later',
    icon: Clock,
    benefits: [
      'Manual policy management',
      'Connect repository anytime',
      'Basic policy generation',
      'No automatic updates',
    ],
  },
];

export function GitHubConnectionStep({ formData, updateFormData }: GitHubConnectionStepProps) {
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateGitHubUrl = (url: string) => {
    if (!url) return true; // Empty is valid when not connecting
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  const handleUrlChange = (url: string) => {
    updateFormData({ repositoryUrl: url });
    setIsValidUrl(validateGitHubUrl(url));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Label className="text-base font-semibold">
          GitHub Repository Connection
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your GitHub repository to enable automatic privacy policy updates when your code changes.
        </p>
      </div>

      {/* Connection Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connectionOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = (option.id === 'connect') === formData.connectGitHub;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => updateFormData({ 
                connectGitHub: option.id === 'connect',
                repositoryUrl: option.id === 'skip' ? '' : formData.repositoryUrl,
              })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {option.id === 'connect' ? 'Benefits:' : 'Features:'}
                  </p>
                  <div className="space-y-2">
                    {option.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          option.id === 'connect' ? 'bg-green-500' : 'bg-muted-foreground'
                        }`}></div>
                        <span className="text-xs text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Repository URL Input */}
      {formData.connectGitHub && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="repositoryUrl" className="text-base font-semibold">
              GitHub Repository URL *
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the full URL of your GitHub repository
            </p>
          </div>
          
          <div className="space-y-2">
            <Input
              id="repositoryUrl"
              type="url"
              placeholder="https://github.com/username/repository"
              value={formData.repositoryUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={!isValidUrl ? 'border-destructive' : ''}
            />
            {!isValidUrl && (
              <p className="text-sm text-destructive">
                Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)
              </p>
            )}
          </div>

          {/* Repository Access Note */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Repository Access
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                  We only read your repository to detect privacy-relevant changes. We never store your source code 
                  or access sensitive information. You can revoke access at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      {formData.connectGitHub && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How Automatic Monitoring Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-sm">1. Monitor Changes</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  We watch for commits that add new APIs, third-party services, or data collection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-sm">2. Generate Updates</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI analyzes changes and generates privacy policy updates automatically.
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
                  You review and approve changes before they're published to your site.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Skip Option Benefits */}
      {!formData.connectGitHub && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                No Problem!
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                You can always connect your repository later from your dashboard. We'll still generate 
                a comprehensive privacy policy based on the information you've provided.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}