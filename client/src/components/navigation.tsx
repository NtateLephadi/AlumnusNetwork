import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import uctScfLogo from "@assets/image_1749854348976.png";
import { NotificationBell } from "@/components/notifications";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={uctScfLogo}
                alt="UCT Student Christian Fellowship Logo" 
                className="h-10 w-10 rounded-full"
              />
              <span className="ml-3 text-xl font-heading font-semibold text-gray-900 hidden sm:block">SCF Alumni</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`font-medium pb-4 transition-colors ${
              location === "/" 
                ? "text-uct-blue border-b-2 border-uct-blue" 
                : "text-gray-600 hover:text-uct-blue"
            }`}>
              Dashboard
            </Link>
            <Link href="/events" className={`font-medium pb-4 transition-colors ${
              location === "/events" 
                ? "text-uct-blue border-b-2 border-uct-blue" 
                : "text-gray-600 hover:text-uct-blue"
            }`}>
              Events
            </Link>
            <Link href="/donations" className={`font-medium pb-4 transition-colors ${
              location === "/donations" 
                ? "text-uct-blue border-b-2 border-uct-blue" 
                : "text-gray-600 hover:text-uct-blue"
            }`}>
              Donations
            </Link>
            {(user as any)?.isAdmin && (
              <Link href="/admin/users" className={`font-medium pb-4 transition-colors ${
                location === "/admin/users" 
                  ? "text-uct-blue border-b-2 border-uct-blue" 
                  : "text-gray-600 hover:text-uct-blue"
              }`}>
                <i className="fas fa-users mr-2"></i>User Management
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user && (user as any)?.status === 'approved' && (
              <NotificationBell />
            )}
            <a 
              href="/profile" 
              className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:ring-2 hover:ring-uct-blue transition-all"
            >
              {(user as any)?.profileImageUrl ? (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-gray-600"></i>
              )}
            </a>
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
