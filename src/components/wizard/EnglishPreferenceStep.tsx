import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info } from 'lucide-react';
import { ProjectFormData } from '@/pages/AddProject';

interface EnglishPreferenceStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const englishOptions = [
  {
    id: 'us',
    title: 'US English',
    description: 'American English spelling and legal terminology',
    flag: '🇺🇸',
    examples: ['Organization', 'Recognize', 'Color', 'Analyze'],
    legalNote: 'Uses American legal terminology and references to US privacy laws',
  },
  {
    id: 'uk',
    title: 'UK English',
    description: 'British English spelling and legal terminology',
    flag: '🇬🇧',
    examples: ['Organisation', 'Recognise', 'Colour', 'Analyse'],
    legalNote: 'Uses British legal terminology and references to UK/EU privacy laws',
  },
];

export function EnglishPreferenceStep({ formData, updateFormData }: EnglishPreferenceStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Label className="text-base font-semibold">
          English Spelling Preference *
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your preferred English spelling variant. This affects both language and legal terminology in your privacy policy.
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {englishOptions.map((option) => {
          const isSelected = formData.englishPreference === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => updateFormData({ englishPreference: option.id as any })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{option.flag}</div>
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
                
                {/* Examples */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Spelling Examples:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {option.examples.map((example, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Legal Note */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {option.legalNote}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Why does this matter?
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
              Your choice affects not only spelling but also legal references, terminology, and compliance frameworks 
              mentioned in your privacy policy. This ensures your policy feels natural and legally appropriate for your audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}