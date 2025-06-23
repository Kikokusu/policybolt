import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, FileText } from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  content: string;
  version: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  project?: {
    name: string;
  };
}

export function PolicyEmbedPage() {
  const { policyId, projectId } = useParams();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPolicy() {
      try {
        let query = supabase.from('policies').select(`
          id,
          title,
          content,
          version,
          status,
          created_at,
          approved_at,
          project:projects(name)
        `);

        if (policyId) {
          // Fetch specific policy by ID
          query = query.eq('id', policyId);
        } else if (projectId) {
          // Fetch active policy for project
          query = query.eq('project_id', projectId).eq('status', 'active');
        } else {
          throw new Error('No policy or project ID provided');
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Policy not found or not publicly available');
          return;
        }

        setPolicy(data);
      } catch (err: any) {
        console.error('Error fetching policy:', err);
        setError(err.message || 'Failed to load policy');
      } finally {
        setLoading(false);
      }
    }

    fetchPolicy();
  }, [policyId, projectId]);

  // Send height to parent window for iframe resizing
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'resize', height }, '*');
    };

    // Send initial height
    sendHeight();

    // Listen for height requests
    window.addEventListener('message', (event) => {
      if (event.data === 'getHeight') {
        sendHeight();
      }
    });

    // Send height when content changes
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, [policy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Policy Not Available</h2>
            <p className="text-muted-foreground">
              {error || 'The requested privacy policy could not be found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{policy.title}</CardTitle>
                  {policy.project && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {policy.project.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="secondary" 
                  className={policy.status === 'active' ? 'bg-success text-white' : ''}
                >
                  {policy.status === 'active' ? 'Active' : policy.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Version {policy.version}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Created: {new Date(policy.created_at).toLocaleDateString()}</span>
              </div>
              {policy.approved_at && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Approved: {new Date(policy.approved_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {policy.content}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground">
                This privacy policy is powered by{' '}
                <a 
                  href="https://policybolt.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  PolicyBolt
                </a>
                {' '}• Last updated: {new Date(policy.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}