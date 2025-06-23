import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Cloud, Server, Globe, Info } from 'lucide-react';
import { ProjectFormData } from '@/pages/AddProject';

interface HostingProviderStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const hostingProviders = [
  {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    description: 'Global cloud computing platform',
    icon: '☁️',
    regions: ['US East', 'US West', 'EU (Ireland)', 'EU (Frankfurt)', 'Asia Pacific', 'Other'],
    compliance: ['SOC 2', 'ISO 27001', 'GDPR'],
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud Platform',
    description: 'Google\'s cloud infrastructure',
    icon: '🌐',
    regions: ['US Central', 'US East', 'Europe West', 'Asia Southeast', 'Other'],
    compliance: ['SOC 2', 'ISO 27001', 'GDPR'],
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    description: 'Microsoft\'s cloud platform',
    icon: '☁️',
    regions: ['East US', 'West Europe', 'Southeast Asia', 'Australia East', 'Other'],
    compliance: ['SOC 2', 'ISO 27001', 'GDPR'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Frontend cloud platform',
    icon: '▲',
    regions: ['Global Edge Network', 'US East', 'Europe', 'Asia', 'Other'],
    compliance: ['SOC 2', 'GDPR'],
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Web development platform',
    icon: '🌐',
    regions: ['Global CDN', 'US', 'Europe', 'Asia Pacific', 'Other'],
    compliance: ['SOC 2', 'GDPR'],
  },
  {
    id: 'other',
    name: 'Other Provider',
    description: 'Custom or different hosting provider',
    icon: '🏢',
    regions: ['Custom'],
    compliance: ['Varies'],
  },
];

export function HostingProviderStep({ formData, updateFormData }: HostingProviderStepProps) {
  const selectedProvider = hostingProviders.find(p => p.id === formData.hostingProvider);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Label className="text-base font-semibold">
          Hosting Provider *
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Where is your project hosted? This affects data location and compliance requirements in your privacy policy.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hostingProviders.map((provider) => {
          const isSelected = formData.hostingProvider === provider.id;
          
          return (
            <Card
              key={provider.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => updateFormData({ 
                hostingProvider: provider.id,
                hostingRegion: '',
                customHosting: provider.id === 'other' ? formData.customHosting : '',
              })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{provider.icon}</div>
                    <div>
                      <h3 className="font-semibold text-sm">{provider.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {provider.compliance.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Hosting Input */}
      {formData.hostingProvider === 'other' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="customHosting" className="text-base font-semibold">
              Custom Hosting Provider *
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Please specify your hosting provider
            </p>
          </div>
          <Input
            id="customHosting"
            type="text"
            placeholder="e.g., DigitalOcean, Linode, Self-hosted"
            value={formData.customHosting}
            onChange={(e) => updateFormData({ customHosting: e.target.value })}
          />
        </div>
      )}

      {/* Region Selection */}
      {selectedProvider && formData.hostingProvider !== 'other' && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">
              Hosting Region *
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Which region or data center hosts your application?
            </p>
          </div>
          
          <Select
            value={formData.hostingRegion}
            onValueChange={(value) => updateFormData({ hostingRegion: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hosting region" />
            </SelectTrigger>
            <SelectContent>
              {selectedProvider.regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Data Location Compliance Note */}
      {formData.hostingProvider && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Data Location Compliance
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                {formData.hostingProvider === 'other'
                  ? 'We\'ll include general data location and security clauses. You may need to provide additional compliance details for your custom hosting setup.'
                  : `Your privacy policy will include specific data location information and compliance certifications for ${selectedProvider?.name}. This helps users understand where their data is stored and processed.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Hosting Information */}
      {selectedProvider && selectedProvider.id !== 'other' && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Server className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Infrastructure Details</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedProvider.name} provides enterprise-grade security and compliance. 
                Your privacy policy will reference their data processing agreements and security measures.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProvider.compliance.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {cert} Compliant
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}