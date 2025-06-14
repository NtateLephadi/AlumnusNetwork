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
import { ArrowLeft, MapPin, Building, Briefcase, Calendar, Users, Trophy, Edit, Camera, Trash2 } from "lucide-react";

export default function Profile(props: any) {
  const userId = props.params?.userId;
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitReason, setExitReason] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<any>(null);

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

  const { data: userEducation = [], isLoading: isEducationLoading } = useQuery({
    queryKey: ["/api/users", profileUserId, "education"],
    enabled: isAuthenticated && !!profileUserId,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      await apiRequest("PUT", `/api/users/${profileUserId}`, profileData);
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

  const updateProfileImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      await apiRequest("PUT", `/api/users/${profileUserId}`, { profileImageUrl: imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowImageUpload(false);
      setImagePreview(null);
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
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
      toast({
        title: "Error",
        description: "Failed to update profile picture",
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = () => {
    if (imagePreview) {
      updateProfileImageMutation.mutate(imagePreview);
    }
  };

  const removeCurrentImage = () => {
    updateProfileImageMutation.mutate("");
  };

  const addEducationMutation = useMutation({
    mutationFn: async (educationData: any) => {
      await apiRequest("POST", `/api/users/${profileUserId}/education`, educationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileUserId, "education"] });
      setShowEducationModal(false);
      setEditingEducation(null);
      toast({
        title: "Success",
        description: "Education added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add education",
        variant: "destructive",
      });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/education/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileUserId, "education"] });
      setShowEducationModal(false);
      setEditingEducation(null);
      toast({
        title: "Success",
        description: "Education updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update education",
        variant: "destructive",
      });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/education/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileUserId, "education"] });
      toast({
        title: "Success",
        description: "Education deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const handleEducationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      institution: formData.get('institution'),
      degree: formData.get('degree'),
      fieldOfStudy: formData.get('fieldOfStudy'),
      startYear: parseInt(formData.get('startYear') as string) || null,
      endYear: parseInt(formData.get('endYear') as string) || null,
      description: formData.get('description'),
    };

    if (editingEducation) {
      updateEducationMutation.mutate({ id: editingEducation.id, data });
    } else {
      addEducationMutation.mutate(data);
    }
  };

  const openEditEducation = (education: any) => {
    setEditingEducation(education);
    setShowEducationModal(true);
  };

  const openAddEducation = () => {
    setEditingEducation(null);
    setShowEducationModal(true);
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
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={(profileUser as any)?.profileImageUrl} />
                      <AvatarFallback className="text-xl">
                        {(profileUser as any)?.firstName?.[0] || "U"}
                        {(profileUser as any)?.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0"
                        onClick={() => setShowImageUpload(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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

              {/* Education Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Education</CardTitle>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openAddEducation}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Add Qualification
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEducationLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading education...</div>
                  ) : userEducation.length > 0 ? (
                    <div className="space-y-4">
                      {userEducation.map((education: any) => (
                        <div key={education.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{education.degree}</h4>
                              <p className="text-gray-700">{education.institution}</p>
                              {education.fieldOfStudy && (
                                <p className="text-sm text-gray-600">{education.fieldOfStudy}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {education.startYear && education.endYear 
                                  ? `${education.startYear} - ${education.endYear}`
                                  : education.startYear 
                                    ? `${education.startYear} - Present`
                                    : education.endYear 
                                      ? `Completed ${education.endYear}`
                                      : 'Dates not specified'
                                }
                              </p>
                              {education.description && (
                                <p className="text-sm text-gray-600 mt-2">{education.description}</p>
                              )}
                            </div>
                            {isOwnProfile && (
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditEducation(education)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteEducationMutation.mutate(education.id)}
                                  disabled={deleteEducationMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {isOwnProfile ? (
                        <div>
                          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <p>No qualifications added yet</p>
                          <p className="text-sm mt-1">Add your educational background and certifications</p>
                        </div>
                      ) : (
                        <p>No education information available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Interests */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Interests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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

      {/* Profile Picture Upload Dialog */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Image */}
            {(profileUser as any)?.profileImageUrl && !imagePreview && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Current picture:</p>
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={(profileUser as any)?.profileImageUrl} />
                  <AvatarFallback>
                    {(profileUser as any)?.firstName?.[0] || "U"}
                    {(profileUser as any)?.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeCurrentImage}
                  disabled={updateProfileImageMutation.isPending}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Picture
                </Button>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">New picture preview:</p>
                <div className="flex justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={imagePreview} />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex justify-center space-x-2 mt-3">
                  <Button
                    onClick={handleImageSubmit}
                    disabled={updateProfileImageMutation.isPending}
                    size="sm"
                  >
                    {updateProfileImageMutation.isPending ? "Updating..." : "Update Picture"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setImagePreview(null)}
                    disabled={updateProfileImageMutation.isPending}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Upload New Image */}
            {!imagePreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> a new profile picture
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Education Modal */}
      <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEducation ? "Edit Qualification" : "Add Qualification"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEducationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  name="institution"
                  defaultValue={editingEducation?.institution || ""}
                  placeholder="e.g., University of Cape Town"
                  required
                />
              </div>
              <div>
                <Label htmlFor="degree">Degree/Qualification</Label>
                <Input
                  id="degree"
                  name="degree"
                  defaultValue={editingEducation?.degree || ""}
                  placeholder="e.g., Bachelor of Science, MBA, Certificate"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  defaultValue={editingEducation?.fieldOfStudy || ""}
                  placeholder="e.g., Computer Science, Business Administration"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startYear">Start Year</Label>
                  <Input
                    id="startYear"
                    name="startYear"
                    type="number"
                    min="1900"
                    max="2030"
                    defaultValue={editingEducation?.startYear || ""}
                    placeholder="2020"
                  />
                </div>
                <div>
                  <Label htmlFor="endYear">End Year</Label>
                  <Input
                    id="endYear"
                    name="endYear"
                    type="number"
                    min="1900"
                    max="2030"
                    defaultValue={editingEducation?.endYear || ""}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingEducation?.description || ""}
                  placeholder="Additional details, achievements, or notes..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEducationModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addEducationMutation.isPending || updateEducationMutation.isPending}
              >
                {(addEducationMutation.isPending || updateEducationMutation.isPending) 
                  ? "Saving..." 
                  : editingEducation 
                    ? "Update" 
                    : "Add"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}