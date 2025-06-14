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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Profile(props: any) {
  const userId = props.params?.userId;
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitReason, setExitReason] = useState("");

  const isOwnProfile = !userId || userId === (currentUser as any)?.id;
  const profileUserId = userId || (currentUser as any)?.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to view profiles",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: profileUser, isLoading: loadingProfile } = useQuery({
    queryKey: isOwnProfile ? ["/api/auth/user"] : ["/api/users", profileUserId],
    enabled: isAuthenticated && !!profileUserId,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      await apiRequest(`/api/users/${profileUserId}`, "PUT", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
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
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const exitCommunityMutation = useMutation({
    mutationFn: async (reason: string) => {
      await apiRequest("/api/users/exit-community", "POST", { reason });
    },
    onSuccess: () => {
      toast({
        title: "Community Exit",
        description: "You have successfully left the community. Redirecting...",
      });
      setTimeout(() => {
        window.location.href = "/api/logout";
      }, 2000);
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
        description: "Failed to exit community",
        variant: "destructive",
      });
    },
  });

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uct-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-heading font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      location: formData.get("location"),
      jobTitle: formData.get("jobTitle"),
      company: formData.get("company"),
      businessVenture: formData.get("businessVenture"),
      industry: formData.get("industry"),
      bio: formData.get("bio"),
      graduationYear: formData.get("graduationYear") ? parseInt(formData.get("graduationYear") as string) : null,
      degree: formData.get("degree"),
      interests: formData.get("interests") ? JSON.stringify((formData.get("interests") as string).split(",").map(i => i.trim())) : null,
      hobbies: formData.get("hobbies") ? JSON.stringify((formData.get("hobbies") as string).split(",").map(h => h.trim())) : null,
    };
    updateProfileMutation.mutate(data);
  };

  const handleExitCommunity = () => {
    if (exitReason.trim()) {
      exitCommunityMutation.mutate(exitReason);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-uct-blue transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>
              <h1 className="text-xl font-heading font-bold text-gray-900">
                {isOwnProfile ? "My Profile" : `${(profileUser as any)?.firstName || "User"}'s Profile`}
              </h1>
            </div>
            {isOwnProfile && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={updateProfileMutation.isPending}
                >
                  <i className="fas fa-edit mr-2"></i>
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
                <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Exit Community
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Exit UCT SCF Alumni Community</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Are you sure you want to leave the UCT SCF Alumni community? This action will notify all community members.
                      </p>
                      <div>
                        <Label htmlFor="exitReason">Reason for leaving (optional)</Label>
                        <Textarea
                          id="exitReason"
                          value={exitReason}
                          onChange={(e) => setExitReason(e.target.value)}
                          placeholder="Help us understand why you're leaving..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setShowExitDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleExitCommunity}
                          disabled={exitCommunityMutation.isPending}
                        >
                          {exitCommunityMutation.isPending ? "Leaving..." : "Exit Community"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={(profileUser as any)?.firstName || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={(profileUser as any)?.lastName || ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={(profileUser as any)?.bio || ""}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue={(profileUser as any)?.location || ""}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      defaultValue={(profileUser as any)?.industry || ""}
                      placeholder="e.g., Financial Services"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      defaultValue={(profileUser as any)?.jobTitle || ""}
                      placeholder="Your current position"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      defaultValue={(profileUser as any)?.company || ""}
                      placeholder="Current employer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessVenture">Business Venture</Label>
                  <Input
                    id="businessVenture"
                    name="businessVenture"
                    defaultValue={(profileUser as any)?.businessVenture || ""}
                    placeholder="Your own business or side project"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      name="graduationYear"
                      type="number"
                      defaultValue={(profileUser as any)?.graduationYear || ""}
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      name="degree"
                      defaultValue={(profileUser as any)?.degree || ""}
                      placeholder="e.g., BCom Finance"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="interests">Professional Interests</Label>
                  <Input
                    id="interests"
                    name="interests"
                    defaultValue={
                      (profileUser as any)?.interests 
                        ? JSON.parse((profileUser as any).interests).join(", ")
                        : ""
                    }
                    placeholder="Separate with commas, e.g., Investment Banking, Fintech, Startups"
                  />
                </div>

                <div>
                  <Label htmlFor="hobbies">Hobbies & Interests</Label>
                  <Input
                    id="hobbies"
                    name="hobbies"
                    defaultValue={
                      (profileUser as any)?.hobbies 
                        ? JSON.parse((profileUser as any).hobbies).join(", ")
                        : ""
                    }
                    placeholder="Separate with commas, e.g., Hiking, Photography, Reading"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={(profileUser as any)?.profileImageUrl} />
                    <AvatarFallback className="text-xl">
                      {(profileUser as any)?.firstName?.[0] || "U"}
                      {(profileUser as any)?.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                      {(profileUser as any)?.firstName && (profileUser as any)?.lastName
                        ? `${(profileUser as any).firstName} ${(profileUser as any).lastName}`
                        : (profileUser as any)?.email}
                    </h1>
                    {(profileUser as any)?.jobTitle && (
                      <p className="text-lg text-gray-700 mb-1">
                        {(profileUser as any).jobTitle}
                        {(profileUser as any)?.company && ` at ${(profileUser as any).company}`}
                      </p>
                    )}
                    {(profileUser as any)?.location && (
                      <p className="text-gray-600 flex items-center mb-2">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {(profileUser as any).location}
                      </p>
                    )}
                    {(profileUser as any)?.bio && (
                      <p className="text-gray-700">{(profileUser as any).bio}</p>
                    )}
                  </div>
                  {(profileUser as any)?.isAdmin && (
                    <Badge variant="secondary" className="bg-uct-blue text-white">
                      <i className="fas fa-crown mr-1"></i>
                      Admin
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(profileUser as any)?.industry && (
                    <div>
                      <span className="font-medium text-gray-700">Industry:</span>
                      <span className="ml-2 text-gray-600">{(profileUser as any).industry}</span>
                    </div>
                  )}
                  {(profileUser as any)?.businessVenture && (
                    <div>
                      <span className="font-medium text-gray-700">Business Venture:</span>
                      <span className="ml-2 text-gray-600">{(profileUser as any).businessVenture}</span>
                    </div>
                  )}
                  {(profileUser as any)?.interests && (
                    <div>
                      <span className="font-medium text-gray-700 block mb-1">Professional Interests:</span>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse((profileUser as any).interests).map((interest: string, index: number) => (
                          <Badge key={index} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education & Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(profileUser as any)?.degree && (
                    <div>
                      <span className="font-medium text-gray-700">Degree:</span>
                      <span className="ml-2 text-gray-600">{(profileUser as any).degree}</span>
                    </div>
                  )}
                  {(profileUser as any)?.graduationYear && (
                    <div>
                      <span className="font-medium text-gray-700">Graduation Year:</span>
                      <span className="ml-2 text-gray-600">{(profileUser as any).graduationYear}</span>
                    </div>
                  )}
                  {(profileUser as any)?.hobbies && (
                    <div>
                      <span className="font-medium text-gray-700 block mb-1">Hobbies & Interests:</span>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse((profileUser as any).hobbies).map((hobby: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}