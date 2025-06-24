import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useStripeSubscription() {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) {
          throw error;
        }

        setSubscription(data);
      } catch (err: any) {
        console.error('Error fetching Stripe subscription:', err);
        
        // Handle JWT expired error by signing out the user
        if (err.message?.includes('JWT expired') || err.code === 'PGRST301') {
          await signOut();
          return;
        }
        
        setError(err.message || 'Failed to load subscription');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

    // Find the plan name from stripe config
    const product = stripeProducts.find(p => p.priceId === subscription.price_id);
    if (product) {
      return product.name.replace(' Plan', ''); // Remove "Plan" suffix for cleaner display
    }
    
    return 'Unknown Plan';
  };
}
    error,