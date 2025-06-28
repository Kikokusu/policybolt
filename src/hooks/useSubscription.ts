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
      // If Supabase is not configured, set empty plans and finish loading
      if (!supabase) {
        setPlans([]);
        setPlansLoading(false);
        return;
      }

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
    console.log('Getting current plan for subscription:', stripeSubscription?.price_id, stripeSubscription?.subscription_status);
    
    if (!stripeSubscription?.price_id) return null;
    
    // Map Stripe price IDs to plan names and find in database
    let planName = '';
    let maxProjects = 0;
    
    if (stripeSubscription.price_id === 'price_1RddANKSNriwT6N669BShQb0') {
      planName = 'Solo Developer';
      maxProjects = 1;
      console.log('Mapped to Solo Developer plan (1 project)');
    } else if (stripeSubscription.price_id === 'price_1RddB1KSNriwT6N6Ku1vE00V') {
      planName = 'Growing Startup';
      maxProjects = 5;
      console.log('Mapped to Growing Startup plan (5 projects)');
    } else {
      console.log('Unknown price_id:', stripeSubscription.price_id);
      return null;
    }
    
    // Find plan in database or create a virtual one
    const dbPlan = plans.find(plan => plan.name === planName);
    if (dbPlan) {
      console.log('Found plan in database:', dbPlan.name, 'max_projects:', dbPlan.max_projects);
      return dbPlan;
    }
    
    // Create virtual plan if not found in database
    const virtualPlan = {
      id: stripeSubscription.price_id,
      name: planName,
      description: '',
      price: stripeSubscription.price_id === 'price_1RddANKSNriwT6N669BShQb0' ? 29 : 79,
      max_projects: maxProjects,
      features: [],
      is_active: true,
      created_at: '',
      updated_at: ''
    };
    
    console.log('Created virtual plan:', virtualPlan.name, 'max_projects:', virtualPlan.max_projects);
    return virtualPlan;
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
  
  console.log('Final subscription object:', subscription);

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