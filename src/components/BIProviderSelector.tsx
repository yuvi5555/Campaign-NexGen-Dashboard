import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import { isAuthenticated as isPowerBIAuthenticated } from "@/lib/powerbi";
import { isAuthenticated as isLookerStudioAuthenticated } from "@/lib/looker-studio";

type BIProvider = 'powerbi' | 'lookerstudio';

interface BIProviderSelectorProps {
  selectedProvider: BIProvider;
  onProviderChange: (provider: BIProvider) => void;
}

export function BIProviderSelector({ selectedProvider, onProviderChange }: BIProviderSelectorProps) {
  const [powerBIConnected, setPowerBIConnected] = useState(false);
  const [lookerStudioConnected, setLookerStudioConnected] = useState(false);

  useEffect(() => {
    setPowerBIConnected(isPowerBIAuthenticated());
    setLookerStudioConnected(isLookerStudioAuthenticated());
  }, []);

  const providers = [
    {
      id: 'powerbi' as BIProvider,
      name: 'Power BI',
      description: 'Microsoft Power BI for enterprise analytics',
      icon: BarChart3,
      connected: powerBIConnected,
      color: 'bg-blue-500'
    },
    {
      id: 'lookerstudio' as BIProvider,
      name: 'Google Looker Studio',
      description: 'Google\'s free data visualization tool',
      icon: BarChart3,
      connected: lookerStudioConnected,
      color: 'bg-green-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          BI Tool Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose your preferred business intelligence tool for report generation and distribution.
        </p>

        <div className="grid gap-4">
          {providers.map((provider) => {
            const Icon = provider.icon;
            const isSelected = selectedProvider === provider.id;

            return (
              <div
                key={provider.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-primary/2'
                }`}
                onClick={() => onProviderChange(provider.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${provider.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={provider.connected ? "default" : "secondary"} className="flex items-center gap-1">
                      {provider.connected ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Not Connected
                        </>
                      )}
                    </Badge>

                    {isSelected && (
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Note: You can connect multiple BI tools. The selected tool will be used for new reports and schedules.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}