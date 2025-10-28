/**
 * Error Boundary Component
 * يلتقط الأخطاء في React tree ويعرض UI بديل
 */
"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";
import { colors, componentRadius, shadowClasses, withAlpha } from "@/styles/tokens";
import logger from "@/infrastructure/logging/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught an error:", error);
    logger.error("Error Info:", errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // يمكن إرسال الخطأ إلى خدمة مراقبة (Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  private reportError(_error: Error, _errorInfo: React.ErrorInfo) {
    // TODO: دمج مع خدمة مراقبة الأخطاء
    // Sentry.captureException(_error, { contexts: { react: _errorInfo } })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: colors.bg.secondary }}
        >
          <Card
            className={cn(
              "max-w-lg w-full border",
              componentRadius.card,
              shadowClasses.card,
            )}
            style={{ borderColor: withAlpha(colors.status.error, 0.4) }}
          >
            <CardContent
              className="p-8 text-center"
              style={{ color: colors.text.secondary, backgroundColor: colors.bg.elevated }}
            >
              <div className="mb-6 flex justify-center">
                <div
                  className={cn("w-20 h-20 flex items-center justify-center", componentRadius.badge)}
                  style={{ backgroundColor: colors.status.errorBg }}
                >
                  <AlertTriangle
                    className="w-10 h-10"
                    style={{ color: colors.status.error }}
                  />
                </div>
              </div>

              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: colors.text.primary }}
              >
                عذراً، حدث خطأ غير متوقع
              </h2>

              <p className="mb-6 leading-relaxed">
                نعتذر عن الإزعاج. حدث خطأ أثناء عرض هذه الصفحة. يرجى المحاولة
                مرة أخرى.
              </p>

              {this.props.showDetails && this.state.error && (
                <details
                  className="mb-6 text-right p-4"
                  style={{
                    backgroundColor: colors.status.errorBg,
                    borderRadius: "0.75rem",
                  }}
                >
                  <summary
                    className="cursor-pointer font-semibold mb-2"
                    style={{ color: colors.status.error }}
                  >
                    تفاصيل تقنية
                  </summary>
                  <pre
                    className="text-xs overflow-auto max-h-40"
                    style={{ color: colors.status.error }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="gap-2"
                  variant="outline"
                >
                  <Home className="w-4 h-4" />
                  العودة للرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC لتغليف المكونات بـ Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
