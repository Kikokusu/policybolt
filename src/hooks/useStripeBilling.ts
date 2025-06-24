import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useStripeBilling() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const openBillingPortal = async (returnUrl?: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          return_url: returnUrl || `${window.location.origin}/dashboard/settings`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to open billing portal');
      }

      const { url } = await response.json();
      
      if (url) {
        // Open billing portal in the same window
        window.location.href = url;
      } else {
        throw new Error('No billing portal URL received');
      }
    } catch (error: any) {
      console.error('Billing portal error:', error);
      toast.error(error.message || 'Failed to open billing portal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    openBillingPortal,
    loading,
  };
}