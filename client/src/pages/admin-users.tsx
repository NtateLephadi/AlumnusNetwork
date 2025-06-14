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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"pending" | "all" | "banking">("pending");
  const [showBankingDialog, setShowBankingDialog] = useState(false);
  const [editingBanking, setEditingBanking] = useState<any>(null);
  const [bankingForm, setBankingForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchCode: "",
    swiftCode: "",
    reference: "",
    isActive: true
  });

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

  const { data: bankingDetails = [], isLoading: loadingBanking } = useQuery({
    queryKey: ["/api/admin/banking-details"],
    enabled: isAuthenticated && !!(user as any)?.isAdmin && selectedTab === "banking",
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
      await apiRequest(`/api/admin/reject-user/${userId}`, "POST");
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
      await apiRequest(`/api/admin/promote-user/${userId}`, "POST");
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

  // Banking details mutations
  const createBankingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/admin/banking-details', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banking-details"] });
      setShowBankingDialog(false);
      setBankingForm({
        bankName: "",
        accountName: "",
        accountNumber: "",
        branchCode: "",
        swiftCode: "",
        reference: "",
        isActive: true
      });
      toast({
        title: "Success",
        description: "Banking details created successfully",
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
        description: "Failed to create banking details",
        variant: "destructive",
      });
    },
  });

  const updateBankingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest('PUT', `/api/admin/banking-details/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banking-details"] });
      setShowBankingDialog(false);
      setEditingBanking(null);
      toast({
        title: "Success",
        description: "Banking details updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Banking update error:", error);
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
        description: `Failed to update banking details: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const deleteBankingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/banking-details/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banking-details"] });
      toast({
        title: "Success",
        description: "Banking details deleted successfully",
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
        description: "Failed to delete banking details",
        variant: "destructive",
      });
    },
  });

  const activateBankingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PUT', `/api/admin/banking-details/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banking-details"] });
      toast({
        title: "Success",
        description: "Banking details activated successfully",
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
        description: "Failed to activate banking details",
        variant: "destructive",
      });
    },
  });

  const handleBankingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Banking form submission:", { editingBanking, bankingForm });
    if (editingBanking) {
      console.log("Updating banking details with:", { id: editingBanking.id, data: bankingForm });
      updateBankingMutation.mutate({ id: editingBanking.id, data: bankingForm });
    } else {
      console.log("Creating banking details with:", bankingForm);
      createBankingMutation.mutate(bankingForm);
    }
  };

  const openBankingDialog = (banking?: any) => {
    if (banking) {
      setEditingBanking(banking);
      setBankingForm({
        bankName: banking.bankName || "",
        accountName: banking.accountName || "",
        accountNumber: banking.accountNumber || "",
        branchCode: banking.branchCode || "",
        swiftCode: banking.swiftCode || "",
        reference: banking.reference || "",
        isActive: banking.isActive || false
      });
    } else {
      setEditingBanking(null);
      setBankingForm({
        bankName: "",
        accountName: "",
        accountNumber: "",
        branchCode: "",
        swiftCode: "",
        reference: "",
        isActive: true
      });
    }
    setShowBankingDialog(true);
  };

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
    <div className="min-h-screen bg-uct-blue">
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
          <div className="border-b border-gray-300">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab("pending")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === "pending"
                    ? "border-white text-white"
                    : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
                }`}
              >
                Pending Admissions ({(pendingUsers as any[])?.length || 0})
              </button>
              <button
                onClick={() => setSelectedTab("all")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === "all"
                    ? "border-white text-white"
                    : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setSelectedTab("banking")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === "banking"
                    ? "border-white text-white"
                    : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
                }`}
              >
                Banking Details ({(bankingDetails as any[])?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Pending Users Tab */}
        {selectedTab === "pending" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-heading font-semibold text-white mb-2">
                Pending User Admissions
              </h2>
              <p className="text-gray-300">
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

        {/* Banking Details Tab */}
        {selectedTab === "banking" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                  Banking Details Management
                </h2>
                <p className="text-gray-600">
                  Manage banking details for donations and payments.
                </p>
              </div>
              <Button 
                onClick={() => openBankingDialog()}
                className="bg-uct-blue hover:bg-blue-700 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Banking Details
              </Button>
            </div>

            {loadingBanking ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uct-blue mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading banking details...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {(bankingDetails as any[])?.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <i className="fas fa-university text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600 mb-4">No banking details found</p>
                      <Button 
                        onClick={() => openBankingDialog()}
                        className="bg-uct-blue hover:bg-blue-700 text-white"
                      >
                        Add First Banking Details
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  (bankingDetails as any[])?.map((banking: any) => (
                    <Card key={banking.id} className={`${banking.isActive ? 'ring-2 ring-green-500' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
                              <p className="text-gray-900 font-semibold">{banking.bankName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Account Name</Label>
                              <p className="text-gray-900 font-semibold">{banking.accountName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Account Number</Label>
                              <p className="text-gray-900 font-mono">{banking.accountNumber}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Branch Code</Label>
                              <p className="text-gray-900 font-mono">{banking.branchCode}</p>
                            </div>
                            {banking.swiftCode && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">SWIFT Code</Label>
                                <p className="text-gray-900 font-mono">{banking.swiftCode}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Reference</Label>
                              <p className="text-gray-900">{banking.reference}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            {banking.isActive && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Active
                              </Badge>
                            )}
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openBankingDialog(banking)}
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </Button>
                              {!banking.isActive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => activateBankingMutation.mutate(banking.id)}
                                  disabled={activateBankingMutation.isPending}
                                >
                                  <i className="fas fa-check mr-1"></i>
                                  Activate
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete these banking details?')) {
                                    deleteBankingMutation.mutate(banking.id);
                                  }
                                }}
                                disabled={deleteBankingMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Banking Details Dialog */}
            <Dialog open={showBankingDialog} onOpenChange={setShowBankingDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingBanking ? 'Edit Banking Details' : 'Add Banking Details'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBankingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankingForm.bankName}
                      onChange={(e) => setBankingForm(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="e.g., First National Bank"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={bankingForm.accountName}
                      onChange={(e) => setBankingForm(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="e.g., UCT SCF Alumni Fund"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankingForm.accountNumber}
                      onChange={(e) => setBankingForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="e.g., 1234567890"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchCode">Branch Code</Label>
                    <Input
                      id="branchCode"
                      value={bankingForm.branchCode}
                      onChange={(e) => setBankingForm(prev => ({ ...prev, branchCode: e.target.value }))}
                      placeholder="e.g., 250655"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
                    <Input
                      id="swiftCode"
                      value={bankingForm.swiftCode}
                      onChange={(e) => setBankingForm(prev => ({ ...prev, swiftCode: e.target.value }))}
                      placeholder="e.g., FIRNZAJJ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={bankingForm.reference}
                      onChange={(e) => setBankingForm(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="e.g., Alumni-General-Support"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBankingDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-uct-blue hover:bg-blue-700 text-white"
                      disabled={createBankingMutation.isPending || updateBankingMutation.isPending}
                    >
                      {(createBankingMutation.isPending || updateBankingMutation.isPending) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {editingBanking ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}