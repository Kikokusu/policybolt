import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Bot, Zap, Brain, Info, AlertTriangle } from 'lucide-react';
import { ProjectFormData } from '@/pages/AddProject';

interface AIServicesStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const aiUsageOptions = [
  {
    id: 'no-ai',
    title: 'No AI Features',
    description: 'Your project does not use any AI or machine learning',
    icon: CheckCircle,
    note: 'Simplest privacy policy with no AI-related clauses',
  },
  {
    id: 'basic-ai',
    title: 'Basic AI Features',
    description: 'Simple AI features like recommendations or basic automation',
    icon: Bot,
    note: 'Includes standard AI transparency and data usage clauses',
  },
  {
    id: 'advanced-ai',
    title: 'Advanced AI Systems',
    description: 'Complex AI, machine learning models, or AI training',
    icon: Brain,
    note: 'Comprehensive AI governance and transparency requirements',
  },
];

const aiTypes = [
  { id: 'recommendations', name: 'Recommendation Systems', description: 'Product or content recommendations' },
  { id: 'chatbots', name: 'Chatbots & Virtual Assistants', description: 'AI-powered customer support or chat' },
  { id: 'personalization', name: 'Personalization', description: 'Personalized user experiences' },
  { id: 'fraud-detection', name: 'Fraud Detection', description: 'AI-based security and fraud prevention' },
  { id: 'content-moderation', name: 'Content Moderation', description: 'Automated content filtering and moderation' },
  { id: 'image-recognition', name: 'Image Recognition', description: 'Computer vision and image analysis' },
  { id: 'voice-processing', name: 'Voice Processing', description: 'Speech recognition and voice analysis' },
  { id: 'predictive-analytics', name: 'Predictive Analytics', description: 'Forecasting and predictive modeling' },
];

const aiDataUsageOptions = [
  { 
    id: 'individual-processing', 
    name: 'Individual Data Processing', 
    description: 'AI processes individual user data for personalized results' 
  },
  { 
    id: 'aggregated-analysis', 
    name: 'Aggregated Data Analysis', 
    description: 'AI analyzes aggregated, anonymized data patterns' 
  },
  { 
    id: 'model-training', 
    name: 'Model Training', 
    description: 'User data is used to train or improve AI models' 
  },
];

export function AIServicesStep({ formData, updateFormData }: AIServicesStepProps) {
  const handleAITypeToggle = (typeId: string) => {
    const currentTypes = formData.aiTypes;
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(id => id !== typeId)
      : [...currentTypes, typeId];
    
    updateFormData({ aiTypes: newTypes });
  };

  const handleAIDataUsageToggle = (usageId: string) => {
    const currentUsage = formData.aiDataUsage;
    const newUsage = currentUsage.includes(usageId)
      ? currentUsage.filter(id => id !== usageId)
      : [...currentUsage, usageId];
    
    updateFormData({ aiDataUsage: newUsage });
  };

  const showAIDetails = formData.aiUsage === 'basic-ai' || formData.aiUsage === 'advanced-ai';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Label className="text-base font-semibold">
          AI-Based Services *
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Does your project use artificial intelligence or machine learning? This affects transparency and data usage requirements.
        </p>
      </div>

      {/* AI Usage Level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiUsageOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.aiUsage === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => updateFormData({ 
                aiUsage: option.id as any,
                aiTypes: option.id === 'no-ai' ? [] : formData.aiTypes,
                aiDataUsage: option.id === 'no-ai' ? [] : formData.aiDataUsage,
              })}
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

      {/* AI Types Selection */}
      {showAIDetails && (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">
              Types of AI Features *
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Select all AI features that your project uses. This helps us include the right transparency clauses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiTypes.map((type) => {
              const isSelected = formData.aiTypes.includes(type.id);
              
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleAITypeToggle(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleAITypeToggle(type.id)}
                        className="pointer-events-none mt-1"
                      />
                      <div>
                        <h4 className="font-medium">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Data Usage */}
          <div>
            <Label className="text-base font-semibold">
              AI Data Usage *
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              How does your AI use customer data? Select all that apply.
            </p>
          </div>

          <div className="space-y-3">
            {aiDataUsageOptions.map((usage) => {
              const isSelected = formData.aiDataUsage.includes(usage.id);
              
              return (
                <Card
                  key={usage.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleAIDataUsageToggle(usage.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleAIDataUsageToggle(usage.id)}
                        className="pointer-events-none mt-1"
                      />
                      <div>
                        <h4 className="font-medium">{usage.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {usage.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Transparency Note */}
      {showAIDetails && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                AI Transparency Requirements
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                {formData.aiUsage === 'advanced-ai' 
                  ? 'Advanced AI systems require comprehensive transparency about automated decision-making, model training, and user rights regarding AI processing.'
                  : 'Your privacy policy will include clear explanations about how AI features work and what data they use.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}