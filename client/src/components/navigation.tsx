import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/attached_assets/image_1749854348976.png"
                alt="UCT Student Christian Fellowship Logo" 
                className="h-10 w-10 rounded-full"
              />
              <span className="ml-3 text-xl font-heading font-semibold text-gray-900 hidden sm:block">SCF Alumni</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#dashboard" className="text-uct-blue font-medium border-b-2 border-uct-blue pb-4">Dashboard</a>
            <a href="#events" className="text-gray-600 hover:text-uct-blue transition-colors pb-4">Events</a>
            <a href="#donations" className="text-gray-600 hover:text-uct-blue transition-colors pb-4">Donations</a>
            {(user as any)?.isAdmin && (
              <a href="/admin/users" className="text-gray-600 hover:text-uct-blue transition-colors pb-4">
                <i className="fas fa-users mr-2"></i>User Management
              </a>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-uct-blue transition-colors relative">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-uct-red rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {(user as any)?.profileImageUrl ? (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-gray-600"></i>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="hidden sm:block"
            >
              Logout
            </Button>
            <button className="md:hidden p-2">
              <i className="fas fa-bars text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
