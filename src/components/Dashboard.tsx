import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { DashboardCards } from "./DashboardCards";
import { RecentActivity } from "./RecentActivity";
import { DistributionTable } from "./DistributionTable";
import { ReportSchedule } from "./ReportSchedule";
import { IntegrationBanner } from "./IntegrationBanner";
import { MLInsights } from "./MLInsights";
import { ModelTraining } from "./ModelTraining";
import { PredictionHistory } from "./PredictionHistory";
import { FeatureEngineering } from "./FeatureEngineering";
import { BIProviderSelector } from "./BIProviderSelector";
import LookerDashboard from "./ui/LookerDashboard";
import PowerBIEmbed from "./ui/PowerBIEmbed";

type BIProvider = 'powerbi' | 'lookerstudio';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedBIProvider, setSelectedBIProvider] = useState<BIProvider>('powerbi');

  const handleHomeClick = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8 animate-fade-in">
            <IntegrationBanner onConnectLookerStudio={() => setActiveSection("lookerdashboard")} />
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                Dashboard
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Monitor your automated report distribution system
              </p>
            </div>
            <DashboardCards />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div>
                <ReportSchedule provider={selectedBIProvider} />
              </div>
            </div>
          </div>
        );
      case "insights":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-primary via-success to-warning bg-clip-text text-transparent">
                AI Insights
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Machine learning-powered analytics and predictions
              </p>
            </div>
            <MLInsights />
          </div>
        );
      case "training":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
                Model Training
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Train, evaluate, and manage your ML models
              </p>
            </div>
            <ModelTraining />
          </div>
        );
      case "history":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Prediction History
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Track prediction accuracy and model performance over time
              </p>
            </div>
            <PredictionHistory />
          </div>
        );
      case "features":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Feature Engineering
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Explore and understand the features used in ML models
              </p>
            </div>
            <FeatureEngineering />
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Reports</h2>
              <p className="text-muted-foreground">
                Manage your {selectedBIProvider === 'powerbi' ? 'Power BI' : 'Google Looker Studio'} reports and configurations
              </p>
            </div>
            <ReportSchedule provider={selectedBIProvider} />
          </div>
        );
      case "distribution":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Distribution Lists</h2>
              <p className="text-muted-foreground">
                Manage email distribution lists and recipients
              </p>
            </div>
            <DistributionTable provider={selectedBIProvider} />
          </div>
        );
      case "schedule":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Scheduling</h2>
              <p className="text-muted-foreground">
                Configure automated report delivery schedules
              </p>
            </div>
            <ReportSchedule provider={selectedBIProvider} />
          </div>
        );
      case "emails":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Email History</h2>
              <p className="text-muted-foreground">
                View sent emails and delivery status
              </p>
            </div>
            <RecentActivity />
          </div>
        );
      case "activity":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Activity Log</h2>
              <p className="text-muted-foreground">
                Track all system activities and events
              </p>
            </div>
            <RecentActivity />
          </div>
        );
      case "lookerdashboard":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                Looker Studio Dashboard
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                View your embedded Looker Studio reports
              </p>
            </div>
            <LookerDashboard />
          </div>
        );
      case "powerbi":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                Power BI Dashboard
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                View your embedded Power BI reports
              </p>
            </div>
            <PowerBIEmbed embedUrl="https://app.powerbi.com/embed-url-1" />
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Settings</h2>
              <p className="text-muted-foreground">
                Configure system preferences and integrations
              </p>
            </div>
            <BIProviderSelector
              selectedProvider={selectedBIProvider}
              onProviderChange={setSelectedBIProvider}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onHomeClick={handleHomeClick}
      />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-8 space-y-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}