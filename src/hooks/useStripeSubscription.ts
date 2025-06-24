import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { stripeProducts } from '@/stripe-config';
import { StripeUserSubscription } from '@/types/database';

export function useStripeSubscription() {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<StripeUserSubscription | null>(null);
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
  }, [user, signOut]);

  const hasActiveSubscription = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';

  const getPlanName = () => {
    if (!subscription?.price_id) {
      return 'No Plan';
    }

    // Find the plan name from stripe config
    const product = stripeProducts.find(p => p.priceId === subscription.price_id);
    if (product) {
      return product.name.replace(' Plan', ''); // Remove "Plan" suffix for cleaner display
    }
    
    return 'Unknown Plan';
  };

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    getPlanName
  };
}