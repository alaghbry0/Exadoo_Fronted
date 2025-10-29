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
  stripBackground?: boolean;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  className = "",
  width = 300,
  height = 300,
  frameStyle,
  stripBackground = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationUrl, setAnimationUrl] = useState<string>("");

  useEffect(() => {
    if (!animationData) {
      setAnimationUrl("");
      return undefined;
    }
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
  const transparencyScript = stripBackground
    ? `
        <script>
          const ensureTransparent = (player) => {
            if (!player) {
              return;
            }

            const setTransparent = (node) => {
              if (!node || !node.style) {
                return;
              }

              if (node.style.background && node.style.background.includes("255, 255, 255")) {
                node.style.background = "transparent";
              }

              if (node.style.backgroundColor && node.style.backgroundColor.includes("255, 255, 255")) {
                node.style.backgroundColor = "transparent";
              }

              const computed = window.getComputedStyle(node);
              if (computed && computed.backgroundColor === "rgb(255, 255, 255)") {
                node.style.background = "transparent";
                node.style.backgroundColor = "transparent";
              }
            };

            const apply = () => {
              try {
                setTransparent(player);
                player.style.background = "transparent";

                if (player.shadowRoot) {
                  player.shadowRoot.querySelectorAll('*').forEach((el) => {
                    setTransparent(el);
                  });
                }
              } catch (error) {
                // Ignore shadow DOM access errors
              }
            };

            apply();

            ["load", "ready", "rendered"].forEach((eventName) => {
              player.addEventListener(eventName, apply);
            });

            if (window.MutationObserver) {
              const observer = new MutationObserver(() => apply());
              observer.observe(player, { attributes: true, childList: true, subtree: true });
            }
          };

          window.addEventListener("DOMContentLoaded", () => {
            const player = document.querySelector("lottie-player");
            ensureTransparent(player);
          });
        </script>
      `
    : "";

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
            background: transparent !important;
          }
          lottie-player {
            width: 100%;
            height: 100%;
            background: transparent !important;
          }
          lottie-player::part(container) {
            background: transparent !important;
          }
          lottie-player::part(animation) {
            background: transparent !important;
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
        ${transparencyScript}
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
        backgroundColor: "transparent",
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
