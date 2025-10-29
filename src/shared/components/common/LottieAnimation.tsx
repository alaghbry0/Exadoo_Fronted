/**
 * LottieAnimation Component
 * عرض Lottie animations بدون مكتبة خارجية
 * يستخدم iframe للعرض المباشر
 * 
 * @component مشترك - يستخدم في forex و indicators وأي صفحة أخرى
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const WHITE_RGBA: [number, number, number, number] = [1, 1, 1, 1];

type LottieColorValue = number[] | Record<string, any> | Array<any>;

const cloneAnimationPayload = (payload: any) =>
  JSON.parse(JSON.stringify(payload));

const matchesWhite = (value: unknown): value is number[] => {
  return (
    Array.isArray(value) &&
    value.length >= 4 &&
    value[0] === WHITE_RGBA[0] &&
    value[1] === WHITE_RGBA[1] &&
    value[2] === WHITE_RGBA[2] &&
    value[3] === WHITE_RGBA[3]
  );
};

const setAlphaTransparent = (rgba: number[]) => {
  const clone = [...rgba];
  clone[3] = 0;
  return clone;
};

const sanitizeColorKey = (colorKey: LottieColorValue): LottieColorValue => {
  if (!colorKey) {
    return colorKey;
  }

  if (matchesWhite(colorKey as number[])) {
    return setAlphaTransparent(colorKey as number[]);
  }

  if (Array.isArray(colorKey)) {
    return colorKey.map((entry) => {
      if (matchesWhite(entry)) {
        return setAlphaTransparent(entry);
      }

      if (entry && typeof entry === "object") {
        const nextEntry = { ...entry } as Record<string, any>;

        if (nextEntry.s && matchesWhite(nextEntry.s)) {
          nextEntry.s = setAlphaTransparent(nextEntry.s);
        }

        if (nextEntry.e && matchesWhite(nextEntry.e)) {
          nextEntry.e = setAlphaTransparent(nextEntry.e);
        }

        if (nextEntry.k) {
          nextEntry.k = sanitizeColorKey(nextEntry.k);
        }

        return nextEntry;
      }

      return entry;
    });
  }

  if (typeof colorKey === "object") {
    const nextKey = { ...(colorKey as Record<string, any>) };
    if (nextKey.k) {
      nextKey.k = sanitizeColorKey(nextKey.k);
    }
    if (nextKey.s && matchesWhite(nextKey.s)) {
      nextKey.s = setAlphaTransparent(nextKey.s);
    }
    if (nextKey.e && matchesWhite(nextKey.e)) {
      nextKey.e = setAlphaTransparent(nextKey.e);
    }
    return nextKey;
  }

  return colorKey;
};

const sanitizeShape = (shape: any): any => {
  if (!shape || typeof shape !== "object") {
    return shape;
  }

  const nextShape: Record<string, any> = { ...shape };

  if (nextShape.ty === "fl" || nextShape.ty === "st") {
    if (nextShape.c) {
      nextShape.c = {
        ...nextShape.c,
        k: sanitizeColorKey(nextShape.c.k ?? nextShape.c),
      };
    }
  }

  if (Array.isArray(nextShape.it)) {
    nextShape.it = sanitizeShapes(nextShape.it);
  }

  if (Array.isArray(nextShape.shapes)) {
    nextShape.shapes = sanitizeShapes(nextShape.shapes);
  }

  return nextShape;
};

const sanitizeShapes = (shapes: any[]): any[] => {
  return shapes
    .map((shape) => sanitizeShape(shape))
    .filter((shape) => shape !== null && shape !== undefined);
};

const sanitizeLayer = (layer: any): any => {
  if (!layer || typeof layer !== "object") {
    return layer;
  }

  const nextLayer: Record<string, any> = { ...layer };

  if (Array.isArray(nextLayer.shapes)) {
    nextLayer.shapes = sanitizeShapes(nextLayer.shapes);
  }

  if (Array.isArray(nextLayer.it)) {
    nextLayer.it = sanitizeShapes(nextLayer.it);
  }

  if (Array.isArray(nextLayer.layers)) {
    nextLayer.layers = sanitizeLayers(nextLayer.layers);
  }

  return nextLayer;
};

const sanitizeLayers = (layers: any[]): any[] => {
  return layers.map((layer) => sanitizeLayer(layer));
};

const sanitizeAnimationData = (data: any) => {
  const payload = cloneAnimationPayload(data);

  if (Array.isArray(payload.layers)) {
    payload.layers = sanitizeLayers(payload.layers);
  }

  if (Array.isArray(payload.assets)) {
    payload.assets = payload.assets.map((asset: any) => {
      if (asset && Array.isArray(asset.layers)) {
        return {
          ...asset,
          layers: sanitizeLayers(asset.layers),
        };
      }

      return asset;
    });
  }

  return payload;
};

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

  const sanitizedData = useMemo(() => {
    if (!animationData) {
      return null;
    }

    if (!stripBackground) {
      return animationData;
    }

    return sanitizeAnimationData(animationData);
  }, [animationData, stripBackground]);

  useEffect(() => {
    if (!sanitizedData) {
      setAnimationUrl("");
      return undefined;
    }
    // Create a Blob URL for the animation data
    const blob = new Blob([JSON.stringify(sanitizedData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    setAnimationUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sanitizedData]);

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
