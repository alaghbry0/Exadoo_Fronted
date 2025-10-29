declare module "lottie-web" {
  export type AnimationEventName =
    | "complete"
    | "loopComplete"
    | "enterFrame"
    | "segmentStart"
    | "config_ready"
    | "data_ready"
    | "DOMLoaded"
    | "destroy";

  export interface AnimationItem {
    destroy(): void;
    addEventListener(event: AnimationEventName, callback: () => void): void;
    removeEventListener(event: AnimationEventName, callback: () => void): void;
  }

  export interface RendererSettings {
    preserveAspectRatio?: string;
    clearCanvas?: boolean;
    progressiveLoad?: boolean;
    hideOnTransparent?: boolean;
  }

  export interface AnimationConfigWithData {
    container: Element;
    renderer?: "svg" | "canvas" | "html";
    loop?: boolean | number;
    autoplay?: boolean;
    animationData: unknown;
    rendererSettings?: RendererSettings;
  }

  export interface LottiePlayer {
    loadAnimation(config: AnimationConfigWithData): AnimationItem;
  }

  const lottie: LottiePlayer;
  export default lottie;
}
