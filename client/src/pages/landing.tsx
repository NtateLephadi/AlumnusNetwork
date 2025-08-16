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
                {(authMethods?.microsoft || authMethods?.google) ? 'Sign In with Replit' : 'Sign In to Continue'}
              </Button>
              
              {(authMethods?.microsoft || authMethods?.google) && (
                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-2 text-xs text-gray-500">OR</span>
                  </div>
                </div>
              )}
              
              {authMethods?.google && (
                <Button 
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50"
                  onClick={() => window.location.href = '/api/auth/google'}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign In with Google
                </Button>
              )}
              
              {authMethods?.microsoft && (
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
