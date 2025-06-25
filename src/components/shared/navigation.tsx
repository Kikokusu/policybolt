import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { 
  Shield, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  FileText,
  BarChart3,
  Bell,
  FolderOpen
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { toast } from 'sonner';

interface NavigationProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const publicNavItems = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '/about' },
];

const dashboardNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Policies', href: '/dashboard/policies', icon: FileText },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Navigation({ isAuthenticated: propIsAuthenticated, user: propUser }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const { user: authUser, signOut } = useAuth();
  const { subscription, hasActiveSubscription } = useStripeSubscription();

  // Use auth context if available, otherwise fall back to props
  const isAuthenticated = propIsAuthenticated ?? !!authUser;
  const user = propUser ?? (authUser ? {
    name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url,
  } : undefined);

  const isDashboard = pathname?.startsWith('/dashboard');
  const navItems = isDashboard ? dashboardNavItems : publicNavItems;

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      // If we're not on the home page, navigate to home first
      if (pathname !== '/') {
        window.location.href = '/' + href;
        return;
      }
      
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
      }
    } catch (err) {
      toast.error('Error signing out');
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PolicyBolt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = 'icon' in item ? item.icon : null;
              const isAnchorLink = item.href.startsWith('#');
              
              if (isAnchorLink) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated && user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-xs font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {hasActiveSubscription && subscription && (
                        <Badge 
                          variant="secondary" 
                          className={subscription.subscription_status === 'active' ? 'bg-success text-white' : 'bg-yellow-500 text-white'}
                        >
                          {subscription.subscription_status === 'trialing' ? 'Free Trial' : 'Pro'}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4 animate-fade-in">
            {navItems.map((item) => {
              const Icon = 'icon' in item ? item.icon : null;
              const isAnchorLink = item.href.startsWith('#');
              
              if (isAnchorLink) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center space-x-2 px-2 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-muted w-full text-left"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {!isAuthenticated && (
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/auth/login">Sign in</Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link to="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}