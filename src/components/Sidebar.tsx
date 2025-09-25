import {
  BarChart3,
  Users,
  Settings,
  Calendar,
  Mail,
  Activity,
  FileText,
  Home,
  Brain,
  Cpu,
  History,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onHomeClick?: () => void;
}

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'insights', label: 'AI Insights', icon: Brain },
  { id: 'training', label: 'Model Training', icon: Cpu },
  { id: 'history', label: 'Prediction History', icon: History },
  { id: 'features', label: 'Feature Engineering', icon: Layers },
  { id: 'powerbi', label: 'Power BI', icon: BarChart3 },
  { id: 'lookerdashboard', label: 'Looker Studio', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'distribution', label: 'Distribution Lists', icon: Users },
  { id: 'schedule', label: 'Scheduling', icon: Calendar },
  { id: 'emails', label: 'Email History', icon: Mail },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange, onHomeClick }: SidebarProps) {
  return (
    <div className="w-72 h-screen bg-gradient-to-br from-white/95 via-white/80 to-white/60 dark:from-gray-900/95 dark:via-gray-900/80 dark:to-gray-900/60 border-r-2 border-primary/10 flex flex-col backdrop-blur-2xl shadow-2xl">
      <div className="p-8 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="relative group">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-xl shadow-primary/20 animate-float group-hover:scale-110 transition-transform duration-500">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse opacity-60"></div>
            {/* Floating particles */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
              NextGen Dash
            </h1>
            <p className="text-sm text-muted-foreground font-semibold tracking-wide">
              AI-Powered Analytics
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6">
        <ul className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <button
                  onClick={() => item.id === 'home' ? onHomeClick?.() : onSectionChange(item.id)}
                  className={cn(
                    "w-full text-left px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-500 flex items-center gap-4 group relative overflow-hidden shadow-lg",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 transform scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:shadow-xl hover:shadow-primary/10 hover:transform hover:scale-105 hover:-translate-y-1"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary-foreground/20"
                      : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive ? "text-primary-foreground" : "text-primary group-hover:scale-110"
                    )} />
                  </div>
                  <span className="font-semibold tracking-wide">{item.label}</span>
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-in-right"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground/60 rounded-r-full"></div>
                    </>
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom accent */}
      <div className="p-6 border-t border-primary/10 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="text-center">
          <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}