/**
 * LottieAnimation Component
 * عرض Lottie animations بدون مكتبة خارجية
 * يستخدم مكتبة lottie-web للرسم داخل DOM
 * 
 * @component مشترك - يستخدم في forex و indicators وأي صفحة أخرى
 */

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { AnimationEventName, AnimationItem } from "lottie-web";

const WHITE_RGBA: [number, number, number, number] = [1, 1, 1, 1];
const WHITE_RGBA_255: [number, number, number, number] = [255, 255, 255, 255];

type LottieColorValue = number[] | Record<string, any> | Array<any>;

const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isApproximately = (value: number, target: number, tolerance = 1e-3) => {
  return Math.abs(value - target) <= tolerance;
};

const componentIsWhite = (component: number) => {
  if (!isNumber(component)) {
    return false;
  }

  if (component > 1) {
    return isApproximately(component, 255, 0.5);
  }

  return component >= 0.99;
};

const componentIsOpaque = (component: number) => {
  if (!isNumber(component)) {
    return false;
  }

  if (component > 1) {
    if (component <= 100) {
      return component >= 99;
    }

    return component >= 254.5;
  }

  return component >= 0.99;
};

const cloneAnimationPayload = <T,>(payload: T): T => {
  const structuredCloneFn = (
    globalThis as typeof globalThis & {
      structuredClone?: <Value,>(value: Value) => Value;
    }
  ).structuredClone;

  if (typeof structuredCloneFn === "function") {
    return structuredCloneFn(payload);
  }

  return JSON.parse(JSON.stringify(payload));
};

const sanitizedAnimationCache = new WeakMap<object, any>();

const matchesWhite = (value: unknown): value is number[] => {
  if (!Array.isArray(value) || value.length < 3) {
    return false;
  }

  const normalized = [...value];

  if (normalized.length === 3) {
    normalized.push(1);
  }

  const [r, g, b, a] = normalized;

  return (
    (componentIsWhite(r) && componentIsWhite(g) && componentIsWhite(b) && componentIsOpaque(a)) ||
    (Array.isArray(value) &&
      value.length >= 4 &&
      ((value[0] === WHITE_RGBA[0] &&
        value[1] === WHITE_RGBA[1] &&
        value[2] === WHITE_RGBA[2] &&
        value[3] === WHITE_RGBA[3]) ||
        (value[0] === WHITE_RGBA_255[0] &&
          value[1] === WHITE_RGBA_255[1] &&
          value[2] === WHITE_RGBA_255[2] &&
          value[3] === WHITE_RGBA_255[3]))
    )
  );
};

const setAlphaTransparent = (rgba: number[]) => {
  const clone = [...rgba];

  if (clone.length >= 4) {
    clone[3] = 0;
  } else {
    clone.push(0);
  }

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
    if (Array.isArray(nextShape.c)) {
      nextShape.c = sanitizeColorKey(nextShape.c);
    } else if (nextShape.c && typeof nextShape.c === "object") {
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

  let sanitizedShapes: any[] | undefined;
  if (Array.isArray(nextLayer.shapes)) {
    sanitizedShapes = sanitizeShapes(nextLayer.shapes);
    nextLayer.shapes = sanitizedShapes;
  }

  if (layer.ty === 1) {
    const solidColor = typeof layer.sc === "string" ? layer.sc.toLowerCase() : "";

    if (solidColor === "#fff" || solidColor === "#ffffff") {
      return null;
    }

    if (Array.isArray(sanitizedShapes) && sanitizedShapes.length === 0) {
      return null;
    }

    const opacityKey = nextLayer?.ks?.o;
    if (opacityKey && typeof opacityKey === "object") {
      if (typeof opacityKey.k === "number" && componentIsOpaque(opacityKey.k)) {
        nextLayer.ks = {
          ...nextLayer.ks,
          o: {
            ...opacityKey,
            k: 0,
          },
        };
      } else if (Array.isArray(opacityKey.k)) {
        nextLayer.ks = {
          ...nextLayer.ks,
          o: {
            ...opacityKey,
            k: opacityKey.k.map((entry: any) => {
              if (entry && typeof entry === "object" && componentIsOpaque(entry.s?.[0])) {
                return {
                  ...entry,
                  s: [0],
                };
              }
              return entry;
            }),
          },
        };
      }
    }
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
  return layers
    .map((layer) => sanitizeLayer(layer))
    .filter((layer) => layer !== null && layer !== undefined);
};

const sanitizeAnimationData = (data: any) => {
  if (!data || typeof data !== "object") {
    return data;
  }

  const cached = sanitizedAnimationCache.get(data as object);
  if (cached) {
    return cached;
  }

  const payload = cloneAnimationPayload(data);

  if (Array.isArray(payload.assets)) {
    payload.assets = payload.assets.map((asset: any) => {
      if (!asset || typeof asset !== "object") {
        return asset;
      }

      const nextAsset: Record<string, any> = { ...asset };

      if (Array.isArray(nextAsset.layers)) {
        nextAsset.layers = sanitizeLayers(nextAsset.layers);
      }

      return nextAsset;
    });
  }

  if (Array.isArray(payload.layers)) {
    payload.layers = sanitizeLayers(payload.layers);
  }

  if (Array.isArray(payload.assets)) {
    const assetsById = new Map<string, any>();

    payload.assets.forEach((asset: any) => {
      if (asset && typeof asset === "object" && typeof asset.id === "string") {
        assetsById.set(asset.id, asset);
      }
    });

    const ensurePrecompSanitized = (layer: any) => {
      if (!layer || typeof layer !== "object") {
        return;
      }

      if (typeof layer.refId === "string" && assetsById.has(layer.refId)) {
        const targetAsset = assetsById.get(layer.refId);

        if (targetAsset && Array.isArray(targetAsset.layers)) {
          targetAsset.layers = sanitizeLayers(targetAsset.layers);
        }
      }

      if (Array.isArray(layer.layers)) {
        layer.layers = sanitizeLayers(layer.layers);
      }
    };

    if (Array.isArray(payload.layers)) {
      payload.layers.forEach((layer: any) => ensurePrecompSanitized(layer));
    }

    payload.assets.forEach((asset: any) => {
      if (Array.isArray(asset.layers)) {
        asset.layers.forEach((layer: any) => ensurePrecompSanitized(layer));
      }
    });
  }

  sanitizedAnimationCache.set(data as object, payload);

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
  const hostRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

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
    if (typeof window === "undefined") {
      return;
    }

    let teardownListeners: (() => void) | null = null;

    const cleanupInstance = () => {
      if (teardownListeners) {
        teardownListeners();
        teardownListeners = null;
      }

      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }

      if (hostRef.current) {
        hostRef.current.innerHTML = "";
        hostRef.current.style.background = "transparent";
      }
    };

    if (!sanitizedData || !hostRef.current) {
      cleanupInstance();
      return;
    }

    let isActive = true;

    void import("lottie-web").then(({ default: lottie }) => {
      if (!isActive || !hostRef.current) {
        return;
      }

      cleanupInstance();

      const instance = lottie.loadAnimation({
        container: hostRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: sanitizedData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          clearCanvas: true,
          progressiveLoad: true,
          hideOnTransparent: true,
        },
      });

      animationRef.current = instance;

      const enforceTransparency = () => {
        const host = hostRef.current;
        if (!host) {
          return;
        }

        host.style.background = "transparent";

        if (!stripBackground) {
          return;
        }

        host.querySelectorAll<HTMLElement>("*").forEach((element) => {
          if (!element.style) {
            return;
          }

          if (element.style.fill && element.style.fill.includes("255, 255, 255")) {
            element.style.fill = "transparent";
          }

          if (element.style.stroke && element.style.stroke.includes("255, 255, 255")) {
            element.style.stroke = "transparent";
          }

          if (
            element.style.background &&
            element.style.background.includes("255, 255, 255")
          ) {
            element.style.background = "transparent";
          }

          if (
            element.style.backgroundColor &&
            element.style.backgroundColor.includes("255, 255, 255")
          ) {
            element.style.backgroundColor = "transparent";
          }
        });
      };

      const events: AnimationEventName[] = [
        "config_ready",
        "data_ready",
        "DOMLoaded",
        "loopComplete",
      ];

      events.forEach((eventName) => {
        instance.addEventListener(eventName, enforceTransparency);
      });

      teardownListeners = () => {
        events.forEach((eventName) => {
          instance.removeEventListener(eventName, enforceTransparency);
        });
      };

      enforceTransparency();
    });

    return () => {
      isActive = false;
      cleanupInstance();
    };
  }, [sanitizedData, stripBackground]);

  return (
    <div
      className={className}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        backgroundColor: "transparent",
      }}
    >
      <div
        ref={hostRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          ...frameStyle,
        }}
      />
    </div>
  );
};
