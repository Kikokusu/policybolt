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
      // If Supabase is not configured or user is not authenticated, set defaults
      if (!supabase || !user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        // First, let's check if we have a customer record
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle();

        console.log('Customer data:', customerData);

        if (customerError) {
          console.error('Customer error:', customerError);
          throw customerError;
        }

        if (!customerData) {
          console.log('No customer found for user');
          setSubscription(null);
          return;
        }

        // Now get the subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('customer_id', customerData.customer_id)
          .is('deleted_at', null)
          .maybeSingle();

        console.log('Raw subscription data:', subscriptionData);

        if (subscriptionError) {
          console.error('Subscription error:', subscriptionError);
          throw subscriptionError;
        }

        // Transform the data to match our interface
        const transformedData = subscriptionData ? {
          customer_id: subscriptionData.customer_id,
          subscription_id: subscriptionData.subscription_id,
          subscription_status: subscriptionData.status,
          price_id: subscriptionData.price_id,
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          cancel_at_period_end: subscriptionData.cancel_at_period_end,
          payment_method_brand: subscriptionData.payment_method_brand,
          payment_method_last4: subscriptionData.payment_method_last4,
        } : null;

        console.log('Transformed subscription data:', transformedData);
        setSubscription(transformedData);
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