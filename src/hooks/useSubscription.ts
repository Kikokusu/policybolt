import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, UserSubscription } from '@/types/database';

export function useSubscription() {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
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
      }
    }

    fetchPlans();
  }, []);

  // Fetch user subscription
  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:plans(*)
          `)
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

        if (error) {
          throw error;
        }

        setSubscription(data || null);
      } catch (err: any) {
        // Handle JWT expired error by signing out the user
        if (err.message?.includes('JWT expired') || err.code === 'PGRST301') {
          await signOut();
          return;
        }
        
        // Only log actual errors, not expected "no subscription" scenarios
        if (err.code !== 'PGRST116') {
          console.error('Error fetching subscription:', err);
          setError('Failed to load subscription');
        } else {
          // User simply doesn't have a subscription yet - this is expected
          setSubscription(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const createSubscription = async (planId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'trial',
        })
        .select(`
          *,
          plan:plans(*)
        `)
        .single();

      if (error) throw error;

      setSubscription(data);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating subscription:', err);
      return { data: null, error: err };
    }
  };

  const updateSubscription = async (updates: Partial<UserSubscription>) => {
    if (!user || !subscription) throw new Error('No subscription to update');

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('user_id', user.id)
        .select(`
          *,
          plan:plans(*)
        `)
        .single();

      if (error) throw error;

      setSubscription(data);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating subscription:', err);
      return { data: null, error: err };
    }
  };

  return {
    subscription,
    plans,
    loading,
    error,
    createSubscription,
    updateSubscription,
    hasSubscription: !!subscription,
  };
}