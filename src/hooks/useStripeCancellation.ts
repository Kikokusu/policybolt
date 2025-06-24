import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useStripeCancellation() {
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const cancelSubscription = async (reason?: string, comment?: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'cancel',
          reason,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      const result = await response.json();
      
      // After successful cancellation, disconnect GitHub from all projects
      try {
        const { error: projectsError } = await supabase
          .from('projects')
          .update({ 
            github_synced: false,
            repository_url: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (projectsError) {
          console.error('Error disconnecting GitHub from projects:', projectsError);
        }
      } catch (projectError) {
        console.error('Failed to disconnect GitHub from projects:', projectError);
      }
      
      toast.success(result.message || 'Subscription canceled successfully');
      
      // Sign out the user after successful cancellation
      setTimeout(async () => {
        try {
          await signOut();
          navigate('/auth/login');
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
          // Force navigation even if sign out fails
          navigate('/auth/login');
        }
      }, 2000); // Give time for the success message to be seen
      
      return result;
    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyRetentionDiscount = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'apply_discount',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply discount');
      }

      const result = await response.json();
      toast.success(result.message || 'Discount applied successfully!');
      
      return result;
    } catch (error: any) {
      console.error('Discount application error:', error);
      toast.error(error.message || 'Failed to apply discount');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    cancelSubscription,
    applyRetentionDiscount,
    loading,
  };
}