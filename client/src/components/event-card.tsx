import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DonationModal } from "@/components/donation-modal";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    venue: string;
    date: string;
    time: string;
    speakers: string | null;
    donationGoal: string | null;
    imageUrl: string | null;
    organizer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    };
    attendees: number;
    totalDonations: number;
    totalPledges: number;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${event.id}/rsvp`, { status: "attending" });
    },
    onSuccess: () => {
      setRsvpStatus("attending");
      toast({
        title: "Success",
        description: "RSVP confirmed!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const donationGoal = event.donationGoal ? parseFloat(event.donationGoal) : 0;
  const donationProgress = donationGoal > 0 ? (event.totalDonations / donationGoal) * 100 : 0;

  const eventDate = new Date(`${event.date}T${event.time}`);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      {event.imageUrl ? (
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-48 object-cover flex-shrink-0" 
        />
      ) : (
        <img 
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300" 
          alt="Alumni networking event" 
          className="w-full h-48 object-cover flex-shrink-0" 
        />
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            {isUpcoming && (
              <Badge className="bg-uct-gold text-white mb-2">
                UPCOMING EVENT
              </Badge>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
            <div className="space-y-2 text-gray-600 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <span>On {format(new Date(event.date), 'MMM d, yyyy')}</span>
                <i className="fas fa-calendar ml-1"></i>
              </div>
              <div className="flex items-center space-x-2">
                <span>At {format(new Date(`2000-01-01T${event.time}`), 'h:mm a')}</span>
                <i className="fas fa-clock ml-1"></i>
              </div>
              <div className="flex items-center space-x-2">
                <span>Located at {event.venue}</span>
                <i className="fas fa-map-marker-alt ml-1"></i>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[80px] flex items-start">
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4 min-h-[60px] flex flex-col justify-start">
          {event.speakers ? (
            <>
              <h4 className="font-semibold text-gray-900 mb-1">Speakers:</h4>
              <p className="text-gray-600 text-sm">{event.speakers}</p>
            </>
          ) : (
            <div className="h-[60px]"></div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-semibold text-uct-blue">{event.attendees}</span>
              <span className="text-gray-600"> attending</span>
            </div>
            {donationGoal > 0 && (
              <div className="text-sm">
                <span className="font-semibold text-uct-gold">R{event.totalDonations.toLocaleString()}</span>
                <span className="text-gray-600"> raised</span>
                {event.totalPledges > 0 && (
                  <>
                    <span className="text-gray-600"> + </span>
                    <span className="font-semibold text-green-600">R{event.totalPledges.toLocaleString()}</span>
                    <span className="text-gray-600"> pledged</span>
                  </>
                )}
                <span className="text-gray-600"> of R{donationGoal.toLocaleString()} goal</span>
              </div>
            )}
          </div>
        </div>

        {donationGoal > 0 && (
          <Progress value={donationProgress} className="mb-4" />
        )}
        
        <div className="flex items-center space-x-3 mt-auto">
          <Button
            className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors ${
              rsvpStatus === "attending" 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-uct-blue hover:bg-blue-700 text-white"
            }`}
            onClick={() => rsvpMutation.mutate()}
            disabled={rsvpMutation.isPending}
          >
            <i className="fas fa-check mr-2"></i>
            {rsvpStatus === "attending" ? "Attending" : "RSVP"}
          </Button>
          <Button 
            className="flex-1 bg-uct-gold hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={() => setShowDonationModal(true)}
          >
            <i className="fas fa-heart mr-2"></i>Donate
          </Button>
          <Button variant="outline" size="icon">
            <i className="fas fa-info-circle"></i>
          </Button>
        </div>
      </div>
      
      <DonationModal
        open={showDonationModal}
        onOpenChange={setShowDonationModal}
        eventTitle={event.title}
        eventId={event.id}
        donationGoal={event.donationGoal ? parseFloat(event.donationGoal) : null}
        totalDonations={event.totalDonations}
        totalPledges={event.totalPledges}
      />
    </div>
  );
}
