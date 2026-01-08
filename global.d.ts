interface Window {
  kofiWidgetOverlay?: {
    draw: (username: string, options: Record<string, string>) => void;
  };
}
