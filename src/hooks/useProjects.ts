import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Project, PolicyUpdate } from '@/types/database';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [policyUpdates, setPolicyUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user projects
  useEffect(() => {
    async function fetchProjects() {
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  // Fetch policy updates
  useEffect(() => {
    async function fetchPolicyUpdates() {
      if (!user) {
        setPolicyUpdates([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('policy_updates')
          .select(`
            *,
            project:projects(*)
          `)
          .eq('user_id', user.id)
          .order('last_update_at', { ascending: false });

        if (error) throw error;
        setPolicyUpdates(data || []);
      } catch (err) {
        console.error('Error fetching policy updates:', err);
        setError('Failed to load policy updates');
      }
    }

    fetchPolicyUpdates();
  }, [user]);

  const createProject = async (projectData: {
    name: string;
    repository_url?: string;
    github_synced?: boolean;
    config?: any;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          repository_url: projectData.repository_url || null,
          github_synced: projectData.github_synced || false,
          config: projectData.config || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating project:', err);
      return { data: null, error: err };
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? data : project
        )
      );
      return { data, error: null };
    } catch (err) {
      console.error('Error updating project:', err);
      return { data: null, error: err };
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== projectId));
      setPolicyUpdates(prev => prev.filter(update => update.project_id !== projectId));
      return { error: null };
    } catch (err) {
      console.error('Error deleting project:', err);
      return { error: err };
    }
  };

  const incrementPolicyUpdateCounter = async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase.rpc('increment_policy_update_counter', {
        p_user_id: user.id,
        p_project_id: projectId,
      });

      if (error) throw error;

      // Refresh policy updates
      const { data } = await supabase
        .from('policy_updates')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('user_id', user.id)
        .order('last_update_at', { ascending: false });

      if (data) {
        setPolicyUpdates(data);
      }

      return { error: null };
    } catch (err) {
      console.error('Error incrementing policy update counter:', err);
      return { error: err };
    }
  };

  // Calculate total policy updates across all projects
  const totalPolicyUpdates = policyUpdates.reduce(
    (total, update) => total + update.update_count, 
    0
  );

  return {
    projects,
    policyUpdates,
    totalPolicyUpdates,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    incrementPolicyUpdateCounter,
  };
}