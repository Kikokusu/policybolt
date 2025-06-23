import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Globe, MapPin, Shield, Info } from 'lucide-react';
import { ProjectFormData } from '@/pages/AddProject';

interface UserGeographyStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const geographyOptions = [
  {
    id: 'worldwide',
    title: 'Worldwide',
    description: 'Users from all countries and regions',
    icon: Globe,
    note: 'Includes comprehensive privacy compliance for all major jurisdictions',
  },
  {
    id: 'specific-regions',
    title: 'Specific Regions',
    description: 'Target specific countries or regions only',
    icon: MapPin,
    note: 'Tailored compliance for your selected regions',
  },
];

const regions = [
  { id: 'us', name: 'United States', flag: '🇺🇸', laws: ['CCPA', 'COPPA'] },
  { id: 'eu', name: 'European Union', flag: '🇪🇺', laws: ['GDPR', 'ePrivacy'] },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', laws: ['UK GDPR', 'DPA 2018'] },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', laws: ['PIPEDA', 'Bill C-11'] },
  { id: 'australia', name: 'Australia', flag: '🇦🇺', laws: ['Privacy Act'] },
  { id: 'asia-pacific', name: 'Asia-Pacific', flag: '🌏', laws: ['Various'] },
  { id: 'latin-america', name: 'Latin America', flag: '🌎', laws: ['LGPD', 'Various'] },
  { id: 'other', name: 'Other Regions', flag: '🌍', laws: ['Various'] },
];

export function UserGeographyStep({ formData, updateFormData }: UserGeographyStepProps) {
  const handleRegionToggle = (regionId: string) => {
    const currentRegions = formData.selectedRegions;
    const newRegions = currentRegions.includes(regionId)
      ? currentRegions.filter(id => id !== regionId)
      : [...currentRegions, regionId];
    
    updateFormData({ selectedRegions: newRegions });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Label className="text-base font-semibold">
          User Geography *
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Where are your users located? This determines which privacy laws and regulations apply to your project.
        </p>
      </div>

      {/* Geography Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {geographyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.geographyScope === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => updateFormData({ 
                geographyScope: option.id as any,
                selectedRegions: option.id === 'worldwide' ? [] : formData.selectedRegions
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
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    {option.note}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Region Selection */}
      {formData.geographyScope === 'specific-regions' && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">
              Select Target Regions *
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Choose all regions where your users are located. We'll include relevant privacy laws for each region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions.map((region) => {
              const isSelected = formData.selectedRegions.includes(region.id);
              
              return (
                <Card
                  key={region.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleRegionToggle(region.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleRegionToggle(region.id)}
                        className="pointer-events-none"
                      />
                      <div className="text-2xl">{region.flag}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{region.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {region.laws.map((law, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {law}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy Compliance Note */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Privacy Compliance Coverage
            </p>
            <p className="text-sm text-green-700 dark:text-green-200 mt-1">
              {formData.geographyScope === 'worldwide' 
                ? 'Your privacy policy will include comprehensive coverage for GDPR, CCPA, PIPEDA, and other major privacy laws worldwide.'
                : formData.selectedRegions.length > 0
                ? `Your privacy policy will be tailored for ${formData.selectedRegions.length} selected region${formData.selectedRegions.length > 1 ? 's' : ''} with relevant privacy law compliance.`
                : 'Select your target regions to see which privacy laws will be covered.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}