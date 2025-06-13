import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import PostCard from "@/components/post-card";
import EventCard from "@/components/event-card";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { CreatePostModal } from "@/components/create-post-modal";
import { CreateEventModal } from "@/components/create-event-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-uct-blue to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.firstName || 'Alumni'}!
                  </h1>
                  <p className="text-blue-100">Stay connected with your UCT SCF community</p>
                </div>
                <div className="hidden sm:block">
                  <img 
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                    alt="Alumni networking event" 
                    className="rounded-lg w-32 h-24 object-cover" 
                  />
                </div>
              </div>
            </div>

            {/* Create Post Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-gray-600"></i>
                  )}
                </div>
                <button 
                  className="flex-1 text-left text-gray-500 bg-gray-100 rounded-full py-3 px-4 hover:bg-gray-200 transition-colors"
                  onClick={() => setShowCreatePost(true)}
                >
                  Share an announcement with the community...
                </button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button 
                  className="flex items-center space-x-2 text-gray-600 hover:text-uct-blue transition-colors"
                  onClick={() => setShowCreateEvent(true)}
                >
                  <i className="fas fa-calendar-plus"></i>
                  <span>Create Event</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-uct-red transition-colors">
                  <i className="fas fa-heart"></i>
                  <span>Make Donation</span>
                </button>
              </div>
            </div>

            {/* Feed Posts */}
            {loadingPosts ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {events.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </>
            )}

          </div>

          {/* Sidebar */}
          <Sidebar />

        </div>
      </div>

      <MobileNav />
      
      <CreatePostModal 
        open={showCreatePost} 
        onOpenChange={setShowCreatePost}
      />
      
      <CreateEventModal 
        open={showCreateEvent} 
        onOpenChange={setShowCreateEvent}
      />
    </div>
  );
}
