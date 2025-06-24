import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  LifeBuoy,
  Send,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailSender } from '@/hooks/useEmailSender';

const supportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type SupportFormData = z.infer<typeof supportSchema>;

const categories = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'integration', label: 'GitHub Integration' },
  { value: 'policy', label: 'Policy Generation' },
  { value: 'account', label: 'Account Management' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low - General question' },
  { value: 'normal', label: 'Normal - Standard support' },
  { value: 'high', label: 'High - Urgent issue' },
  { value: 'critical', label: 'Critical - Service down' },
];

interface SupportRequestFormProps {
  trigger?: React.ReactNode;
}

export function SupportRequestForm({ trigger }: SupportRequestFormProps) {
  const { user } = useAuth();
  const { sendEmail, loading } = useEmailSender();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
  });

  const onSubmit = async (data: SupportFormData) => {
    if (!user) return;

    setError(null);

    try {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const userEmail = user.email || '';

      // Create detailed subject with category and priority
      const detailedSubject = `[${data.category.toUpperCase()}] [${data.priority.toUpperCase()}] ${data.subject}`;

      // Create enhanced message with user context
      const enhancedMessage = `
User Information:
- Name: ${userName}
- Email: ${userEmail}
- User ID: ${user.id}
- Category: ${categories.find(c => c.value === data.category)?.label}
- Priority: ${priorities.find(p => p.value === data.priority)?.label}

Issue Description:
${data.message}

---
Submitted via PolicyBolt Support System
Timestamp: ${new Date().toISOString()}
      `.trim();

      const result = await sendEmail({
        type: 'support',
        name: userName,
        email: userEmail,
        subject: detailedSubject,
        message: enhancedMessage,
      });

      if (result.success) {
        reset();
        setOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send support request. Please try again.');
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <LifeBuoy className="w-4 h-4 mr-2" />
      Request Support
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5" />
            <span>Request Support</span>
          </DialogTitle>
          <DialogDescription>
            Need help? Our support team is here to assist you. Please provide as much detail as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.priority ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              type="text"
              placeholder="Brief description of your issue"
              {...register('subject')}
              className={errors.subject ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Detailed Description *</Label>
            <Textarea
              id="message"
              rows={6}
              placeholder="Please provide as much detail as possible about your issue, including steps to reproduce, error messages, and what you expected to happen..."
              {...register('message')}
              className={errors.message ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Response Time Expectations
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
              <p>• <strong>Critical:</strong> Within 2 hours</p>
              <p>• <strong>High:</strong> Within 4 hours</p>
              <p>• <strong>Normal:</strong> Within 24 hours</p>
              <p>• <strong>Low:</strong> Within 48 hours</p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}