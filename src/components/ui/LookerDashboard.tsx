import React from "react";

type LookerDashboardProps = {
  title?: string;
  embedUrl?: string;
  height?: number;
};

const LookerDashboard: React.FC<LookerDashboardProps> = ({
  title = "Marketing Dashboard",
  embedUrl = "https://lookerstudio.google.com/embed/reporting/d72b09f1-9b40-4479-82ba-eb3599c7efe4/page/2qMZF",
  height = 800,
}) => {
  return (
    <div
      className="rounded-xl border border-muted bg-gradient-to-br from-white to-white/60 dark:from-gray-900 dark:to-gray-900/60 shadow-sm overflow-hidden"
      style={{ width: "100%", height }}
      aria-label={title}
    >
      <div className="px-4 py-2 border-b border-muted/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <a
          href={embedUrl.replace('/embed/', '/reporting/')}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Open in Looker Studio
        </a>
      </div>
      <iframe
        title={title}
        width="100%"
        height="100%"
        src={embedUrl}
        frameBorder={0}
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default LookerDashboard;
