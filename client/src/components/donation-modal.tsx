import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventId: number;
  donationGoal?: number | null;
  totalDonations: number;
  totalPledges: number;
}

export function DonationModal({ 
  open, 
  onOpenChange, 
  eventTitle, 
  eventId,
  donationGoal, 
  totalDonations 
}: DonationModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bankingDetails = {
    bankName: "First National Bank (FNB)",
    accountName: "UCT Student Christian Fellowship Alumni",
    accountNumber: "62847291038",
    branchCode: "250655",
    swiftCode: "FIRNZAJJ",
    reference: `Event-${eventTitle.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}`
  };

  const pledgeMutation = useMutation({
    mutationFn: async (amount: string) => {
      await apiRequest("POST", "/api/pledges", {
        eventId,
        amount: parseFloat(amount),
        reference: bankingDetails.reference
      });
    },
    onSuccess: () => {
      toast({
        title: "Pledge Recorded",
        description: "Your pledge has been recorded and admins have been notified!",
      });
      setPledgeAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onOpenChange(false);
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
        description: "Failed to record pledge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePledgeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setPledgeAmount(value);
    }
  };

  const handleSubmitPledge = () => {
    if (!pledgeAmount || parseFloat(pledgeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid pledge amount.",
        variant: "destructive",
      });
      return;
    }
    pledgeMutation.mutate(pledgeAmount);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const donationProgress = donationGoal ? Math.min((totalDonations / donationGoal) * 100, 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <i className="fas fa-heart text-uct-gold"></i>
            <span>Make a Donation</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Pledge Amount Section */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
              <i className="fas fa-hand-holding-heart text-blue-600"></i>
              <span>Make a Pledge</span>
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pledgeAmount" className="text-blue-700">Pledge Amount (ZAR)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium">R</span>
                  <Input
                    id="pledgeAmount"
                    value={pledgeAmount}
                    onChange={handlePledgeAmountChange}
                    placeholder="0.00"
                    className="pl-8 border-blue-300 focus:border-blue-500"
                  />
                </div>
                {pledgeAmount && (
                  <p className="text-sm text-blue-600 mt-1">
                    Pledge: R {parseFloat(pledgeAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <Button
                onClick={handleSubmitPledge}
                disabled={!pledgeAmount || parseFloat(pledgeAmount) <= 0 || pledgeMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {pledgeMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Recording Pledge...
                  </>
                ) : (
                  <>
                    <i className="fas fa-handshake mr-2"></i>
                    Record My Pledge
                  </>
                )}
              </Button>
              <p className="text-xs text-blue-600 text-center">
                Admins will be notified of your pledge commitment
              </p>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{eventTitle}</h3>
            {donationGoal && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Raised: R{totalDonations.toLocaleString()}</span>
                  <span>Goal: R{donationGoal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-uct-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${donationProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  {Math.round(donationProgress)}% of goal reached
                </p>
              </div>
            )}
          </div>

          {/* Banking Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <i className="fas fa-university text-uct-blue"></i>
              <span>Banking Details</span>
            </h4>
            
            <div className="space-y-3">
              {/* Bank Name */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Bank</p>
                  <p className="text-gray-900">{bankingDetails.bankName}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.bankName, 'bank')}
                  className="ml-2"
                >
                  {copiedField === 'bank' ? (
                    <i className="fas fa-check text-green-600"></i>
                  ) : (
                    <i className="fas fa-copy"></i>
                  )}
                </Button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Name</p>
                  <p className="text-gray-900">{bankingDetails.accountName}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.accountName, 'name')}
                  className="ml-2"
                >
                  {copiedField === 'name' ? (
                    <i className="fas fa-check text-green-600"></i>
                  ) : (
                    <i className="fas fa-copy"></i>
                  )}
                </Button>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Number</p>
                  <p className="text-gray-900 font-mono text-lg">{bankingDetails.accountNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.accountNumber, 'account')}
                  className="ml-2"
                >
                  {copiedField === 'account' ? (
                    <i className="fas fa-check text-green-600"></i>
                  ) : (
                    <i className="fas fa-copy"></i>
                  )}
                </Button>
              </div>

              {/* Branch Code */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Branch Code</p>
                  <p className="text-gray-900 font-mono">{bankingDetails.branchCode}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.branchCode, 'branch')}
                  className="ml-2"
                >
                  {copiedField === 'branch' ? (
                    <i className="fas fa-check text-green-600"></i>
                  ) : (
                    <i className="fas fa-copy"></i>
                  )}
                </Button>
              </div>

              {/* Reference */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-700">Payment Reference</p>
                  <p className="text-blue-900 font-mono">{bankingDetails.reference}</p>
                  <p className="text-xs text-blue-600 mt-1">Please use this reference for tracking</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.reference, 'reference')}
                  className="ml-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {copiedField === 'reference' ? (
                    <i className="fas fa-check text-green-600"></i>
                  ) : (
                    <i className="fas fa-copy"></i>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <i className="fas fa-info-circle text-uct-blue"></i>
              <span>How to Donate</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Use your banking app or visit your nearest branch</li>
              <li>Make a transfer to the account details above</li>
              <li>Include the payment reference for proper tracking</li>
              <li>Your donation will be confirmed within 24 hours</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-uct-gold hover:bg-yellow-600"
              onClick={() => {
                // Copy all details to clipboard as formatted text
                const allDetails = `
UCT SCF Alumni Donation Details:
Bank: ${bankingDetails.bankName}
Account Name: ${bankingDetails.accountName}
Account Number: ${bankingDetails.accountNumber}
Branch Code: ${bankingDetails.branchCode}
Reference: ${bankingDetails.reference}
Event: ${eventTitle}
                `.trim();
                copyToClipboard(allDetails, 'all');
              }}
            >
              {copiedField === 'all' ? (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Copied All!
                </>
              ) : (
                <>
                  <i className="fas fa-copy mr-2"></i>
                  Copy All Details
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}