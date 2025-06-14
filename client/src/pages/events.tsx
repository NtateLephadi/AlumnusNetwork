import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/event-card";
import { CreateEventModal } from "@/components/create-event-modal";
import { EditEventModal } from "@/components/edit-event-modal";

export default function Events() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to view events",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: myRsvps, isLoading: loadingRsvps } = useQuery({
    queryKey: ["/api/my-rsvps"],
    enabled: isAuthenticated,
    retry: false,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleDeleteEvent = (eventId: number, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (isLoading || loadingEvents) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uct-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  const isAdmin = (user as any)?.isAdmin;
  const filteredEvents = (events as any[] || []).filter((event: any) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myRsvpEventIds = (myRsvps as any[] || []).map((rsvp: any) => rsvp.eventId);
  const myEvents = filteredEvents.filter((event: any) => myRsvpEventIds.includes(event.id));
  const upcomingEvents = filteredEvents.filter((event: any) => new Date(event.date) >= new Date());
  const pastEvents = filteredEvents.filter((event: any) => new Date(event.date) < new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-uct-blue transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>
              <h1 className="text-xl font-heading font-bold text-gray-900">Events</h1>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowCreateEvent(true)}
                className="bg-uct-blue hover:bg-blue-700"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Event
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search events by title, description, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Event Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All Events ({filteredEvents.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents.length})
            </TabsTrigger>
            <TabsTrigger value="my-events">
              My RSVPs ({myEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? "Try adjusting your search criteria." : "No events have been created yet."}
                  </p>
                  {isAdmin && !searchQuery && (
                    <Button
                      onClick={() => setShowCreateEvent(true)}
                      className="mt-4 bg-uct-blue hover:bg-blue-700"
                    >
                      Create First Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-gray-50"
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEditEvent(true);
                          }}
                          title="Edit event"
                        >
                          <i className="fas fa-edit text-xs text-gray-600"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-red-200 hover:border-red-300"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={deleteEventMutation.isPending}
                          title="Delete event"
                        >
                          <i className="fas fa-trash text-xs text-red-600"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-plus text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-gray-600">Check back later for new events to be announced.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-gray-50"
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEditEvent(true);
                          }}
                          title="Edit event"
                        >
                          <i className="fas fa-edit text-xs text-gray-600"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-red-200 hover:border-red-300"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={deleteEventMutation.isPending}
                          title="Delete event"
                        >
                          <i className="fas fa-trash text-xs text-red-600"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastEvents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-history text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-2">No past events</h3>
                  <p className="text-gray-600">Past events will appear here once they have concluded.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-gray-50"
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEditEvent(true);
                          }}
                          title="Edit event"
                        >
                          <i className="fas fa-edit text-xs text-gray-600"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-red-200 hover:border-red-300"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={deleteEventMutation.isPending}
                          title="Delete event"
                        >
                          <i className="fas fa-trash text-xs text-red-600"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-events" className="mt-6">
            {myEvents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-check text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-2">No RSVPs yet</h3>
                  <p className="text-gray-600">Events you RSVP to will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-gray-50"
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEditEvent(true);
                          }}
                          title="Edit event"
                        >
                          <i className="fas fa-edit text-xs text-gray-600"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-red-200 hover:border-red-300"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={deleteEventMutation.isPending}
                          title="Delete event"
                        >
                          <i className="fas fa-trash text-xs text-red-600"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventModal
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
      />
      
      <EditEventModal
        open={showEditEvent}
        onOpenChange={setShowEditEvent}
        event={editingEvent}
      />
    </div>
  );
}