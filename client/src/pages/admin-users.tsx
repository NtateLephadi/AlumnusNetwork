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

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"pending" | "all">("pending");

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !(user as any)?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: pendingUsers, isLoading: loadingPending } = useQuery({
    queryKey: ["/api/admin/pending-users"],
    enabled: isAuthenticated && !!(user as any)?.isAdmin,
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/approve-user/${userId}`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "Success",
        description: "User approved successfully",
      });
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
        description: "Failed to approve user",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/reject-user/${userId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "Success",
        description: "User rejected successfully",
      });
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
        description: "Failed to reject user",
        variant: "destructive",
      });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/promote-user/${userId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      });
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
        description: "Failed to promote user",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uct-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !(user as any)?.isAdmin) {
    return null;
  }

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
              <h1 className="text-xl font-heading font-bold text-gray-900">User Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab("pending")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === "pending"
                    ? "border-uct-blue text-uct-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending Admissions ({(pendingUsers as any[])?.length || 0})
              </button>
              <button
                onClick={() => setSelectedTab("all")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === "all"
                    ? "border-uct-blue text-uct-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Users
              </button>
            </nav>
          </div>
        </div>

        {/* Pending Users Tab */}
        {selectedTab === "pending" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                Pending User Admissions
              </h2>
              <p className="text-gray-600">
                Review and approve new users requesting access to the UCT SCF Alumni community.
              </p>
            </div>

            {loadingPending ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse flex items-center space-x-4">
                        <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !pendingUsers || (pendingUsers as any[]).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-users text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-2">No pending users</h3>
                  <p className="text-gray-600">All user applications have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {(pendingUsers as any[]).map((pendingUser: any) => (
                  <Card key={pendingUser.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={pendingUser.profileImageUrl} />
                            <AvatarFallback>
                              {pendingUser.firstName?.[0] || pendingUser.email?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-heading font-semibold text-gray-900">
                              {pendingUser.firstName && pendingUser.lastName
                                ? `${pendingUser.firstName} ${pendingUser.lastName}`
                                : pendingUser.email}
                            </h3>
                            <p className="text-gray-600 text-sm">{pendingUser.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {pendingUser.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Applied {new Date(pendingUser.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => approveMutation.mutate(pendingUser.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <i className="fas fa-check mr-2"></i>
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => rejectMutation.mutate(pendingUser.id)}
                            disabled={rejectMutation.isPending}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => promoteMutation.mutate(pendingUser.id)}
                            disabled={promoteMutation.isPending}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <i className="fas fa-crown mr-2"></i>
                            Make Admin
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {selectedTab === "all" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                All Users
              </h2>
              <p className="text-gray-600">
                Manage all users in the system and their permissions.
              </p>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">All users view coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}