import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Smartphone, 
  Layers,
  CheckCircle,
} from 'lucide-react';
import { ProjectFormData } from '@/pages/AddProject';

interface ProjectNameStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const purposeOptions = [
  {
    id: 'website',
    title: 'Website',
    description: 'Static or dynamic websites, blogs, portfolios',
    icon: Globe,
    examples: ['Landing pages', 'Corporate websites', 'E-commerce sites'],
  },
  {
    id: 'mobile-app',
    title: 'Mobile App',
    description: 'iOS, Android, or cross-platform mobile applications',
    icon: Smartphone,
    examples: ['Native apps', 'React Native', 'Flutter apps'],
  },
  {
    id: 'saas-platform',
    title: 'SaaS Platform',
    description: 'Software as a Service applications and platforms',
    icon: Layers,
    examples: ['Web applications', 'API services', 'Cloud platforms'],
  },
];

export function ProjectNameStep({ formData, updateFormData }: ProjectNameStepProps) {
  return (
    <div className="space-y-8">
      {/* Project Name */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="projectName" className="text-base font-semibold">
            Project Name *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Give your project a descriptive name that you'll recognize
          </p>
        </div>
        <Input
          id="projectName"
          type="text"
          placeholder="My Awesome Project"
          value={formData.projectName}
          onChange={(e) => updateFormData({ projectName: e.target.value })}
          className="text-lg"
        />
      </div>

      {/* Purpose Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">
            Project Purpose *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select the type of project you're building to help us generate the most accurate privacy policy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {purposeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = formData.purpose === option.id;
            
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => updateFormData({ purpose: option.id as any })}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Examples:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {option.examples.map((example, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      {formData.purpose && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Perfect choice!</p>
              <p className="text-sm text-muted-foreground">
                We'll tailor your privacy policy to include the most relevant clauses for{' '}
                {purposeOptions.find(opt => opt.id === formData.purpose)?.title.toLowerCase()} projects.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}