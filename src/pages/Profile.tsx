import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SupportRequestForm } from '@/components/SupportRequestForm';
import { stripeProducts } from '@/stripe-config';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, hasSubscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && !subscriptionLoading && user && !hasSubscription) {
      navigate('/select-plan');
      return;
    }
  }, [user, authLoading, subscriptionLoading, hasSubscription, navigate]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      reset({
        name: userName,
        email: user.email || '',
      });
    }
  }, [user, reset]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form to original values
      if (user) {
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        reset({
          name: userName,
          email: user.email || '',
        });
      }
      setError(null);
      setSuccess(null);
    }
    setIsEditing(!isEditing);
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!user) return;

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Update user metadata (name)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: data.name },
        email: data.email !== user.email ? data.email : undefined,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      toast.success('Profile updated successfully!');

      // If email was changed, show confirmation message
      if (data.email !== user.email) {
        toast.info('Please check your new email address for a confirmation link.');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.message.includes('email_address_invalid')) {
        setError('Please enter a valid email address.');
      } else if (err.message.includes('email_address_not_authorized')) {
        setError('This email address is not authorized.');
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    if (!user) return;

    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Password changed successfully!');
      resetPassword();
      toast.success('Password changed successfully!');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password. Please try again.');
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasSubscription) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const memberSince = new Date(user.created_at).toLocaleDateString();
  const emailConfirmed = user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString() : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Your <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-success bg-success/10">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and email address
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={handleEditToggle}
                    disabled={isUpdating}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      {...register('name')}
                      disabled={!isEditing || isUpdating}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      disabled={!isEditing || isUpdating}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">
                        Changing your email will require verification of the new address
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center space-x-3 pt-4">
                      <Button
                        type="submit"
                        disabled={!isDirty || isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEditToggle}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="shadow-lg border-0 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            {...registerPassword('currentPassword')}
                            disabled={isChangingPassword}
                            className={passwordErrors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            disabled={isChangingPassword}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            {...registerPassword('newPassword')}
                            disabled={isChangingPassword}
                            className={passwordErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isChangingPassword}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...registerPassword('confirmPassword')}
                            disabled={isChangingPassword}
                            className={passwordErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isChangingPassword}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>

                      <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" disabled={isChangingPassword}>
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <Button type="submit" disabled={isChangingPassword}>
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            'Change Password'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Account Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary">
                      {subscription?.plan?.name || 'Unknown'}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={subscription?.status === 'trial' ? 'bg-yellow-500 text-white' : 'bg-success text-white'}
                    >
                      {subscription?.status === 'trial' ? 'Trial' : 'Active'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-sm mt-1">{memberSince}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {emailConfirmed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Unverified</span>
                      </>
                    )}
                  </div>
                  {emailConfirmed && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Verified on {emailConfirmed}
                    </p>
                  )}
                </div>

                {subscription?.trial_ends_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Trial Ends</label>
                    <p className="text-sm mt-1">{new Date(subscription.trial_ends_at).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-muted/30">
              <CardContent className="p-6">
                <div className="text-center">
                  <LifeBuoy className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get help from our support team or contact us directly.
                  </p>
                  <div className="space-y-2">
                    <SupportRequestForm 
                      trigger={
                        <Button variant="outline" size="sm" className="w-full">
                          <LifeBuoy className="w-4 h-4 mr-2" />
                          Request Support
                        </Button>
                      }
                    />
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <RouterLink to="/contact">
                        <Mail className="w-4 h-4 mr-2" />
                        General Contact
                      </RouterLink>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}