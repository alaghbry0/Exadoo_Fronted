/**
 * LottieAnimation Component
 * عرض Lottie animations بدون مكتبة خارجية
 * يستخدم iframe للعرض المباشر
 * 
 * @component مشترك - يستخدم في forex و indicators وأي صفحة أخرى
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface LottieAnimationProps {
  animationData: any;
  className?: string;
  width?: number | string;
  height?: number | string;
  frameStyle?: CSSProperties;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  className = "",
  width = 300,
  height = 300,
  frameStyle,
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

  // Enhanced HTML to render Lottie with better quality and performance
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background: transparent;
          }
          lottie-player { 
            width: 100%; 
            height: 100%; 
            background: transparent;
          }
        </style>
      </head>
      <body>
        <lottie-player
          autoplay
          loop
          mode="normal"
          speed="1"
          direction="1"
          src="${animationUrl}"
          background="transparent"
          style="width: 100%; height: 100%;"
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
          allow="autoplay"
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: "transparent",
            ...frameStyle,
          }}
          title="Lottie Animation"
        />
      )}
    </div>
  );
};
