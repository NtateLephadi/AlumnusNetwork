import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const { toast } = useToast();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const bankDetails = {
    bankName: "First National Bank",
    accountHolder: "UCT SCF Alumni Fund",
    accountNumber: "1234567890",
    branchCode: "250655",
    reference: "Alumni Donation"
  };

  const copyBankDetails = async () => {
    const details = `Bank: ${bankDetails.bankName}\nAccount: ${bankDetails.accountHolder}\nNumber: ${bankDetails.accountNumber}\nBranch: ${bankDetails.branchCode}\nReference: ${bankDetails.reference}`;
    
    try {
      await navigator.clipboard.writeText(details);
      toast({
        title: "Success",
        description: "Bank details copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to copy bank details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-uct-blue hover:bg-blue-700 text-white">
            <i className="fas fa-heart mr-2"></i>
            Make a Donation
          </Button>
          <Button variant="outline" className="w-full">
            <i className="fas fa-calendar text-uct-blue mr-2"></i>
            Browse Events
          </Button>
          <Button variant="outline" className="w-full">
            <i className="fas fa-user-edit text-uct-blue mr-2"></i>
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Donation Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-university text-uct-blue mr-2"></i>
            Donation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">Bank Name:</span>
            <p className="text-gray-900">{bankDetails.bankName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Account Holder:</span>
            <p className="text-gray-900">{bankDetails.accountHolder}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Account Number:</span>
            <p className="text-gray-900 font-mono">{bankDetails.accountNumber}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Branch Code:</span>
            <p className="text-gray-900 font-mono">{bankDetails.branchCode}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Reference:</span>
            <p className="text-gray-900">{bankDetails.reference}</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={copyBankDetails}
          >
            <i className="fas fa-copy mr-2"></i>Copy Details
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-uct-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-calendar text-white text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">Alumni Networking Mixer</h4>
              <p className="text-sm text-gray-600">March 8, 2024</p>
              <p className="text-xs text-uct-blue">45 attending</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-uct-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">Career Development Workshop</h4>
              <p className="text-sm text-gray-600">March 22, 2024</p>
              <p className="text-xs text-uct-blue">23 attending</p>
            </div>
          </div>
          
          <Button variant="link" className="w-full text-uct-blue p-0">
            View all events <i className="fas fa-arrow-right ml-1"></i>
          </Button>
        </CardContent>
      </Card>



    </div>
  );
}
