import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, Zap, BarChart3 } from "lucide-react";
import { authenticateWithPowerBI, isAuthenticated as isPowerBIAuthenticated } from "@/lib/powerbi";
import { authenticateWithLookerStudio, isAuthenticated as isLookerStudioAuthenticated } from "@/lib/looker-studio";
import { useState, useEffect } from "react";

type BIProvider = 'powerbi' | 'lookerstudio';

interface IntegrationBannerProps {
  onConnectLookerStudio?: () => void;
}

export function IntegrationBanner({ onConnectLookerStudio }: IntegrationBannerProps = {}) {
  const [powerBIConnected, setPowerBIConnected] = useState(false);
  const [lookerStudioConnected, setLookerStudioConnected] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<BIProvider>('powerbi');

  useEffect(() => {
    setPowerBIConnected(isPowerBIAuthenticated());
    setLookerStudioConnected(isLookerStudioAuthenticated());
  }, []);

  const handleSetupGuide = (provider: BIProvider) => {
    if (provider === 'powerbi') {
      window.open('https://docs.microsoft.com/en-us/power-bi/developer/embedded/setup-guide', '_blank');
    } else {
      window.open('https://developers.google.com/looker-studio', '_blank');
    }
  };

  const handleConnect = (provider: BIProvider) => {
    if (provider === 'powerbi') {
      authenticateWithPowerBI();
    } else {
      if (onConnectLookerStudio) {
        onConnectLookerStudio();
      } else {
        authenticateWithLookerStudio();
      }
    }
  };

  // Hide banner if both are connected
  if (powerBIConnected && lookerStudioConnected) {
    return null;
  }

  const renderProviderCard = (provider: BIProvider, isConnected: boolean, title: string, description: string, icon: React.ReactNode, connectText: string) => {
    if (isConnected) return null;

    return (
      <Card className="border-2 border-warning/30 bg-gradient-to-r from-warning/10 via-warning/5 to-warning/10 hover:shadow-2xl hover:shadow-warning/20 transition-all duration-700 overflow-hidden relative group animate-fade-in hover:transform hover:scale-[1.02]">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-warning/5 via-warning/10 to-warning/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Floating elements */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-warning/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-8 right-12 w-2 h-2 bg-warning/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-6 left-8 w-1 h-1 bg-warning/40 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>

        <CardContent className="flex items-center justify-between p-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="rounded-3xl bg-gradient-to-br from-warning to-warning/80 p-4 shadow-xl shadow-warning/30 animate-pulse-glow group-hover:scale-110 transition-transform duration-500">
                {icon}
              </div>
              <div className="absolute inset-0 bg-warning/30 rounded-3xl blur-2xl animate-pulse opacity-60"></div>
              {/* Electric effect */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text group-hover:from-warning group-hover:to-warning/80 transition-all duration-500">
                {title}
              </h3>
              <p className="text-base text-muted-foreground font-medium leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1 border-2 border-primary/30 hover:border-primary/60 bg-white/80 backdrop-blur-sm"
              onClick={() => handleSetupGuide(provider)}
            >
              <ExternalLink className="h-5 w-5" />
              Setup Guide
            </Button>
            <Button
              size="lg"
              className="gap-3 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:scale-105 hover:-translate-y-1 text-primary-foreground font-semibold"
              onClick={() => handleConnect(provider)}
            >
              <Zap className="h-5 w-5" />
              {connectText}
            </Button>
          </div>
        </CardContent>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-warning/50 via-warning to-warning/50 w-full"></div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderProviderCard(
        'powerbi',
        powerBIConnected,
        'Power BI Integration Required',
        'Connect your Power BI workspace to start automating report distribution with stunning visualizations',
        <BarChart3 className="h-8 w-8 text-warning-foreground drop-shadow-lg" />,
        'Connect Power BI'
      )}
      {renderProviderCard(
        'lookerstudio',
        lookerStudioConnected,
        'Google Looker Studio Integration Required',
        'Connect your Google Looker Studio to automate report distribution with powerful data visualizations',
        <BarChart3 className="h-8 w-8 text-warning-foreground drop-shadow-lg" />,
        'Connect Looker Studio'
      )}
    </div>
  );
}