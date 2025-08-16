import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import uctScfLogo from "@assets/image_1749854348976.png";

export default function Landing() {
  const { data: authMethods } = useQuery({
    queryKey: ['/api/auth/methods'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return (
    <div className="min-h-screen bg-uct-blue flex items-center justify-center p-4">
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
                {authMethods?.microsoft ? 'Sign In with Replit' : 'Sign In to Continue'}
              </Button>
              
              {authMethods?.microsoft && (
                <>
                  <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white px-2 text-xs text-gray-500">OR</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    onClick={() => window.location.href = '/api/auth/microsoft'}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                    Sign In with Microsoft
                  </Button>
                </>
              )}
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
