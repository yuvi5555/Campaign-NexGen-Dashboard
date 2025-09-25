import React from "react";

type PowerBIEmbedProps = {
  title?: string;
  embedUrl: string;
  height?: number;
};

const PowerBIEmbed: React.FC<PowerBIEmbedProps> = ({
  title = "Power BI Report",
  embedUrl,
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
          href={embedUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Open in Power BI
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
      />
    </div>
  );
};

export default PowerBIEmbed;


