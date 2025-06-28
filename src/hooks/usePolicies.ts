import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Policy } from '@/types/database';

export function usePolicies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user policies
  const fetchPolicies = async () => {
    if (!user) {
      setPolicies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('policies')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [user]);

  const approvePolicy = async (policyId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase.rpc('approve_policy', {
        policy_id: policyId,
      });

      if (error) throw error;

      // Refresh policies after approval
      const { data } = await supabase
        .from('policies')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPolicies(data);
      }

      return { error: null };
    } catch (err) {
      console.error('Error approving policy:', err);
      return { error: err };
    }
  };

  const syncPolicy = async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Simulate policy generation - in real implementation, this would trigger AI generation
      const mockPolicy = {
        user_id: user.id,
        project_id: projectId,
        title: `Privacy Policy v${Date.now()}`,
        content: `This is a generated privacy policy for project ${projectId}. 

## Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

## How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

## Data Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

## Security
We implement appropriate security measures to protect your personal information.

## Contact Us
If you have questions about this privacy policy, please contact us.

Generated on: ${new Date().toISOString()}`,
        version: `${Math.floor(Date.now() / 1000)}`,
        status: 'pending_review' as const,
      };

      const { data, error } = await supabase
        .from('policies')
        .insert(mockPolicy)
        .select(`
          *,
          project:projects(*)
        `)
        .single();

      if (error) throw error;

      setPolicies(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error syncing policy:', err);
      return { data: null, error: err };
    }
  };

  const deletePolicy = async (policyId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPolicies(prev => prev.filter(policy => policy.id !== policyId));
      return { error: null };
    } catch (err) {
      console.error('Error deleting policy:', err);
      return { error: err };
    }
  };

  // Group policies by project
  const policiesByProject = policies.reduce((acc, policy) => {
    const projectId = policy.project_id;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(policy);
    return acc;
  }, {} as Record<string, Policy[]>);

  return {
    policies,
    policiesByProject,
    loading,
    error,
    approvePolicy,
    syncPolicy,
    deletePolicy,
    refetch: fetchPolicies,
  };
}