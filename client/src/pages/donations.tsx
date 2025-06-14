import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { DonationModal } from "@/components/donation-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Donations() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

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
  const isApproved = userStatus === 'approved';

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated && isApproved,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated && isApproved,
  });

  const eventsArray = Array.isArray(events) ? events : [];

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${description} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const { data: activeBankingDetails } = useQuery({
    queryKey: ["/api/banking-details/active"],
    enabled: isAuthenticated && isApproved,
  });

  const bankingDetails = activeBankingDetails || {
    bankName: "First National Bank (FNB)",
    accountName: "UCT Student Christian Fellowship Alumni",
    accountNumber: "62847291038",
    branchCode: "250655",
    swiftCode: "FIRNZAJJ",
    reference: "Alumni-General-Support"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uct-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Donations</h1>
              <p className="text-gray-600">Support the UCT SCF Alumni community and our ongoing initiatives</p>
            </div>

            {/* Banking Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-university text-uct-blue mr-3"></i>
                  Banking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Bank Name</span>
                        <p className="text-gray-900 font-semibold">{bankingDetails.bankName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankingDetails.bankName, "Bank name")}
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Account Name</span>
                        <p className="text-gray-900 font-semibold">{bankingDetails.accountName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankingDetails.accountName, "Account name")}
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Account Number</span>
                        <p className="text-gray-900 font-semibold font-mono">{bankingDetails.accountNumber}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankingDetails.accountNumber, "Account number")}
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Branch Code</span>
                        <p className="text-gray-900 font-semibold font-mono">{bankingDetails.branchCode}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankingDetails.branchCode, "Branch code")}
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">SWIFT Code</span>
                        <p className="text-gray-900 font-semibold font-mono">{bankingDetails.swiftCode}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankingDetails.swiftCode, "SWIFT code")}
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Reference</span>
                        <p className="text-gray-900 font-semibold">{bankingDetails.reference}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankingDetails.reference, "Reference")}
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button
                    className="w-full bg-uct-blue hover:bg-blue-700 text-white"
                    onClick={() => {
                      const allDetails = `Bank: ${bankingDetails.bankName}\nAccount Name: ${bankingDetails.accountName}\nAccount Number: ${bankingDetails.accountNumber}\nBranch Code: ${bankingDetails.branchCode}\nSWIFT Code: ${bankingDetails.swiftCode}\nReference: ${bankingDetails.reference}`;
                      copyToClipboard(allDetails, "All banking details");
                    }}
                  >
                    <i className="fas fa-copy mr-2"></i>
                    Copy All Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-info-circle text-uct-blue mr-3"></i>
                  How to Donate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Online Banking</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Log into your online banking platform</li>
                      <li>Select "Transfer" or "Pay Beneficiary"</li>
                      <li>Add the account details provided above</li>
                      <li>Enter your donation amount</li>
                      <li>Use the reference provided for tracking</li>
                      <li>Complete the transfer</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Branch Visit</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Visit any FNB branch</li>
                      <li>Bring the banking details with you</li>
                      <li>Complete a deposit slip</li>
                      <li>Include the reference for proper tracking</li>
                      <li>Submit your deposit</li>
                      <li>Keep your receipt for records</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Events needing support */}
            {eventsArray.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-calendar-heart text-uct-blue mr-3"></i>
                    Events Accepting Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventsArray.slice(0, 4).map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{event.date}</span>
                          {event.donationGoal && (
                            <span className="text-xs px-2 py-1 bg-blue-50 text-uct-blue border border-uct-blue rounded-full">
                              Goal: R{parseFloat(event.donationGoal).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-uct-blue border-uct-blue hover:bg-uct-blue hover:text-white"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowDonationModal(true);
                            }}
                          >
                            <i className="fas fa-heart mr-2"></i>
                            Donate to Event
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Impact Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-chart-line text-uct-blue mr-3"></i>
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-uct-blue">{(stats as any).totalAlumni}</div>
                      <div className="text-sm text-gray-600">Active Alumni</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-uct-blue">R{((stats as any)?.totalDonations || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Donations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-uct-blue">{(stats as any).eventsThisYear}</div>
                      <div className="text-sm text-gray-600">Events This Year</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-uct-blue">100%</div>
                      <div className="text-sm text-gray-600">Community Driven</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Donation Modal */}
      {selectedEvent && (
        <DonationModal
          open={showDonationModal}
          onOpenChange={setShowDonationModal}
          eventTitle={selectedEvent.title}
          eventId={selectedEvent.id}
          donationGoal={selectedEvent.donationGoal ? parseFloat(selectedEvent.donationGoal) : null}
          totalDonations={selectedEvent.totalDonations || 0}
          totalPledges={selectedEvent.totalPledges || 0}
          paymentReference={selectedEvent.paymentReference}
        />
      )}
    </div>
  );
}