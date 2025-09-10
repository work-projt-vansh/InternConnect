import { ReactNode } from 'react';
import { User, Building2, LogOut, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export const Layout = ({ children, showNav = true }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const getNavItems = () => {
    if (!currentUser) return [];

    if (currentUser.role === 'student') {
      return [
        { path: '/student/dashboard', label: 'Dashboard', icon: User },
        { path: '/student/applications', label: 'Applications', icon: Bell },
        { path: '/student/profile', label: 'Profile', icon: Settings },
      ];
    } else {
      return [
        { path: '/company/dashboard', label: 'Dashboard', icon: Building2 },
        { path: '/company/jobs', label: 'Manage Jobs', icon: Settings },
        { path: '/company/profile', label: 'Company Profile', icon: User },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showNav && currentUser && (
        <nav className="border-b bg-card shadow-card">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="bg-gradient-hero bg-clip-text text-xl font-bold text-transparent">
                  InternConnect
                </div>
                <div className="flex space-x-6">
                  {getNavItems().map(({ path, label, icon: Icon }) => (
                    <Button
                      key={path}
                      variant={location.pathname === path ? 'default' : 'ghost'}
                      onClick={() => navigate(path)}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {currentUser.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className={showNav ? 'pt-0' : ''}>{children}</main>
    </div>
  );
};