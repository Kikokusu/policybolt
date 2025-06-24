import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/shared/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Shield,
  GitBranch,
  Plus,
  ArrowUpRight,
  Code,
  Settings,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { useProjects } from '@/hooks/useProjects';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
    case 'active':
      return 'bg-success text-white';
    case 'draft':
      return 'bg-yellow-500 text-white';
    case 'archived':
    case 'inactive':
      return 'bg-muted text-muted-foreground';
    case 'error':
      return 'bg-red-500 text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, hasActiveSubscription, loading: subscriptionLoading, getPlanName } = useStripeSubscription();
  const { projects, totalPolicyUpdates, loading: projectsLoading } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
      return;
    }

    // If user is authenticated but doesn't have a subscription, redirect to plan selection
    if (!authLoading && !subscriptionLoading && user && !hasActiveSubscription) {
      navigate('/select-plan');
      return;
    }
  }, [user, authLoading, subscriptionLoading, hasActiveSubscription, navigate]);

  if (authLoading || subscriptionLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasActiveSubscription) {
    return null; // Will redirect
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const syncedProjects = projects.filter(p => p.github_synced).length;

  const stats = [
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: 'Unlimited',
      icon: Code,
      trend: 'neutral',
    },
    {
      title: 'Policy Updates',
      value: totalPolicyUpdates.toString(),
      change: 'All time',
      icon: FileText,
      trend: 'neutral',
    },
    {
      title: 'Plan Status',
      value: subscription?.subscription_status === 'trialing' ? 'Trial' : 'Active',
      change: subscription?.subscription_status === 'trialing' ? 'Free trial' : getPlanName(),
      icon: Shield,
      trend: 'up',
    },
    {
      title: 'GitHub Synced',
      value: syncedProjects.toString(),
      change: `${projects.length} total projects`,
      icon: GitBranch,
      trend: 'neutral',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="gradient-text">{userName}</span>
              </h1>
              <p className="text-muted-foreground">
                Your privacy policies are being monitored and updated automatically. Here's what's happening.
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant="secondary" 
                className={subscription?.subscription_status === 'active' ? 'bg-success text-white' : 'bg-yellow-500 text-white'}
              >
                {getPlanName()}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {subscription?.subscription_status === 'trialing' ? 'Free Trial Active' : 'Subscription Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid - 2 Columns: 3/4 + 1/4 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Your Policies - Takes 3/4 columns (75%) */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Policies</CardTitle>
                  <CardDescription>
                    Auto-generated and maintained privacy policies
                  </CardDescription>
                </div>
                {projects.length > 0 && (
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/policies">
                      View All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-lg font-semibold mb-2">No policies yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    {projects.length === 0 
                      ? "Add your first project to start generating privacy policies automatically."
                      : "Your policies will appear here once we analyze your project and generate them."
                    }
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/projects/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Project
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1/4 columns (25%) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link to="/dashboard/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Project
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Your Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  Active repositories being monitored
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-6">
                    <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No projects yet. Add your first project to start monitoring.
                    </p>
                    <Button size="sm" asChild>
                      <Link to="/dashboard/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{project.name}</h4>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(project.status)}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        {project.repository_url && (
                          <p className="text-xs text-muted-foreground truncate">
                            {project.repository_url}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Last scan: {project.last_scan_at 
                              ? new Date(project.last_scan_at).toLocaleDateString()
                              : 'Never'
                            }
                          </span>
                          <div className="flex items-center space-x-1">
                            <GitBranch className="w-3 h-3" />
                            <span className={project.github_synced ? 'text-success' : 'text-muted-foreground'}>
                              {project.github_synced ? 'Synced' : 'Not synced'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {projects.length > 3 && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to="/dashboard/projects">
                          View All Projects ({projects.length})
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}