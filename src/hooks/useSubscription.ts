import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plan } from '@/types/database';
import { useStripeSubscription } from './useStripeSubscription';
import { stripeProducts } from '@/stripe-config';

export function useSubscription() {
  const { subscription: stripeSubscription, loading: stripeLoading, error: stripeError, hasActiveSubscription } = useStripeSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available plans
  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans');
      } finally {
        setPlansLoading(false);
      }
    }

    fetchPlans();
  }, []);

  // Map Stripe subscription to plan
  const getCurrentPlan = () => {
    if (!stripeSubscription?.price_id) return null;
    
    // Find matching plan from Stripe config
    const stripeProduct = stripeProducts.find(p => p.priceId === stripeSubscription.price_id);
    if (!stripeProduct) return null;
    
    // Find corresponding plan in database
    return plans.find(plan => plan.name === stripeProduct.name) || null;
  };

  // Create a subscription-like object for compatibility
  const subscription = stripeSubscription ? {
    id: stripeSubscription.subscription_id || '',
    user_id: '', // Not available in the view
    plan_id: getCurrentPlan()?.id || '',
    status: stripeSubscription.subscription_status === 'active' ? 'active' as const :
            stripeSubscription.subscription_status === 'trialing' ? 'trial' as const :
            stripeSubscription.subscription_status === 'canceled' ? 'cancelled' as const : 'expired' as const,
    trial_ends_at: null,
    created_at: '',
    updated_at: '',
    plan: getCurrentPlan()
  } : null;

  const createSubscription = async (planId: string) => {
    // This would typically redirect to Stripe checkout
    // For now, we'll throw an error since this should be handled by Stripe
    throw new Error('Subscription creation should be handled through Stripe checkout');
  };

  const updateSubscription = async (updates: any) => {
    // This would typically be handled by Stripe webhooks
    // For now, we'll throw an error since this should be handled by Stripe
    throw new Error('Subscription updates should be handled through Stripe');
  };

  // Combine loading states and errors
  const loading = stripeLoading || plansLoading;
  const combinedError = stripeError || error;

  // Set error from stripe if it exists
  useEffect(() => {
    if (stripeError && !error) {
      setError(stripeError);
    }
  }, [stripeError, error]);

  return {
    subscription,
    plans,
    loading,
    error: combinedError,
    createSubscription,
    updateSubscription,
    hasSubscription: hasActiveSubscription,
  };
}