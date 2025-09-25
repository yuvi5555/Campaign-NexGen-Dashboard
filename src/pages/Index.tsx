import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Sparkles,
  Play,
  Star,
  CheckCircle,
  Globe,
  Cpu,
  Database,
  Brain,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import LookerDashboard from "@/components/ui/LookerDashboard";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard />;
    // return <LookerDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/3 via-transparent to-transparent rounded-full blur-3xl"></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-bounce-gentle" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-success/40 rounded-full animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-warning/30 rounded-full animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-primary/50 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                NextGen Dash
              </h1>
              <p className="text-xs text-muted-foreground font-medium">AI-Powered Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Beta
            </Badge>
            <Button
              onClick={() => setShowDashboard(true)}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              Enter Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Star className="h-4 w-4 fill-current" />
            Next-Generation Analytics Platform
            <Star className="h-4 w-4 fill-current" />
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-success to-warning bg-clip-text text-transparent">
              Data Intelligence
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Harness the power of machine learning algorithms for predictive analytics, anomaly detection, and smart recommendations.
            Transform raw data into actionable business insights with real-time Power BI integration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              size="lg"
              onClick={() => setShowDashboard(true)}
              className="bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg px-8 py-4 shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/50 transition-all duration-500 hover:scale-105 hover:-translate-y-1 group"
            >
              <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Launch Dashboard
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
            >
              <Globe className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transform raw data into actionable business insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Machine Learning Engine",
                description: "Advanced ML algorithms for predictive analytics, anomaly detection, and trend forecasting",
                color: "from-primary to-primary/80",
                delay: "0s"
              },
              {
                icon: TrendingUp,
                title: "Predictive Insights",
                description: "AI-powered forecasting and trend analysis with confidence intervals and recommendations",
                color: "from-success to-success/80",
                delay: "0.1s"
              },
              {
                icon: Database,
                title: "Real-time Power BI",
                description: "Seamless integration with Power BI for live data visualization and reporting",
                color: "from-warning to-warning/80",
                delay: "0.2s"
              },
              {
                icon: AlertTriangle,
                title: "Anomaly Detection",
                description: "Automatically identify unusual patterns and potential issues before they impact business",
                color: "from-destructive to-destructive/80",
                delay: "0.3s"
              },
              {
                icon: Lightbulb,
                title: "Smart Recommendations",
                description: "AI-generated actionable insights and optimization suggestions based on your data",
                color: "from-primary to-success",
                delay: "0.4s"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level encryption and role-based access control for sensitive data",
                color: "from-success to-warning",
                delay: "0.5s"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl border-0 animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-primary/5 via-transparent to-success/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10M+", label: "Data Points Processed", icon: Database },
              { number: "500+", label: "Active Users", icon: Users },
              { number: "99.9%", label: "Uptime", icon: CheckCircle },
              { number: "24/7", label: "Support", icon: Shield }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-success/20 rounded-xl flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-4xl font-display font-bold mb-2 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-success/10 border-2 border-primary/20 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
                Ready to Transform Your Data?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of organizations already using NextGen Dash to make data-driven decisions
                with confidence and speed.
              </p>
              <Button
                size="lg"
                onClick={() => setShowDashboard(true)}
                className="bg-gradient-to-r from-primary via-primary to-success hover:from-primary/90 hover:to-success/90 text-lg px-12 py-4 shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-500 hover:scale-105 hover:-translate-y-1 group"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-display font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              NextGen Dash
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 NextGen Dash. Empowering businesses with AI-driven analytics.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
