import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useStripeCancellation() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
      toast.success(result.message || 'Subscription canceled successfully');
      
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