/**
 * LottieAnimation Component
 * عرض Lottie animations بدون مكتبة خارجية
 * يستخدم iframe للعرض المباشر
 * 
 * @component مشترك - يستخدم في forex و indicators وأي صفحة أخرى
 */

import { useEffect, useRef, useState } from "react";

interface LottieAnimationProps {
  animationData: any;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  className = "",
  width = 300,
  height = 300,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationUrl, setAnimationUrl] = useState<string>("");

  useEffect(() => {
    // Create a Blob URL for the animation data
    const blob = new Blob([JSON.stringify(animationData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    setAnimationUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [animationData]);

  // Simple HTML to render Lottie using LottieFiles player
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; }
          lottie-player { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <lottie-player
          autoplay
          loop
          mode="normal"
          src="${animationUrl}"
        ></lottie-player>
      </body>
    </html>
  `;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      {animationUrl && (
        <iframe
          srcDoc={iframeContent}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          title="Lottie Animation"
        />
      )}
    </div>
  );
};
