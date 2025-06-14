import { useEffect, useState } from "react";
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
import { DonationModal } from "@/components/donation-modal";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showGenericDonation, setShowGenericDonation] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

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

  // Check user approval status
  const userStatus = (user as any)?.status;
  const isAdmin = (user as any)?.isAdmin;
  const isApproved = userStatus === 'approved';
  const isPending = userStatus === 'pending';
  const isRejected = userStatus === 'rejected';

  // Show different content based on user status
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clock text-yellow-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-600 mb-6">
            Your application to join the UCT SCF Alumni community is being reviewed by our admin team. 
            You'll receive access once approved.
          </p>
          <button 
            onClick={() => window.location.href = '/api/logout'}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-times text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your application to join the UCT SCF Alumni community was not approved at this time.
            Please contact the admin team for more information.
          </p>
          <button 
            onClick={() => window.location.href = '/api/logout'}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated && isApproved,
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated && isApproved,
  });

  const { data: featuredEvents = [] } = useQuery({
    queryKey: ["/api/featured-events"],
    enabled: isAuthenticated && isApproved,
  });

  const { data: polls = [] } = useQuery({
    queryKey: ["/api/polls"],
    enabled: isAuthenticated && isApproved,
  });

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredEvents && Array.isArray(featuredEvents) && featuredEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % featuredEvents.length);
      }, 4000); // Rotate every 4 seconds

      return () => clearInterval(interval);
    }
  }, [featuredEvents]);

  if (isLoading || !isAuthenticated || !isApproved) {
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Welcome back, {(user as any)?.firstName || 'Alumni'}!
                  </h1>
                  <p className="text-gray-600">Stay connected with your UCT SCF community</p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-32 h-24 bg-gradient-to-br from-uct-blue to-blue-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-white text-2xl"></i>
                  </div>
                </div>
              </div>

              {/* Featured Events Carousel */}
              {featuredEvents && Array.isArray(featuredEvents) && featuredEvents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-heading font-semibold text-gray-900">Featured Events</h3>
                    <div className="flex items-center space-x-1">
                      {(featuredEvents as any[]).map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentEventIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentEventIndex ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentEventIndex * 100}%)` }}
                    >
                      {(featuredEvents as any[]).map((featured: any, index: number) => {
                        // Create dummy background images for variety
                        const eventImages = [
                          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop&crop=center',
                          'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop&crop=center',
                          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop&crop=center',
                          'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=200&fit=crop&crop=center'
                        ];
                        const eventImage = eventImages[index % eventImages.length];
                        
                        return (
                          <div key={featured.id} className="w-full flex-shrink-0">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                              <div 
                                className="h-64 bg-cover bg-center relative"
                                style={{ 
                                  backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${eventImage})`
                                }}
                              >
                                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium">Featured Event</span>
                                    <span className="text-sm">{featured.event.attendees} attending</span>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-bold text-2xl mb-2">{featured.event.title}</h4>
                                    <p className="text-white/90 text-sm mb-4 line-clamp-2">{featured.event.description}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span>{featured.event.venue}</span>
                                      </div>
                                      <div>
                                        <span>{featured.event.date}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                      <span>{featured.event.time}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <a 
                      href="/events" 
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View all events <i className="fas fa-arrow-right ml-2"></i>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Create Post Section */}
            {isAdmin && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {(user as any)?.profileImageUrl ? (
                      <img 
                        src={(user as any).profileImageUrl} 
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
                <div className="flex items-center justify-start space-x-6 pt-4 border-t border-gray-100">
                  <button 
                    className="flex items-center space-x-2 text-gray-600 hover:text-uct-blue transition-colors"
                    onClick={() => setShowCreateEvent(true)}
                  >
                    <i className="fas fa-calendar-plus"></i>
                    <span>Create Event</span>
                  </button>
                  <button 
                    className="flex items-center space-x-2 text-gray-600 hover:text-uct-red transition-colors"
                    onClick={() => setShowGenericDonation(true)}
                  >
                    <i className="fas fa-heart"></i>
                    <span>Make Donation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Featured Events Carousel */}
            {(featuredEvents as any[]).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Featured Events</h3>
                <div className="space-y-4">
                  {(featuredEvents as any[]).slice(0, 2).map((featuredEvent: any) => (
                    <EventCard key={featuredEvent.id} event={featuredEvent.event} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Polls */}
            {(polls as any[]).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Community Polls</h3>
                <div className="space-y-4">
                  {(polls as any[]).slice(0, 2).map((poll: any) => (
                    <div key={poll.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{poll.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{poll.description}</p>
                      <div className="space-y-2">
                        {poll.options.map((option: any) => (
                          <div key={option.id} className="flex items-center justify-between">
                            <span className="text-sm">{option.optionText}</span>
                            <span className="text-sm text-gray-500">{option.voteCount} votes</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                {(posts as any[]).map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {(events as any[]).map((event: any) => (
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
      
      <DonationModal 
        open={showGenericDonation} 
        onOpenChange={setShowGenericDonation}
        eventTitle="General Community Support"
        eventId={0}
        donationGoal={null}
        totalDonations={0}
        totalPledges={0}
      />
    </div>
  );
}
