import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import uctScfLogo from "@assets/image_1749854348976.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-uct-blue to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src={uctScfLogo}
                alt="UCT Student Christian Fellowship Logo" 
                className="h-20 w-20 rounded-full"
              />
            </div>
            
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                UCT SCF Alumni Hub
              </h1>
              <p className="text-base font-body text-uct-blue font-semibold mb-1">
                Student Christian Fellowship
              </p>
              <p className="text-gray-600 font-body">
                Connect, share, and support your UCT SCF community
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full bg-uct-blue hover:bg-blue-700"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In to Continue
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              Join our community of UCT SCF alumni to stay connected, 
              share updates, and support meaningful initiatives.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
