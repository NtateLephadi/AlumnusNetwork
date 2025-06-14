import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export function EditEventModal({ open, onOpenChange, event }: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    time: "",
    speakers: "",
    donationGoal: "",
    paymentReference: "",
    imageUrl: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (event && open) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        venue: event.venue || "",
        date: event.date || "",
        time: event.time || "",
        speakers: event.speakers || "",
        donationGoal: event.donationGoal || "",
        paymentReference: event.paymentReference || "",
        imageUrl: event.imageUrl || "",
      });
    }
  }, [event, open]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const eventData = {
        ...data,
        donationGoal: data.donationGoal || null,
        paymentReference: data.paymentReference || null,
        imageUrl: data.imageUrl || null,
      };
      await apiRequest("PUT", `/api/events/${event.id}`, eventData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onOpenChange(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Admin session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleDonationGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : numericValue;
    const finalValue = formattedValue.length > 0 && parseFloat(formattedValue) > 99999999.99 
      ? '99999999.99' 
      : formattedValue;
    setFormData(prev => ({ ...prev, donationGoal: finalValue }));
  };

  const formatDisplayValue = (value: string) => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) ? '' : `R${num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Enter event title"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange('date')}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={handleInputChange('time')}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={handleInputChange('venue')}
              placeholder="Event location"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Event description"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="speakers">Speakers (Optional)</Label>
            <Textarea
              id="speakers"
              value={formData.speakers}
              onChange={handleInputChange('speakers')}
              placeholder="List of speakers"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="donationGoal">Donation Goal (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
              <Input
                id="donationGoal"
                value={formData.donationGoal}
                onChange={handleDonationGoalChange}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
            {formData.donationGoal && (
              <p className="text-sm text-gray-600 mt-1">
                Goal: {formatDisplayValue(formData.donationGoal)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="paymentReference">Payment Reference (Optional)</Label>
            <Input
              id="paymentReference"
              value={formData.paymentReference}
              onChange={handleInputChange('paymentReference')}
              placeholder="e.g., Event-Alumni-Donation"
            />
            <p className="text-sm text-gray-600 mt-1">
              Custom reference for donations to this event. If not set, the general banking reference will be used.
            </p>
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange('imageUrl')}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateEventMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-uct-blue hover:bg-blue-700"
              disabled={updateEventMutation.isPending}
            >
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}