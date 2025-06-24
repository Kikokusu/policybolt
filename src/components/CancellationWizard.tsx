import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Heart,
  DollarSign,
  CheckCircle,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useStripeCancellation } from '@/hooks/useStripeCancellation';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

interface CancellationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const cancellationReasons = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'not_using', label: 'Not using the service enough' },
  { id: 'missing_features', label: 'Missing features I need' },
  { id: 'found_alternative', label: 'Found a better alternative' },
  { id: 'technical_issues', label: 'Technical issues or bugs' },
  { id: 'poor_support', label: 'Poor customer support' },
  { id: 'temporary_pause', label: 'Just need a temporary break' },
  { id: 'other', label: 'Other reason' },
];

type WizardStep = 'retention' | 'feedback' | 'confirmation';

export function CancellationWizard({ open, onOpenChange, onSuccess }: CancellationWizardProps) {
  const [step, setStep] = useState<WizardStep>('retention');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { subscription } = useStripeSubscription();
  const { cancelSubscription, applyRetentionDiscount, loading } = useStripeCancellation();

  const isTrialing = subscription?.subscription_status === 'trialing';
  const isActive = subscription?.subscription_status === 'active';

  const handleClose = () => {
    setStep('retention');
    setSelectedReason('');
    setComment('');
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleAcceptDiscount = async () => {
    setIsProcessing(true);
    try {
      await applyRetentionDiscount();
      onSuccess?.();
      handleClose();
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineDiscount = () => {
    setStep('feedback');
  };

  const handleFinalCancel = async () => {
    setIsProcessing(true);
    try {
      await cancelSubscription(selectedReason, comment);
      setStep('confirmation');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 3000);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsProcessing(false);
    }
  };

  const renderRetentionStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span>We're sad to see you go!</span>
        </DialogTitle>
        <DialogDescription>
          Before you {isTrialing ? 'cancel your trial' : 'cancel your subscription'}, 
          we'd like to offer you something special.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Special Retention Offer</CardTitle>
            <CardDescription>
              Get 50% off your subscription for the next 3 months
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary mb-2">
                <span className="text-red-500">50% OFF</span>
              </div>
              <div className="text-sm text-foreground">
                {isTrialing 
                  ? 'This discount will apply after your trial ends'
                  : 'Starting with your next billing cycle'
                }
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Original price:</span>
                <span className="line-through text-muted-foreground">
                  {subscription?.price_id === 'price_1RdSy5KSNriwT6N6QxdEu4Ct' ? '£0.29' : '£0.79'}/month
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Your price for 3 months:</span>
                <span className="text-primary">
                  {subscription?.price_id === 'price_1RdSy5KSNriwT6N6QxdEu4Ct' ? '£0.15' : '£0.40'}/month
                </span>
              </div>
            </div>

            <Badge variant="secondary" className="bg-success text-white">
              Save {subscription?.price_id === 'price_1RdSy5KSNriwT6N6QxdEu4Ct' ? '£0.42' : '£1.17'} over 3 months
            </Badge>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            This is a one-time offer to help you continue enjoying PolicyBolt at a reduced cost. 
            After 3 months, your subscription will return to the regular price.
          </p>
        </div>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={handleClose} disabled={loading || isProcessing}>
          <X className="w-4 h-4 mr-2" />
          Keep Current Plan
        </Button>
        <Button variant="outline" onClick={handleDeclineDiscount} disabled={loading || isProcessing}>
          No Thanks, Cancel Anyway
        </Button>
        <Button onClick={handleAcceptDiscount} disabled={loading || isProcessing} className="bg-primary">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Applying Discount...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Accept 50% Off
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderFeedbackStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span>Help us improve</span>
        </DialogTitle>
        <DialogDescription>
          We'd love to understand why you're leaving so we can improve PolicyBolt for everyone.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            What's the main reason for {isTrialing ? 'canceling your trial' : 'canceling your subscription'}?
          </Label>
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {cancellationReasons.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.id} id={reason.id} />
                <Label htmlFor={reason.id} className="font-normal cursor-pointer">
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment" className="text-base font-semibold">
            Additional comments (optional)
          </Label>
          <Textarea
            id="comment"
            placeholder="Tell us more about your experience or what we could do better..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => setStep('retention')} disabled={loading || isProcessing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Offer
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleFinalCancel} 
          disabled={loading || isProcessing || !selectedReason}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Canceling...
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              {isTrialing ? 'Cancel Trial' : 'Cancel Subscription'}
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderConfirmationStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-success" />
          <span>{isTrialing ? 'Trial Canceled' : 'Subscription Canceled'}</span>
        </DialogTitle>
        <DialogDescription>
          Your {isTrialing ? 'trial has been canceled' : 'subscription has been canceled successfully'}.
        </DialogDescription>
      </DialogHeader>

      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Thank you for trying PolicyBolt</h3>
          <p className="text-muted-foreground">
            {isTrialing 
              ? 'Your trial has been canceled and you won\'t be charged.'
              : 'You\'ll continue to have access until the end of your current billing period.'
            }
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            We've received your feedback and will use it to improve our service. 
            You're always welcome back - just sign up again anytime!
          </p>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'retention' && renderRetentionStep()}
        {step === 'feedback' && renderFeedbackStep()}
        {step === 'confirmation' && renderConfirmationStep()}
      </DialogContent>
    </Dialog>
  );
}